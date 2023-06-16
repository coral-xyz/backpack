import type {
  AutolockSettingsOption,
  Blockchain,
  EventEmitter,
  LedgerKeyringInit,
  MnemonicKeyringInit,
  PrivateKeyKeyringInit,
  WalletDescriptor,
} from "@coral-xyz/common";
import {
  BACKEND_API_URL,
  BACKEND_EVENT,
  DEFAULT_AUTO_LOCK_INTERVAL_SECS,
  defaultPreferences,
  NOTIFICATION_KEYRING_STORE_LOCKED,
} from "@coral-xyz/common";
import { generateMnemonic } from "bip39";

import { hdFactoryForBlockchain, keyringForBlockchain } from "../../keyring";
import type { BlockchainKeyring } from "../../keyring/blockchain";
import { KeyringStoreState } from "../../types/keyring";
import type {
  KeyringStoreJson,
  SecureStore,
  User,
  UserKeyringJson,
} from "../SecureStore";

/**
 * KeyringStore API for managing all wallet keys .
 */
export class KeyringStore {
  private lastUsedTs: number;
  private password?: string;

  private autoLockCountdown: {
    start: () => void;
    restart: () => void;
    toggle: (enabled: boolean) => void;
  };

  private events: EventEmitter;
  private store: SecureStore;
  private users: Map<string, UserKeyring>;
  // Must be undefined when the keyring-store is locked or uninitialized.
  private activeUserUuid?: string;

  ///////////////////////////////////////////////////////////////////////////////
  // Getters.
  ///////////////////////////////////////////////////////////////////////////////

