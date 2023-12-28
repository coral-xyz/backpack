import type {
  AutolockSettingsOption,
  Blockchain,
  LedgerKeyringInit,
  MnemonicKeyringInit,
  PrivateKeyKeyringInit,
  WalletDescriptor,
} from "@coral-xyz/common";
import { IS_MOBILE } from "@coral-xyz/common";
import { secureStore } from "@coral-xyz/secure-background/legacyExport";
import { generateMnemonic } from "bip39";

import { NotificationsClient } from "../../background-clients/NotificationsClient";
import {
  DEFAULT_AUTO_LOCK_INTERVAL_SECS,
  defaultPreferences,
} from "../../blockchain-configs/preferences";
import { hdFactoryForBlockchain, keyringForBlockchain } from "../../keyring";
import type { BlockchainKeyring } from "../../keyring/blockchain";
import { UserClient } from "../../services/user/client";
import { KeyringStoreState } from "../../types/keyring";
import type {
  TransportBroadcaster,
  TransportSender,
} from "../../types/transports";
import type {
  KeyringStoreJson,
  SecureStore,
  User,
  UserKeyringJson,
  UserPublicKeyStore,
} from "../SecureStore";

export type KeyringTypes =
  | "hdPublicKeys"
  | "importedPublicKeys"
  | "ledgerPublicKeys";

export type UserPublicKeys = Record<
  Blockchain,
  Record<KeyringTypes, Array<string>>
>;

/**
 * KeyringStore API for managing all wallet keys .
 */
export class KeyringStore {
  private lastUsedTs: number;
  private password?: string;

  // TODO: remove autoLockCountdown on mobile using a .native.ts file instead
  private autoLockCountdown?: {
    start: () => void;
    restart: () => void;
    toggle: (enabled: boolean) => void;
  };

  private notification: NotificationsClient;
  private userClient: UserClient;
  private store: SecureStore;
  private users: Map<string, UserKeyring>;

  ///////////////////////////////////////////////////////////////////////////////
  // Getters.
  ///////////////////////////////////////////////////////////////////////////////

  async activeUserKeyring(): Promise<UserKeyring> {
    const activeUser = await this.store.getActiveUser();

    if (!activeUser) {
      throw new Error("invariant violation: activeUserUuid is undefined");
    }

    const unlockResponse = await this.userClient.unlockKeyring();

    if (unlockResponse.error) {
      throw new Error(unlockResponse.error.message);
    }

    const keyring = this.users.get(activeUser.uuid);

    if (!keyring) {
      throw new Error("invariant violation: activeUserKeyring not found");
    }
    return keyring;
  }

  public getUserKeyring(uuid: string): UserKeyring {
    const userKeyring = this.users.get(uuid);
    if (!userKeyring) {
      throw new Error("invariant violation: UserKeyring not found");
    }
    return userKeyring;
  }

