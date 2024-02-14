import type {
  Blockchain,
  LedgerKeyringInit,
  MnemonicKeyringInit,
  PrivateKeyKeyringInit,
} from "@coral-xyz/common";

import { defaultPreferences } from "../../blockchain-configs/preferences";
import { hdFactoryForBlockchain } from "../../keyring";
import { UserClient } from "../../services/user/client";
import type { KeyringTypes, UserPublicKeys } from "../../types/keyring";
import { KeyringStoreState } from "../../types/keyring";
import type { TransportSender } from "../../types/transports";
import type {
  KeyringStoreJson,
  SecureStore,
  User,
  UserPublicKeyStore,
} from "../SecureStore";

import { UserKeyring } from "./UserKeyring";

/**
 * KeyringStore API for managing all wallet keys .
 */
export class KeyringStore {
  private lastUsedTs: number;
  private password?: string;

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

  public getUserKeyring(uuid: string): UserKeyring | null {
    const userKeyring = this.users.get(uuid);
    if (!userKeyring) {
      return null;
    }
    return userKeyring;
  }

  public exportKeyringStore(): string {
    return JSON.stringify(this.toJson(), null, 2);
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Initialization.
  ///////////////////////////////////////////////////////////////////////////////

  constructor(backgroundTransportSender: TransportSender, store: SecureStore) {
    this.users = new Map();
    this.lastUsedTs = 0;
    this.userClient = new UserClient(backgroundTransportSender);
    this.store = store;
  }

  // Initializes the keystore for the first time.
  public async init(password: string, uuid: string) {
    this.password = password;

    // Persist the encrypted data to then store.
    await this.persist({ isInit: true });
    await this.persistAndLock({ dontPersist: true });
    await this.tryUnlock({ password, uuid });
  }

  public userCount(): number {
    return this.users.size;
  }

  public async usernameKeyringCreate(
    username: string,
    uuid: string
  ): Promise<UserKeyring> {
    try {
      const userKeyring = new UserKeyring(uuid, this.store, username);
      this.users.set(uuid, userKeyring);

      // Per user preferences.
      await this.store.setActiveUser({ uuid, username, hasMnemonic: false });
      await this.store.setWalletDataForUser(uuid, defaultPreferences());

      return userKeyring;
    } catch (e) {
      // remove user if something when wrong
      this.users.delete(uuid);
      await this.store.setUser(uuid, null);
      await this.store.setWalletDataForUser(uuid, undefined);
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
    await this.userClient.unlockKeyring();
    // if this is last user -> reset app
    if (this.users.size <= 1) {
      await this.reset();
    } else {
      // remove keyring:
      this.users.delete(uuid);
      // remove public data:
      await this.store.setWalletDataForUser(uuid, null);
      await this.store.setUserPublicKeys(uuid, null);
      await this.store.setUser(uuid, null);
    }
    return true;
  }

  public async tryUnlock(userInfo: { password: string; uuid: string }) {
    return this.withLock(async () => {
      const json = await this.store.getKeyringStore(userInfo);
      this.password = userInfo.password;
      await this.fromJson(json);
    });
  }

  /**
   * Check if a password is valid by attempting to decrypt the stored keyring.
   */
  public async checkPassword(password: string): Promise<boolean> {
    return this.store.checkPassword(password);
  }

  public async persistAndLock(option?: { dontPersist?: true }) {
    if (!option?.dontPersist) {
      await this.persist();
    }
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
        mnemonic = (await this.activeUserKeyring()).exportMnemonic();
        return factory.init(mnemonic, derivationPaths).publicKeys();
      });
    } else {
      return factory.init(mnemonic, derivationPaths).publicKeys();
    }
  }

  public async reset() {
    // First lock to clear the keyring memory.
    await this.persistAndLock({ dontPersist: true });
    return this.store.reset();
  }

  public async passwordUpdate(currentPassword: string, newPassword: string) {
    return this.withPasswordAndPersist(currentPassword, () => {
      this.password = newPassword;
    });
  }

  public async activeUserUpdate(uuid: string): Promise<User> {
    const userData = await this.store.getUserData();
    const user = userData.users.find((u) => u.uuid === uuid)!;
    await this.store.setActiveUser(user);
    return user;
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Passes through to the active username keyring.
  ///////////////////////////////////////////////////////////////////////////////

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

  public async keyDelete(
    uuid: string,
    blockchain: Blockchain,
    publicKey: string
  ) {
    await this.userClient.unlockKeyring();
    const userKeyring = await this.getUserKeyring(uuid);
    if (!userKeyring) {
      throw "Unable to delete publicKey: Userkeyring not found";
    }

    // get all publickey for user.
    const allPublicKeys = Object.values(userKeyring.publicKeys())
      .map((blockchainPublicKeys) => Object.values(blockchainPublicKeys))
      .flat(3);

    // if this is the last keyring of that user, remove user.
    if (allPublicKeys.length <= 1) {
      await this.removeUser(uuid);
    } else {
      await userKeyring.keyDelete({ blockchain, publicKey });
      await this.store.setUserPublicKey(uuid, blockchain, publicKey, null);
    }
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
      await this.activeUserKeyring().then((keyring) =>
        keyring.setMnemonic(mnemonic)
      );
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
  private async withLock<T>(fn: () => Promise<T>): Promise<T> {
    if (await this.isUnlocked()) {
      throw new Error("keyring store is not locked");
    }
    const resp = await fn();
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

  public async persist({ isInit = false }: { isInit?: boolean } = {}) {
    if (!this.password) {
      throw new Error("attempted persist keyring before initialization");
    }
    if (!isInit && !this.isUnlocked()) {
      throw new Error("attempted persist of locked keyring");
    }
    await this.store.setKeyringStore(this.toJson(), this.password);
  }

  public async persistAndReunlock({ uuid }: { uuid: string }) {
    if (!this.password) {
      throw new Error("attempted reunlock keyring before initialization");
    }
    await this.persistAndLock();
    await this.tryUnlock({ uuid, password: this.password });
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
        this.populateUserPubkeyStore(uuid, keyring).catch(() => {
          console.error(`Failed to populate user: ${uuid}`);
        })
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
      activePlatform: Object.keys(publicKeys)[0] as Blockchain,
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