  public get activeUserKeyring(): UserKeyring {
    if (!this.activeUserUuid) {
      throw new Error("invariant violation: activeUserUuid is undefined");
    }
    const kr = this.users.get(this.activeUserUuid)!;
    if (!kr) {
      throw new Error("invariant violation: activeUserKeyring not found");
    }
    return kr;
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Initialization.
  ///////////////////////////////////////////////////////////////////////////////

  constructor(events: EventEmitter, store: SecureStore) {
    this.users = new Map();
    this.lastUsedTs = 0;
    this.events = events;
    this.store = store;

    this.autoLockCountdown = (() => {
      let autoLockCountdownTimer: ReturnType<typeof setTimeout>;

      let secondsUntilAutoLock: number | undefined;
      let autoLockIsEnabled = true;

      let shouldLockImmediatelyWhenClosed = false;
      let lockImmediatelyWhenClosedCountdown: ReturnType<typeof setTimeout>;
      const SECONDS_UNTIL_LOCK_WHEN_CLOSED = 0.5;

      const lock = () => {
        if (!autoLockIsEnabled) return;
        this.lock();
        this.events.emit(BACKEND_EVENT, {
          name: NOTIFICATION_KEYRING_STORE_LOCKED,
        });
      };

      const startAutoLockCountdownTimer = () => {
        stopAutoLockCountdownTimer();
        stopLockWhenClosedCountdownTimer();
        if (!secondsUntilAutoLock || !autoLockIsEnabled) return;
        autoLockCountdownTimer = setTimeout(lock, secondsUntilAutoLock * 1000);
      };

      const stopAutoLockCountdownTimer = () => {
        if (autoLockCountdownTimer) clearTimeout(autoLockCountdownTimer);
      };

      const stopLockWhenClosedCountdownTimer = () => {
        if (lockImmediatelyWhenClosedCountdown)
          clearTimeout(lockImmediatelyWhenClosedCountdown);
      };

      globalThis.chrome?.runtime.onConnect.addListener((port) => {
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
            .getWalletDataForUser(this.activeUserUuid!)
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
    uuid: string,
    jwt: string
  ) {
    this.password = password;

    // Setup the user.
    await this._usernameKeyringCreate(username, keyringInit, uuid, jwt);

    // Persist the encrypted data to then store.
    await this.persist(true);

    // Automatically lock the store when idle.
    await this.tryUnlock({ password, uuid });
  }

  public async usernameKeyringCreate(
    username: string,
    keyringInit:
      | MnemonicKeyringInit
      | LedgerKeyringInit
      | PrivateKeyKeyringInit,
    uuid: string,
    jwt: string
  ) {
    return await this.withUnlockAndPersist(async () => {
      return await this._usernameKeyringCreate(
        username,
        keyringInit,
        uuid,
        jwt
      );
    });
  }

  private async _usernameKeyringCreate(
    username: string,
    keyringInit:
      | MnemonicKeyringInit
      | LedgerKeyringInit
      | PrivateKeyKeyringInit,
    uuid: string,
    jwt: string
  ) {
    // Store unlocked keyring in memory.
    this.users.set(
      uuid,
      await UserKeyring.init(username, keyringInit, uuid, this.store)
    );
    this.activeUserUuid = uuid;

    // Per user preferences.
    await this.store.setWalletDataForUser(uuid, defaultPreferences());

    // Persist active user to disk.
    await this.store.setActiveUser({
      username,
      uuid,
      jwt,
    });
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Internal state machine queries.
  ///////////////////////////////////////////////////////////////////////////////

  public async state(): Promise<KeyringStoreState> {
    if (this.isUnlocked()) {
      return KeyringStoreState.Unlocked;
    }
    if (await this.isLocked()) {
      return KeyringStoreState.Locked;
    }
    return KeyringStoreState.NeedsOnboarding;
  }

  private async isLocked(): Promise<boolean> {
    if (this.isUnlocked()) {
      return false;
    }
    return await this.store.doesCiphertextExist();
  }

  private isUnlocked(): boolean {
    return (
      this.activeUserUuid !== undefined &&
      this.activeUserKeyring.blockchains.size > 0 &&
      this.lastUsedTs !== 0
    );
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Actions.
  ///////////////////////////////////////////////////////////////////////////////

  /**
   * Returns true if the active user was removed (and thus chanaged).
   */
  public async removeUser(uuid: string): Promise<boolean> {
    if (this.users.size <= 1) {
      throw new Error(
        "invariant violation: users map size must be greater than 1"
      );
    }
    return await this.withUnlockAndPersist(async () => {
      const user = this.users.get(uuid);
      if (!user) {
        throw new Error(`User not found: ${uuid}`);
      }
      this.users.delete(uuid);
      await this.store.setWalletDataForUser(uuid, undefined);

      //
      // If the active user is being removed, then auto switch it.
      //
      if (this.activeUserUuid === uuid) {
        const userData = await this.store.getUserData();
        const users = userData.users.filter((user) => user.uuid !== uuid);
        await this.store.setUserData({
          activeUser: users[0],
          users,
        });
        this.activeUserUuid = users[0].uuid;
        return true;
      } else {
        return false;
      }
    });
  }

  public async tryUnlock(userInfo: { password: string; uuid: string }) {
    return this.withLock(async () => {
      const json = await this.store.getKeyringStore(userInfo);
      await this.fromJson(json);

      // Must use this object, because the uuid may have been set during migration.
      // This will only happen in the event that the given uuid is empty.
      this.activeUserUuid = userInfo.uuid;

      this.password = userInfo.password;
      // Automatically lock the store when idle.
      // this.autoLockStart();
      this.autoLockCountdown.start();
    });
  }

  /**
   * Check if a password is valid by attempting to decrypt the stored keyring.
   */
  public async checkPassword(password: string) {
    return this.store.checkPassword(password);
  }

  public lock() {
    this.activeUserUuid = undefined; // Must be set to undefined here.
    this.users = new Map();
    this.lastUsedTs = 0;
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
        mnemonic = this.activeUserKeyring.exportMnemonic();
        return factory.init(mnemonic, derivationPaths).publicKeys();
      });
    } else {
      return factory.init(mnemonic, derivationPaths).publicKeys();
    }
  }

  public reset() {
    // First lock to clear the keyring memory.
    this.lock();
    // Clear the jwt cookie if it exists.
    fetch(`${BACKEND_API_URL}/authenticate`, {
      method: "DELETE",
    });
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
    const user = userData.users.filter((u) => u.uuid === uuid)[0];
    this.activeUserUuid = uuid;
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
      const data = await this.store.getWalletDataForUser(this.activeUserUuid!);
      await this.store.setWalletDataForUser(this.activeUserUuid!, {
        ...data,
        autoLockSettings: {
          seconds,
          option,
        },
      });

      this.autoLockCountdown.start();
    });
  }

  public keepAlive() {
    return this.withUnlock(() => {});
  }

  public autoLockCountdownToggle(enable: boolean) {
    this.autoLockCountdown.toggle(enable);
  }

  public autoLockCountdownRestart() {
    this.autoLockCountdown.restart();
  }

  public autoLockCountdownReset() {
    this.autoLockCountdown.start();
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
    await this.activeUserKeyring.blockchainKeyringAdd(blockchain, keyringInit);
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
    await this.activeUserKeyring.blockchainKeyringRemove(blockchain);
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
      return await this.activeUserKeyring.importSecretKey(
        blockchain,
        secretKey,
        name
      );
    });
  }

  public async nextDerivationPath(
    blockchain: Blockchain,
    keyring: "hd" | "ledger"
  ): Promise<string> {
    return await this.withUnlock(async () => {
      return this.activeUserKeyring.nextDerivationPath(blockchain, keyring);
    });
  }