  public exportKeyringStore(): string {
    return JSON.stringify(this.toJson(), null, 2);
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Initialization.
  ///////////////////////////////////////////////////////////////////////////////

  constructor(
    notificationBroadcaster: TransportBroadcaster,
    backgroundTransportSender: TransportSender,
    store: SecureStore
  ) {
    this.users = new Map();
    this.lastUsedTs = 0;
    this.notification = new NotificationsClient(notificationBroadcaster);
    this.userClient = new UserClient(backgroundTransportSender);
    this.store = store;

    this.autoLockCountdown = IS_MOBILE
      ? undefined
      : (() => {
          let autoLockCountdownTimer: ReturnType<typeof setTimeout>;

          let secondsUntilAutoLock: number | undefined;
          let autoLockIsEnabled = true;

          let shouldLockImmediatelyWhenClosed = false;
          let lockImmediatelyWhenClosedCountdown: ReturnType<typeof setTimeout>;
          const SECONDS_UNTIL_LOCK_WHEN_CLOSED = 0.5;

          const lock = () => {
            if (!autoLockIsEnabled) return;
            this.lock();
          };

          const startAutoLockCountdownTimer = () => {
            stopAutoLockCountdownTimer();
            stopLockWhenClosedCountdownTimer();
            if (!secondsUntilAutoLock || !autoLockIsEnabled) return;
            autoLockCountdownTimer = setTimeout(
              lock,
              secondsUntilAutoLock * 1000
            );
          };

          const stopAutoLockCountdownTimer = () => {
            if (autoLockCountdownTimer) clearTimeout(autoLockCountdownTimer);
          };

          const stopLockWhenClosedCountdownTimer = () => {
            if (lockImmediatelyWhenClosedCountdown)
              clearTimeout(lockImmediatelyWhenClosedCountdown);
          };

          globalThis.chrome?.runtime?.onConnect.addListener((port) => {
            port.onDisconnect.addListener(() => {
              // Force-enable the auto-lock countdown if the popup is closed
              autoLockIsEnabled = true;
              if (shouldLockImmediatelyWhenClosed) {
                lockImmediatelyWhenClosedCountdown = setTimeout(() => {
                  stopAutoLockCountdownTimer();
                  lock();
                }, SECONDS_UNTIL_LOCK_WHEN_CLOSED * 1000);
              } else {
                startAutoLockCountdownTimer();
              }
            });
          });

          return {
            start: () => {
              // Get the auto-lock interval from the
              // user's preferences and start the countdown timer.
              this.store
                .getActiveUser()
                .then((activeUser) =>
                  this.store.getWalletDataForUser(activeUser.uuid)
                )
                .then(({ autoLockSettings, autoLockSecs }) => {
                  switch (autoLockSettings?.option) {
                    case "never":
                      shouldLockImmediatelyWhenClosed = false;
                      secondsUntilAutoLock = undefined;
                      break;
                    case "onClose":
                      shouldLockImmediatelyWhenClosed = true;
                      secondsUntilAutoLock = undefined;
                      break;
                    default:
                      shouldLockImmediatelyWhenClosed = false;
                      secondsUntilAutoLock =
                        // Try to use read the new style (>0.4.0) value first
                        autoLockSettings?.seconds ||
                        // if that doesn't exist check for a legacy (<=0.4.0) value
                        autoLockSecs ||
                        // otherwise fall back to the default value
                        DEFAULT_AUTO_LOCK_INTERVAL_SECS;
                  }
                  startAutoLockCountdownTimer();
                })
                .catch((e) => console.error(e));
            },
            restart: () => {
              // Reset the countdown timer and start it again.
              startAutoLockCountdownTimer();
            },
            toggle: (enabled: boolean) => {
              autoLockIsEnabled = enabled;
              startAutoLockCountdownTimer();
            },
          };
        })();
  }

  // Initializes the keystore for the first time.
  public async init(
    username: string,
    password: string,
    keyringInit:
      | MnemonicKeyringInit
      | LedgerKeyringInit
      | PrivateKeyKeyringInit,
    uuid: string
  ) {
    this.password = password;

    // Setup the user.
    await this._usernameKeyringCreate(username, keyringInit, uuid);

    // Persist the encrypted data to then store.
    await this.persist(true);

    // Automatically lock the store when idle.
    this.lock();
    await this.tryUnlock({ password, uuid });
  }

  public userCount(): number {
    return this.users.size;
  }

  public async usernameKeyringCreate(
    username: string,
    keyringInit:
      | MnemonicKeyringInit
      | LedgerKeyringInit
      | PrivateKeyKeyringInit,
    uuid: string
  ) {
    return await this.withUnlockAndPersist(async () => {
      return await this._usernameKeyringCreate(username, keyringInit, uuid);
    });
  }

  private async _usernameKeyringCreate(
    username: string,
    keyringInit:
      | MnemonicKeyringInit
      | LedgerKeyringInit
      | PrivateKeyKeyringInit,
    uuid: string
  ) {
    // Store unlocked keyring in memory.
    // Persist active user to disk.
    await this.store.setActiveUser({
      username,
      uuid,
      hasMnemonic: "mnemonic" in keyringInit,
    });
    try {
      this.users.set(
        uuid,
        await UserKeyring.init(username, keyringInit, uuid, this.store)
      );

      // Per user preferences.
      await this.store.setWalletDataForUser(uuid, defaultPreferences());
    } catch (e) {
      // remove user if something when wrong
      this.users.delete(uuid);
      await this.store.setUserPublicKeys(uuid, null);
      await this.store.setWalletDataForUser(uuid, undefined);
      await this.store.setUser(uuid, null);
      throw e;
    }
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Internal state machine queries.
  ///////////////////////////////////////////////////////////////////////////////

  public async state(): Promise<KeyringStoreState> {
    if (await this.isUnlocked()) {
      return KeyringStoreState.Unlocked;
    }
    if (await this.isLocked()) {
      return KeyringStoreState.Locked;
    }
    return KeyringStoreState.NeedsOnboarding;
  }

  private async isLocked(): Promise<boolean> {
    if (await this.isUnlocked()) {
      return false;
    }
    return await this.store.doesCiphertextExist();
  }

  private async isUnlocked(): Promise<boolean> {
    try {
      const activeUser = await this.store.getActiveUser();
      return !!this.users.get(activeUser.uuid);
      // this.activeUserUuid !== undefined &&
      // (await this.activeUserKeyring()).blockchains.size > 0 &&
      // this.lastUsedTs !== 0
    } catch (_) {
      return false;
    }
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Actions.
  ///////////////////////////////////////////////////////////////////////////////

  /**
   * Returns true if the active user was removed (and thus chanaged).
   */
  public async removeUser(uuid: string): Promise<boolean> {
    return this.userClient.unlockKeyring().then(() =>
      this.withUnlockAndPersist(async () => {
        const activeUser = await this.store.getActiveUser();

        this.users.delete(uuid);
        await this.store.setWalletDataForUser(uuid, undefined);
        await this.store.setUserPublicKeys(uuid, null);
        const userData = await this.store.getUserData();
        const users = userData.users.filter((user) => user.uuid !== uuid);
        const newActiveUser =
          userData.activeUser.uuid === uuid ? users[0] : userData.activeUser;
        await this.store.setUserData({
          activeUser: newActiveUser,
          users,
        });

        return activeUser.uuid !== newActiveUser.uuid;
      })
    );
  }

  public async tryUnlock(userInfo: { password: string; uuid: string }) {
    return this.withLock(async () => {
      const json = await this.store.getKeyringStore(userInfo);
      await this.fromJson(json);

      this.password = userInfo.password;
      // Automatically lock the store when idle.
      // this.autoLockStart();
      this.autoLockCountdown?.start();
    });
  }

  /**
   * Check if a password is valid by attempting to decrypt the stored keyring.
   */
  public async checkPassword(password: string): Promise<boolean> {
    return this.store.checkPassword(password);
  }

  public lock() {
    this.users = new Map();
    this.lastUsedTs = 0;
    this.notification.userUpdated();
  }

  // Preview public keys for a given mnemonic and derivation path without
  // importing the mnemonic.
  public async previewPubkeys(
    blockchain: Blockchain,
    mnemonic: string | true,
    derivationPaths: Array<string>
  ): Promise<string[]> {
    const factory = hdFactoryForBlockchain(blockchain);
    if (mnemonic === true) {
      // Read the mnemonic from the store
      return await this.withUnlock(async () => {
        mnemonic = (await this.activeUserKeyring()).exportMnemonic();
        return factory.init(mnemonic, derivationPaths).publicKeys();
      });
    } else {
      return factory.init(mnemonic, derivationPaths).publicKeys();
    }
  }

  public reset() {
    // First lock to clear the keyring memory.
    this.lock();
    // Then reset persistent disk storage.
    return this.store.reset();
  }

  public async passwordUpdate(currentPassword: string, newPassword: string) {
    return this.withPasswordAndPersist(currentPassword, () => {
      this.password = newPassword;
    });
  }

  /**
   * Create a random mnemonic.
   */
  public createMnemonic(strength: number): string {
    return generateMnemonic(strength);
  }

  public async activeUserUpdate(uuid: string): Promise<User> {
    const userData = await this.store.getUserData();
    const user = userData.users.find((u) => u.uuid === uuid)!;
    await this.store.setActiveUser(user);
    return user;
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Locking methods methods
  ///////////////////////////////////////////////////////////////////////////////

  public async autoLockSettingsUpdate(
    seconds?: number,
    option?: AutolockSettingsOption
  ) {
    return await this.withUnlock(async () => {
      const activeUser = await this.store.getActiveUser();
      const data = await this.store.getWalletDataForUser(activeUser.uuid);
      await this.store.setWalletDataForUser(activeUser.uuid, {
        ...data,
        autoLockSettings: {
          seconds,
          option,
        },
      });

      this.autoLockCountdown?.start();
    });
  }

  public keepAlive() {
    return this.withUnlock(() => {});
  }

  public autoLockCountdownToggle(enable: boolean) {
    this.autoLockCountdown?.toggle(enable);
  }

  public autoLockCountdownRestart() {
    this.autoLockCountdown?.restart();
  }

  public autoLockCountdownReset() {
    this.autoLockCountdown?.start();
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Passes through to the active username keyring.
  ///////////////////////////////////////////////////////////////////////////////

  /**
   * Initialise a blockchain keyring.
   */
  public async blockchainKeyringAdd(
    blockchain: Blockchain,
    keyringInit:
      | MnemonicKeyringInit
      | LedgerKeyringInit
      | PrivateKeyKeyringInit,
    persist = true
  ): Promise<void> {
    await (
      await this.activeUserKeyring()
    ).blockchainKeyringAdd(blockchain, keyringInit);
    if (persist) {
      await this.persist();
    }
  }

  /**
   * Remove a keyring. This shouldn't be exposed to the client as it can
   * use the blockchain disable method to soft remove a keyring and still be
   * able to enable it later without any reonboarding (signatures, etc). It
   * is used by the backend to revert state changes for non atomic call
   * sequences.
   */
  public async blockchainKeyringRemove(
    blockchain: Blockchain,
    persist = true
  ): Promise<void> {
    await (await this.activeUserKeyring()).blockchainKeyringRemove(blockchain);
    if (persist) {
      await this.persist();
    }
  }

  // Import a secret key for the given blockchain.
  // TODO handle initialisation, allow init blockchain without mnemonic?
  public async importSecretKey(
    blockchain: Blockchain,
    secretKey: string,
    name: string
  ): Promise<[string, string]> {
    return await this.withUnlockAndPersist(async () => {
      return await (
        await this.activeUserKeyring()
      ).importSecretKey(blockchain, secretKey, name);
    });
  }

  public async nextDerivationPath(
    blockchain: Blockchain,
    keyring: "hd" | "ledger"
  ): Promise<{ derivationPath: any; offset: number }> {
    return await this.withUnlock(async () => {
      return (await this.activeUserKeyring()).nextDerivationPath(
        blockchain,
        keyring
      );
    });
  }

  public async addDerivationPath(
    blockchain: Blockchain,
    derivationPath: string
  ): Promise<{ publicKey: string; name: string }> {
    return await this.withUnlockAndPersist(async () => {
      return (await this.activeUserKeyring()).addDerivationPath(
        blockchain,
        derivationPath
      );
    });
  }

  // Derive the next key for the given blockchain.
  public async deriveNextKey(
    blockchain: Blockchain
  ): Promise<{ publicKey: string; derivationPath: string; name: string }> {
    return await this.withUnlockAndPersist(async () => {
      return await (await this.activeUserKeyring()).deriveNextKey(blockchain);
    });
  }

  public async keyDelete(blockchain: Blockchain, publicKey: string) {
    return await this.withUnlockAndPersist(async () => {
      return await (
        await this.activeUserKeyring()
      ).keyDelete(blockchain, publicKey);
    });
  }

  public async ledgerImport(walletDescriptor: WalletDescriptor) {
    return await this.withUnlockAndPersist(async () => {
      return await (
        await this.activeUserKeyring()
      ).ledgerImport(walletDescriptor);
    });
  }

  /**
   * Update the active public key for the given blockchain.
   */
  public async activeWalletUpdate(
    newActivePublicKey: string,
    blockchain: Blockchain
  ) {
    return await this.withUnlockAndPersist(async () => {
      return await (
        await this.activeUserKeyring()
      ).activeWalletUpdate(newActivePublicKey, blockchain);
    });
  }

  /**
   * Return the public keys of all blockchain keyrings in the keyring.
   */
  public async publicKeys(): Promise<UserPublicKeys> {
    return await this.withUnlock(async () => {
      return await (await this.activeUserKeyring()).publicKeys();
    });
  }

  /**
   * Return all the active public keys for all enabled blockchains.
   */
  public async activeWallets(): Promise<string[]> {
    return this.withUnlock(async () => {
      return Object.values(
        await (await this.activeUserKeyring()).activeWallets()
      );
    });
  }

  public async exportSecretKey(
    password: string,
    publicKey: string
  ): Promise<string> {
    const keyring = await this.activeUserKeyring();
    return await this.withPassword(password, async () =>
      keyring.exportSecretKey(publicKey)
    );
  }

  public async exportMnemonic(password: string): Promise<string> {
    const keyring = await this.activeUserKeyring();
    return await this.withPassword(password, async () =>
      keyring.exportMnemonic()
    );
  }

  /**
   * Set the mnemonic to be used by the hd keyring.
   */
  public async setMnemonic(mnemonic: string) {
    return await this.withUnlockAndPersist(async () => {
      await this.activeUserKeyring()
        .then((keyring) => keyring.setMnemonic(mnemonic))
        .then(() => this.notification.userUpdated());
    });
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Utilities.
  ///////////////////////////////////////////////////////////////////////////////

  private async withUnlockAndPersist<T>(fn: () => Promise<T>) {
    return await this.withUnlock(async () => {
      const resp = await fn();
      await this.persist();
      return resp;
    });
  }

  // Utility for asserting the wallet is currently unlocked.
  private async withUnlock<T>(fn: () => T) {
    const unlockResponse = await this.userClient.unlockKeyring();

    if (unlockResponse.error) {
      throw new Error(unlockResponse.error.message);
    }

    const resp = fn();
    this.updateLastUsed();
    return resp;
  }

  // Utility for asserting the wallet is currently locked.
  private async withLock<T>(fn: () => T): Promise<T> {
    if (await this.isUnlocked()) {
      throw new Error("keyring store is not locked");
    }
    const resp = fn();
    this.updateLastUsed();
    return resp;
  }

  private withPasswordAndPersist<T>(currentPassword: string, fn: () => T) {
    return this.withPassword(currentPassword, () => {
      const resp = fn();
      this.persist();
      return resp;
    });
  }

  // Utility for asserting the wallet is unlocked and the correct password was
  // given.
  private withPassword<T>(currentPassword: string, fn: () => T) {
    return this.withUnlock(() => {
      if (currentPassword !== this.password) {
        throw new Error("incorrect password");
      }
      return fn();
    });
  }

  private async persist(forceBecauseCalledFromInit = false) {
    if (!forceBecauseCalledFromInit && !this.isUnlocked()) {
      throw new Error("attempted persist of locked keyring");
    }
    await this.store.setKeyringStore(this.toJson(), this.password!);
  }

  private updateLastUsed() {
    this.lastUsedTs = Date.now() / 1000;
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Serialization.
  ///////////////////////////////////////////////////////////////////////////////

  private toJson(): KeyringStoreJson {
    // toJson on all the users
    const users = Object.fromEntries(
      [...this.users].map(([k, v]) => [k, v.toJson()])
    );
    return {
      users,
      lastUsedTs: this.lastUsedTs,
    };
  }

  private async fromJson(json: KeyringStoreJson) {
    const { users } = json;
    const userEntries: Array<[string, UserKeyring]> = Object.entries(users).map(
      ([uuid, obj]) => {
        return [uuid, UserKeyring.fromJson(obj, this.store)];
      }
    );
    this.users = new Map(userEntries);
    await Promise.all(
      userEntries.map(([uuid, keyring]) =>
        this.populateUserPubkeyStore(uuid, keyring)
      )
    );
  }

  private async populateUserPubkeyStore(
    uuid: string,
    userKeyring: UserKeyring
  ) {
    const [_publicKeyStore, publicKeys, activeWallets, keyNames, isColdStore] =
      await Promise.all([
        this.store.getUserPublicKeys(uuid),
        userKeyring.publicKeys(),
        userKeyring._activeWalletsByBlockchain(),
        this.store._getKeynameStore(),
        this.store._getIsColdStore(),
      ]);

    const publicKeyStore: UserPublicKeyStore[string] = _publicKeyStore ?? {
      activePlatform:
        userKeyring.activeBlockchain ??
        (Object.keys(publicKeys)[0] as Blockchain),
      platforms: {},
    };

    Object.entries(publicKeys).forEach(([blockchain, keyrings]) => {
      const platform = blockchain as Blockchain;
      const activePublicKey = activeWallets[platform];
      if (!activePublicKey) {
        // if there is no active wallet for this platform it is ignored.
        // this should never happen.
        return;
      }
      publicKeyStore.platforms[platform] ??= {
        activePublicKey,
        publicKeys: {},
      };

      Object.entries(keyrings).forEach((keyring) => {
        const [keyringType, publicKeys] = keyring as [KeyringTypes, string[]];
        const publicKeyType =
          keyringType === "hdPublicKeys"
            ? "derived"
            : keyringType === "importedPublicKeys"
            ? "imported"
            : "hardware";

        publicKeys.forEach((publicKey) => {
          const legacyLegacyName = keyNames?.[
            publicKey as Blockchain
          ] as unknown as string;
          const legacyName = keyNames?.[platform]?.[publicKey];
          const current =
            publicKeyStore.platforms[platform]!.publicKeys[publicKey];

          publicKeyStore.platforms[platform]!.publicKeys[publicKey] = {
            name: current?.name ?? legacyName ?? legacyLegacyName,
            isCold: current?.isCold ?? !!isColdStore?.[publicKey],
            type: current?.type ?? publicKeyType,
          };
        });
      });
    });
    await this.store.setUser(uuid, { hasMnemonic: userKeyring.hasMnemonic() });
    return this.store.setUserPublicKeys(uuid, publicKeyStore);
  }
}

// Holds all keys for a given username.
class UserKeyring {
  blockchains: Map<string, BlockchainKeyring>;
  username?: string;
  uuid?: string;
  private mnemonic?: string;
  activeBlockchain?: Blockchain;
  private store: SecureStore;

  ///////////////////////////////////////////////////////////////////////////////
  // Initialization.
  ///////////////////////////////////////////////////////////////////////////////

  constructor(store: SecureStore) {
    this.blockchains = new Map();
    this.store = store;
  }

  public static async init(
    username: string,
    keyringInit:
      | MnemonicKeyringInit
      | LedgerKeyringInit
      | PrivateKeyKeyringInit,
    uuid: string,
    store: SecureStore
  ): Promise<UserKeyring> {
    const keyring = new UserKeyring(store);
    keyring.uuid = uuid;
    keyring.username = username;

    if ("mnemonic" in keyringInit) {
      if (keyringInit.mnemonic === true) {
        throw new Error("invalid mnemonic");
      }
      keyring.mnemonic = keyringInit.mnemonic;
    }

    // Ledger and mnemonic keyring init have signedWalletDescriptors
    if ("signedWalletDescriptors" in keyringInit) {
      for (const signedWalletDescriptor of keyringInit.signedWalletDescriptors) {
        const blockchain = signedWalletDescriptor.blockchain;
        // No blockchain keyring, create it, filtering the signed wallet descriptors
        // to only the ones for this blockchain
        await keyring.blockchainKeyringAdd(blockchain, {
          ...keyringInit,
          signedWalletDescriptors: keyringInit.signedWalletDescriptors.filter(
            (s) => s.blockchain === blockchain
          ),
        });
      }
      // Set the active blockchain to the first signed wallet descriptor
      keyring.activeBlockchain =
        keyringInit.signedWalletDescriptors[0].blockchain;
    }

    if ("privateKey" in keyringInit) {
      keyring.activeBlockchain = keyringInit.blockchain;
      const blockchainKeyring = keyring.blockchains.get(keyringInit.blockchain);
      if (blockchainKeyring) {
        // Blockchain keyring already exists, just add the private key
        await blockchainKeyring.importSecretKey(keyringInit.privateKey, "New");
      } else {
        // No blockchain keyring, create it
        await keyring.blockchainKeyringAdd(keyringInit.blockchain, keyringInit);
      }
    }

    return keyring;
  }

  ///////////////////////////////////////////////////////////////////////////////
  // State selectors.
  ///////////////////////////////////////////////////////////////////////////////

  public hasMnemonic(): boolean {
    return !!this.mnemonic;
  }

  /**
   * Return all the blockchains that have an initialised keyring even if they
   * are not enabled.
   */
  public blockchainKeyrings(): Array<Blockchain> {
    return [...this.blockchains.keys()].map((b) => b as Blockchain);
  }

  public async publicKeys(): Promise<UserPublicKeys> {
    const entries = this.blockchainKeyrings().map((blockchain) => {
      const keyring = this.keyringForBlockchain(blockchain);
      return [blockchain, keyring.publicKeys()];
    });
    return Object.fromEntries(entries);
  }

  /**
   * Returns the keyring for a given blockchain.
   */
  public keyringForBlockchain(blockchain: Blockchain): BlockchainKeyring {
    const keyring = this.blockchains.get(blockchain);
    if (keyring) {
      return keyring;
    }
    throw new Error(`no keyring for ${blockchain}`);
  }

  /**
   * Returns the keyring for a given public key.
   */
  public keyringForPublicKey(publicKey: string): BlockchainKeyring {
    for (const keyring of this.blockchains.values()) {
      if (keyring.hasPublicKey(publicKey)) {
        return keyring;
      }
    }
    throw new Error(`no keyring for ${publicKey}`);
  }

  /**
   * Returns the blockchain for a given public key.
   */
  public blockchainForPublicKey(publicKey: string): Blockchain {
    for (const [blockchain, keyring] of this.blockchains) {
      if (keyring.hasPublicKey(publicKey)) {
        return blockchain as Blockchain;
      }
    }
    throw new Error(`no blockchain for ${publicKey}`);
  }

  public async _activeWalletsByBlockchain(): Promise<
    Partial<Record<Blockchain, string>>
  > {
    const activeWallets: Partial<Record<Blockchain, string>> = {};
    this.blockchainKeyrings().forEach((blockchain) => {
      const activeWallet =
        this.keyringForBlockchain(blockchain).getActiveWallet();
      if (activeWallet) {
        activeWallets[blockchain] = activeWallet;
      }
    });

    return activeWallets;
  }

  public async activeWallets(): Promise<string[]> {
    return Object.values(await this._activeWalletsByBlockchain());
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Actions.
  ///////////////////////////////////////////////////////////////////////////////

  public async blockchainKeyringAdd(
    blockchain: Blockchain,
    keyringInit: MnemonicKeyringInit | LedgerKeyringInit | PrivateKeyKeyringInit
  ): Promise<void> {
    const keyring = keyringForBlockchain(blockchain as Blockchain, this.store);
    if ("mnemonic" in keyringInit) {
      if (keyringInit.mnemonic === true) {
        keyringInit.mnemonic = this.mnemonic!;
      }
    }
    await keyring.init(keyringInit);
    this.blockchains.set(blockchain, keyring);
  }

  public async blockchainKeyringRemove(blockchain: Blockchain): Promise<void> {
    const user = await this.store.getActiveUser();
    this.blockchains.delete(blockchain);
    await this.store.setUserPlatform(user.uuid, blockchain, null);
  }

  public async importSecretKey(
    blockchain: Blockchain,
    secretKey: string,
    name: string
  ): Promise<[string, string]> {
    const keyring = this.keyringForBlockchain(blockchain);
    const [publicKey, _name] = await keyring.importSecretKey(secretKey, name);
    return [publicKey, _name];
  }

  /**
   * Update the active public key for the given blockchain.
   */
  public async activeWalletUpdate(
    newActivePublicKey: string,
    blockchain: Blockchain
  ) {
    const keyring = this.keyringForBlockchain(blockchain);
    await secureStore.setUserActivePublicKey(
      this.uuid!,
      blockchain,
      newActivePublicKey
    );
    await keyring._activeWalletUpdate(newActivePublicKey);

    this.activeBlockchain = blockchain;
  }

  public nextDerivationPath(
    blockchain: Blockchain,
    keyring: "hd" | "ledger"
  ): { derivationPath: any; offset: number } {
    let blockchainKeyring = this.blockchains.get(blockchain);
    if (!blockchainKeyring) {
      throw new Error("blockchain keyring not initialised");
    } else {
      return blockchainKeyring.nextDerivationPath(keyring);
    }
  }

  public async addDerivationPath(
    blockchain: Blockchain,
    derivationPath: string
  ): Promise<{ publicKey: string; name: string }> {
    let blockchainKeyring = this.blockchains.get(blockchain);
    if (!blockchainKeyring) {
      throw new Error("blockchain keyring not initialised");
    } else if (!blockchainKeyring.hasHdKeyring()) {
      // Hd keyring not initialised, ibitialise it if possible
      if (!this.mnemonic) {
        throw new Error("hd keyring not initialised");
      }
      const accounts = await blockchainKeyring.initHdKeyring(this.mnemonic, [
        derivationPath,
      ]);
      return {
        publicKey: accounts[0][0],
        name: accounts[0][1],
      };
    } else {
      return blockchainKeyring.addDerivationPath(derivationPath);
    }
  }

  /**
   * Get the next derived key for the mnemonic.
   */
  public async deriveNextKey(
    blockchain: Blockchain
  ): Promise<{ publicKey: string; derivationPath: string; name: string }> {
    let blockchainKeyring = this.blockchains.get(blockchain);
    if (!blockchainKeyring) {
      throw new Error("blockchain keyring not initialised");
    } else {
      return await blockchainKeyring.deriveNextKey();
    }
  }

  public exportSecretKey(publicKey: string): string {
    const keyring = this.keyringForPublicKey(publicKey);
    return keyring.exportSecretKey(publicKey);
  }

  public exportMnemonic(): string {
    if (!this.mnemonic) {
      throw new Error("keyring does not have a mnemonic");
    }
    return this.mnemonic;
  }

  public async setMnemonic(mnemonic: string) {
    if (this.mnemonic) {
      throw new Error("keyring already has a mnemonic set");
    }

    this.mnemonic = mnemonic;
    try {
      if (this.uuid) {
        await this.store.setUser(this.uuid, { hasMnemonic: true });
      }
    } catch {
      null;
    }
  }

  public async ledgerImport(walletDescriptor: WalletDescriptor) {
    if (!this.uuid) {
      throw new Error("Keyring not initialized");
    }
    const blockchainKeyring = this.blockchains.get(walletDescriptor.blockchain);
    const ledgerKeyring = blockchainKeyring!.ledgerKeyring!;
    await ledgerKeyring.add(walletDescriptor);
    const name = this.store.defaultKeyname.defaultLedger(
      ledgerKeyring.publicKeys().length
    );
    await this.store.setUserPublicKey(
      this.uuid,
      walletDescriptor.blockchain,
      walletDescriptor.publicKey,
      {
        name,
        isCold: true,
        type: "hardware",
      }
    );
  }

  public async keyDelete(blockchain: Blockchain, pubkey: string) {
    if (!this.uuid) {
      throw new Error("Keyring not initialized");
    }
    await this.store.setUserPublicKey(this.uuid, blockchain, pubkey, null);
    const blockchainKeyring = this.blockchains.get(blockchain);
    await blockchainKeyring!.keyDelete(blockchain, pubkey);
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Serialization.
  ///////////////////////////////////////////////////////////////////////////////

  public toJson(): UserKeyringJson {
    // toJson on all the keyrings
    const blockchains = Object.fromEntries(
      [...this.blockchains].map(([k, v]) => [k, v.toJson()])
    );
    if (this.uuid === undefined) {
      throw new Error("uuid not found");
    }
    if (this.username === undefined) {
      throw new Error("username not found");
    }
    if (this.activeBlockchain === undefined) {
      throw new Error("active blockchain not found");
    }
    return {
      uuid: this.uuid,
      username: this.username,
      activeBlockchain: this.activeBlockchain,
      mnemonic: this.mnemonic,
      blockchains,
    };
  }

  public static fromJson(
    json: UserKeyringJson,
    store: SecureStore
  ): UserKeyring {
    const { uuid, username, activeBlockchain, mnemonic, blockchains } = json;

    const u = new UserKeyring(store);
    u.uuid = uuid;
    u.username = username;
    u.mnemonic = mnemonic;
    u.blockchains = new Map(
      Object.entries(blockchains).map(([blockchain, obj]) => {
        const blockchainKeyring = keyringForBlockchain(
          blockchain as Blockchain,
          store
        );
        blockchainKeyring.fromJson(obj);
        return [blockchain, blockchainKeyring];
      })
    );
    u.activeBlockchain = activeBlockchain ?? Object.keys(blockchains)[0];

    return u;
  }
}
