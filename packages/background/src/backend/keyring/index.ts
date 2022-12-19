import {
  hdFactoryForBlockchain,
  keyringForBlockchain,
} from "@coral-xyz/blockchain-common";
import type { BlockchainKeyring } from "@coral-xyz/blockchain-keyring";
import type {
  Blockchain,
  DerivationPath,
  EventEmitter,
  KeyringInit,
} from "@coral-xyz/common";
import {
  BACKEND_API_URL,
  BACKEND_EVENT,
  EthereumConnectionUrl,
  EthereumExplorer,
  NOTIFICATION_KEYRING_STORE_LOCKED,
  SolanaCluster,
  SolanaExplorer,
} from "@coral-xyz/common";
import type { ExtractRecoilType, KeyringStoreState } from "@coral-xyz/recoil";
import { KeyringStoreStateEnum } from "@coral-xyz/recoil";
import { generateMnemonic } from "bip39";

import type { KeyringStoreJson, User, UserKeyringJson } from "../store";
import * as store from "../store";
import {
  DEFAULT_DARK_MODE,
  DEFAULT_DEVELOPER_MODE,
  DefaultKeyname,
} from "../store";

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

  constructor(events: EventEmitter) {
    this.users = new Map();
    this.lastUsedTs = 0;
    this.events = events;

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
          store
            .getWalletDataForUser(this.activeUserUuid!)
            .then(({ autoLockSecs, autoLockOption }) => {
              switch (autoLockOption) {
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
                    autoLockSecs || store.DEFAULT_LOCK_INTERVAL_SECS;
              }
              startAutoLockCountdownTimer();
            });
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
    keyringInit: KeyringInit,
    uuid: string,
    jwt: string
  ) {
    this.password = password;

    // Setup the user.
    await this._usernameKeyringCreate(username, keyringInit, uuid, jwt);

    // Persist the encrypted data to then store.
    await this.persist(true);

    // Automatically lock the store when idle.
    await this.tryUnlock(password, uuid);
  }

  public async usernameKeyringCreate(
    username: string,
    keyringInit: KeyringInit,
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

  public async _usernameKeyringCreate(
    username: string,
    keyringInit: KeyringInit,
    uuid: string,
    jwt: string
  ) {
    // Store unlocked keyring in memory.
    this.users.set(uuid, await UserKeyring.init(username, keyringInit, uuid));
    this.activeUserUuid = uuid;

    // Per user preferences.
    await store.setWalletDataForUser(
      uuid,
      defaultPreferences(
        keyringInit.blockchainKeyrings.map((k) => k.blockchain)
      )
    );

    // Persist active user to disk.
    await store.setActiveUser({
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
      return KeyringStoreStateEnum.Unlocked;
    }
    if (await this.isLocked()) {
      return KeyringStoreStateEnum.Locked;
    }
    return KeyringStoreStateEnum.NeedsOnboarding;
  }

  private async isLocked(): Promise<boolean> {
    if (this.isUnlocked()) {
      return false;
    }
    return await store.doesCiphertextExist();
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
      await store.setWalletDataForUser(uuid, undefined);

      //
      // If the active user is being removed, then auto switch it.
      //
      if (this.activeUserUuid === uuid) {
        const userData = await store.getUserData();
        const users = userData.users.filter((user) => user.uuid !== uuid);
        await store.setUserData({
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

  public async tryUnlock(password: string, uuid: string) {
    return this.withLock(async () => {
      const json = await store.getKeyringStore(password);
      await this.fromJson(json);
      this.activeUserUuid = uuid;
      this.password = password;
      // Automatically lock the store when idle.
      // this.autoLockStart();
      this.autoLockCountdown.start();
    });
  }

  /**
   * Check if a password is valid by attempting to decrypt the stored keyring.
   */
  public async checkPassword(password: string) {
    try {
      await store.getKeyringStore(password);
      return true;
    } catch (err) {
      return false;
    }
  }

  public lock() {
    this.activeUserUuid = undefined; // Must be set to undefined here.
    this.users = new Map();
    this.lastUsedTs = 0;
  }

  // Preview public keys for a given mnemonic and derivation path without
  // importing the mnemonic.
  public previewPubkeys(
    blockchain: Blockchain,
    mnemonic: string,
    derivationPath: DerivationPath,
    numberOfAccounts: number
  ): string[] {
    const factory = hdFactoryForBlockchain(blockchain);
    const hdKeyring = factory.fromMnemonic(mnemonic, derivationPath, [
      ...Array(numberOfAccounts).keys(),
    ]);
    return [...Array(numberOfAccounts).keys()].map((i) =>
      hdKeyring.getPublicKey(i)
    );
  }

  public reset() {
    // First lock to clear the keyring memory.
    this.lock();
    // Clear the jwt cookie if it exists.
    fetch(`${BACKEND_API_URL}/authenticate`, {
      method: "DELETE",
    });
    // Then reset persistent disk storage.
    return store.reset();
  }

  public async passwordUpdate(currentPassword: string, newPassword: string) {
    return this.withPasswordAndPersist(currentPassword, () => {
      this.password = newPassword;
    });
  }

  public async autoLockUpdate(autoLockSecs: number, autoLockOption?) {
    return await this.withUnlock(async () => {
      const data = await store.getWalletDataForUser(this.activeUserUuid!);
      await store.setWalletDataForUser(this.activeUserUuid!, {
        ...data,
        autoLockSecs,
        autoLockOption,
      });

      this.autoLockCountdown.start();
    });
  }

  public keepAlive() {
    return this.withUnlock(() => {});
  }

  public createMnemonic(strength: number): string {
    const mnemonic = generateMnemonic(strength);
    return mnemonic;
  }

  public async activeUserUpdate(uuid: string): Promise<User> {
    const userData = await store.getUserData();
    const user = userData.users.filter((u) => u.uuid === uuid)[0];
    this.activeUserUuid = uuid;
    await store.setActiveUser(user);
    return user;
  }

  public autoLockCountdownToggle(enable: boolean) {
    this.autoLockCountdown.toggle(enable);
  }

  public autoLockCountdownRestart() {
    this.autoLockCountdown.restart();
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Passes through to the active username keyring.
  ///////////////////////////////////////////////////////////////////////////////

  /**
   * Initialise a blockchain keyring.
   */
  public async blockchainKeyringAdd(
    blockchain: Blockchain,
    derivationPath: DerivationPath,
    accountIndex: number,
    publicKey?: string,
    persist = true
  ): Promise<string> {
    // If this is a mnemonic based keyring the public key being returned is
    // unknown, if it is a ledger it will just be the same as `publicKey`
    const newPublicKey = this.activeUserKeyring.blockchainKeyringAdd(
      blockchain,
      derivationPath,
      accountIndex,
      publicKey
    );
    if (persist) {
      await this.persist();
    }
    return newPublicKey;
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
    this.activeUserKeyring.blockchainKeyringRemove(blockchain);
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

  // Derive the next key for the given blockchain.
  public async deriveNextKey(
    blockchain: Blockchain
  ): Promise<[string, string]> {
    return await this.withUnlockAndPersist(async () => {
      return await this.activeUserKeyring.deriveNextKey(blockchain);
    });
  }

  public async keyDelete(blockchain: Blockchain, pubkey: string) {
    return await this.withUnlockAndPersist(async () => {
      return await this.activeUserKeyring.keyDelete(blockchain, pubkey);
    });
  }

  public async ledgerImport(
    blockchain: Blockchain,
    dPath: string,
    account: number,
    pubkey: string
  ) {
    return await this.withUnlockAndPersist(async () => {
      return await this.activeUserKeyring.ledgerImport(
        blockchain,
        dPath,
        account,
        pubkey
      );
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
      return this.activeUserKeyring.exportSecretKey(password, publicKey);
    });
  }

  public exportMnemonic(password: string): string {
    return this.withPassword(password, () => {
      return this.activeUserKeyring.exportMnemonic(password);
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
    await store.setKeyringStore(this.toJson(), this.password!);
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
        return [username, UserKeyring.fromJson(obj)];
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

  ///////////////////////////////////////////////////////////////////////////////
  // Initialization.
  ///////////////////////////////////////////////////////////////////////////////

  constructor() {
    this.blockchains = new Map();
  }

  public static async init(
    username: string,
    keyringInit: KeyringInit,
    uuid: string
  ): Promise<UserKeyring> {
    const kr = new UserKeyring();
    kr.uuid = uuid;
    kr.username = username;
    kr.mnemonic = keyringInit.mnemonic;

    for (const blockchainKeyring of keyringInit.blockchainKeyrings) {
      await kr.blockchainKeyringAdd(
        blockchainKeyring.blockchain,
        blockchainKeyring.derivationPath,
        blockchainKeyring.accountIndex,
        blockchainKeyring.publicKey
      );
    }
    return kr;
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

  /**
   * Return all the enabled blockchains.
   */
  public async enabledBlockchains(): Promise<Array<Blockchain>> {
    const data = await store.getWalletDataForUser(this.uuid);
    if (!data.enabledBlockchains) {
      // Keyring created prior to this feature being added, so data does not
      // exist, write it using all blockchains in keyring
      const enabledBlockchains = [...this.blockchains.keys()].map(
        (b) => b as Blockchain
      );
      await store.setWalletDataForUser(this.uuid, {
        ...data,
        enabledBlockchains,
      });
      return enabledBlockchains;
    }
    return data.enabledBlockchains;
  }

  public async publicKeys(): Promise<{
    [key: string]: {
      hdPublicKeys: Array<string>;
      importedPublicKeys: Array<string>;
      ledgerPublicKeys: Array<string>;
    };
  }> {
    const entries = (await this.enabledBlockchains()).map((blockchain) => {
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
    return (await this.enabledBlockchains())
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
    derivationPath: DerivationPath,
    accountIndex: number,
    publicKey?: string
  ): Promise<string> {
    const keyring = keyringForBlockchain(blockchain);
    let newPublicKey: string;
    if (this.mnemonic) {
      // Initialising using a mnemonic
      const wallets = await keyring.initFromMnemonic(
        this.mnemonic,
        derivationPath,
        [accountIndex]
      );
      // Set the newly created public key for return
      newPublicKey = wallets[0][0];
    } else {
      if (!publicKey)
        throw new Error(
          "initialising keyring with hardware wallet requires publickey"
        );
      // Initialising using a hardware wallet
      await keyring.initFromLedger([
        {
          path: derivationPath,
          account: accountIndex,
          publicKey,
        },
      ]);
      // This is the same as the public key that was passed in, it is returned
      // unchanged
      newPublicKey = publicKey;
    }
    this.blockchains.set(blockchain, keyring);
    return newPublicKey;
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
  }

  /**
   * Get the next derived key for the mnemonic.
   */
  public async deriveNextKey(
    blockchain: Blockchain
  ): Promise<[string, string]> {
    let blockchainKeyring = this.blockchains.get(blockchain);
    if (!blockchainKeyring) {
      throw new Error("blockchain keyring not initialised");
    } else {
      // Derive the next key.
      const [publicKey, name] = blockchainKeyring.deriveNextKey();
      return [publicKey, name];
    }
  }

  public exportSecretKey(password: string, publicKey: string): string {
    const keyring = this.keyringForPublicKey(publicKey);
    return keyring.exportSecretKey(publicKey);
  }

  public exportMnemonic(password: string): string {
    if (!this.mnemonic) throw new Error("keyring uses a hardware wallet");
    return this.mnemonic;
  }

  public async ledgerImport(
    blockchain: Blockchain,
    dPath: string,
    account: number,
    pubkey: string
  ) {
    const blockchainKeyring = this.blockchains.get(blockchain);
    const ledgerKeyring = blockchainKeyring!.ledgerKeyring!;
    const name = DefaultKeyname.defaultLedger(ledgerKeyring.keyCount());
    await ledgerKeyring.ledgerImport(dPath, account, pubkey);
    await store.setKeyname(pubkey, name);
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
      mnemonic: this.mnemonic,
      blockchains,
    };
  }

  public static fromJson(json: UserKeyringJson): UserKeyring {
    const { uuid, username, mnemonic, blockchains } = json;

    const u = new UserKeyring();
    u.uuid = uuid;
    u.username = username;
    u.mnemonic = mnemonic;
    u.blockchains = new Map(
      Object.entries(blockchains).map(([blockchain, obj]) => {
        const blockchainKeyring = keyringForBlockchain(
          blockchain as Blockchain
        );
        blockchainKeyring.fromJson(obj);
        return [blockchain, blockchainKeyring];
      })
    );

    return u;
  }
}

export function defaultPreferences(enabledBlockchains: any): any {
  return {
    autoLockSecs: store.DEFAULT_LOCK_INTERVAL_SECS,
    approvedOrigins: [],
    enabledBlockchains,
    darkMode: DEFAULT_DARK_MODE,
    developerMode: DEFAULT_DEVELOPER_MODE,
    solana: {
      explorer: SolanaExplorer.DEFAULT,
      cluster: SolanaCluster.DEFAULT,
      commitment: "confirmed",
    },
    ethereum: {
      explorer: EthereumExplorer.DEFAULT,
      connectionUrl: EthereumConnectionUrl.DEFAULT,
    },
  };
}