  public async addDerivationPath(
    blockchain: Blockchain,
    derivationPath: string
  ): Promise<{ publicKey: string; name: string }> {
    return await this.withUnlock(async () => {
      return this.activeUserKeyring.addDerivationPath(
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
      return await this.activeUserKeyring.deriveNextKey(blockchain);
    });
  }

  public async keyDelete(blockchain: Blockchain, publicKey: string) {
    return await this.withUnlockAndPersist(async () => {
      return await this.activeUserKeyring.keyDelete(blockchain, publicKey);
    });
  }

  public async ledgerImport(walletDescriptor: WalletDescriptor) {
    return await this.withUnlockAndPersist(async () => {
      return await this.activeUserKeyring.ledgerImport(walletDescriptor);
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
      return await this.activeUserKeyring.activeWalletUpdate(
        newActivePublicKey,
        blockchain
      );
    });
  }

  /**
   * Return the public keys of all blockchain keyrings in the keyring.
   */
  public async publicKeys(): Promise<{
    [key: string]: {
      hdPublicKeys: Array<string>;
      importedPublicKeys: Array<string>;
      ledgerPublicKeys: Array<string>;
    };
  }> {
    return await this.withUnlock(async () => {
      return await this.activeUserKeyring.publicKeys();
    });
  }

  /**
   * Return all the active public keys for all enabled blockchains.
   */
  public async activeWallets(): Promise<string[]> {
    return this.withUnlock(async () => {
      return await this.activeUserKeyring.activeWallets();
    });
  }

  public exportSecretKey(password: string, publicKey: string): string {
    return this.withPassword(password, () => {
      return this.activeUserKeyring.exportSecretKey(publicKey);
    });
  }

  public exportMnemonic(password: string): string {
    return this.withPassword(password, () => {
      return this.activeUserKeyring.exportMnemonic();
    });
  }

  /**
   * Set the mnemonic to be used by the hd keyring.
   */
  public async setMnemonic(mnemonic: string) {
    return await this.withUnlockAndPersist(async () => {
      this.activeUserKeyring.setMnemonic(mnemonic);
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
  private withUnlock<T>(fn: () => T) {
    if (!this.isUnlocked()) {
      throw new Error("keyring store is not unlocked");
    }
    const resp = fn();
    this.updateLastUsed();
    return resp;
  }

  // Utility for asserting the wallet is currently locked.
  private withLock<T>(fn: () => T): T {
    if (this.isUnlocked()) {
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
    this.users = new Map(
      Object.entries(users).map(([username, obj]) => {
        return [username, UserKeyring.fromJson(obj, this.store)];
      })
    );
  }
}

// Holds all keys for a given username.
class UserKeyring {
  blockchains: Map<string, BlockchainKeyring>;
  username: string;
  uuid: string;
  private mnemonic?: string;
  activeBlockchain: Blockchain;
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

  public async publicKeys(): Promise<{
    [key: string]: {
      hdPublicKeys: Array<string>;
      importedPublicKeys: Array<string>;
      ledgerPublicKeys: Array<string>;
    };
  }> {
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

  public async activeWallets(): Promise<string[]> {
    return this.blockchainKeyrings()
      .map((blockchain) =>
        this.keyringForBlockchain(blockchain).getActiveWallet()
      )
      .filter((w) => w !== undefined) as string[];
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
    this.blockchains.delete(blockchain);
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
    await keyring.activeWalletUpdate(newActivePublicKey);

    this.activeBlockchain = blockchain;
  }

  public nextDerivationPath(
    blockchain: Blockchain,
    keyring: "hd" | "ledger"
  ): string {
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

  public setMnemonic(mnemonic: string) {
    if (this.mnemonic) {
      throw new Error("keyring already has a mnemonic set");
    }
    this.mnemonic = mnemonic;
  }

  public async ledgerImport(walletDescriptor: WalletDescriptor) {
    const blockchainKeyring = this.blockchains.get(walletDescriptor.blockchain);
    const ledgerKeyring = blockchainKeyring!.ledgerKeyring!;
    await ledgerKeyring.add(walletDescriptor);
    const name = this.store.defaultKeyname.defaultLedger(
      ledgerKeyring.publicKeys().length
    );
    await this.store.setKeyname(walletDescriptor.publicKey, name);
    await this.store.setIsCold(walletDescriptor.publicKey, true);
  }

  public async keyDelete(blockchain: Blockchain, pubkey: string) {
    const blockchainKeyring = this.blockchains.get(blockchain);
    await blockchainKeyring!.keyDelete(pubkey);
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Serialization.
  ///////////////////////////////////////////////////////////////////////////////

  public toJson(): UserKeyringJson {
    // toJson on all the keyrings
    const blockchains = Object.fromEntries(
      [...this.blockchains].map(([k, v]) => [k, v.toJson()])
    );
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
