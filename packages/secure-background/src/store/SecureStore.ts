import {
  type Blockchain,
  type DeprecatedWalletDataDoNotUse,
  getEnv,
  type Preferences,
} from "@coral-xyz/common";

import { getAllBlockchainConfigs } from "../blockchain-configs/blockchains";
import type { BlockchainKeyringJson } from "../keyring/types";

import type { SecretPayload } from "./KeyringStore/crypto";
import { decrypt, encrypt } from "./KeyringStore/crypto";
import { runMigrationsIfNeeded } from "./KeyringStore/migrations";
import { PersistentStorageKeys, SessionStorageKeys } from "./storageKeys";

/**yarn
 * Persistent model for the keyring store json. This is encrypted and decrypted
 * before reading to/from local storage.
 */
export type KeyringStoreJson = {
  users: {
    [uuid: string]: UserKeyringJson;
  };
  lastUsedTs: number;
};

export type KeyNameStore = Partial<
  Record<Blockchain, { [publicKey: string]: string }>
>;
export type IsColdStore = { [publicKey: string]: boolean };

export type PublicKeyType = "derived" | "imported" | "hardware";
export type UserPublicKeyInfo = {
  type: PublicKeyType;
  isCold: boolean;
  name: string;
};
export type UserPublicKeyStore = Record<
  string,
  {
    activePlatform: Blockchain;
    platforms: Partial<
      Record<
        Blockchain,
        {
          activePublicKey: string;
          publicKeys: { [publicKey: string]: UserPublicKeyInfo };
        }
      >
    >;
  }
>;
export type UserKeyringJson = {
  uuid: string;
  username: string;
  activeBlockchain?: Blockchain;
  mnemonic?: string;
  blockchains: {
    [blockchain: string]: BlockchainKeyringJson;
  };
};

export type SecureDBValue = any;

export interface SecureDB<K extends string> {
  export: () => Promise<Partial<Record<K, SecureDBValue>>>;
  import: (store: Partial<Record<K, SecureDBValue>>) => Promise<void>;
  get: <V extends SecureDBValue>(key: K) => Promise<V | undefined>;
  set: (key: K, value: SecureDBValue) => Promise<void>;
  remove: (key: K) => Promise<void>;
  reset: () => Promise<void>;
}

type UserData = {
  activeUser: User;
  users: Array<User>;
};

export type User = {
  username: string;
  uuid: string;
  hasMnemonic: boolean;
};

export type MigrationPrivateStoreInterface = {
  store: SecureStore;
  db: SecureDB<PersistentStorageKeys>;
  getKeyringCiphertext: () => Promise<SecretPayload>;
  getKeyringStore_NO_MIGRATION: (password: string) => Promise<KeyringStoreJson>;
  getWalletData_DEPRECATED: () => Promise<
    DeprecatedWalletDataDoNotUse | undefined
  >;
  setWalletData_DEPRECATED: (
    data: undefined | DeprecatedWalletDataDoNotUse
  ) => Promise<void>;
};

export class SecureStore {
  private persistentDB: SecureDB<PersistentStorageKeys | string>;
  private sessionDB: SecureDB<SessionStorageKeys>;

  public defaultKeyname = {
    defaultDerived(index: number): string {
      return `Wallet ${index}`;
    },
    defaultImported(index: number): string {
      return `Imported Wallet ${index}`;
    },
    defaultLedger(index: number): string {
      return `Ledger ${index}`;
    },
  };

  // this privatStore is passed to migrations
  // to provide access to deprecated and select private methods
  private MigrationPrivateStoreInterface: () => MigrationPrivateStoreInterface =
    () => {
      return {
        store: this,
        db: this.persistentDB,
        getKeyringCiphertext: this.getKeyringCiphertext.bind(this),
        getKeyringStore_NO_MIGRATION:
          this.getKeyringStore_NO_MIGRATION.bind(this),
        getWalletData_DEPRECATED: this.getWalletData_DEPRECATED.bind(this),
        setWalletData_DEPRECATED: this.setWalletData_DEPRECATED.bind(this),
      };
    };

  constructor(dbs: {
    persistentDB: SecureDB<PersistentStorageKeys | string>;
    sessionDB: SecureDB<SessionStorageKeys>;
  }) {
    this.persistentDB = dbs.persistentDB;
    this.sessionDB = dbs.sessionDB;
  }

  async reset() {
    return Promise.all([this.persistentDB.reset(), this.sessionDB.reset()]);
  }

  async export() {
    return this.persistentDB.export();
  }

  async setUnlockedUntil(dateMs: number) {
    await this.persistentDB.set(
      PersistentStorageKeys.STORE_UNLOCK_UNTIL_KEY,
      dateMs + ""
    );
  }

  async getUnlockedUntil() {
    const unlockedUntil = await this.persistentDB.get<string>(
      PersistentStorageKeys.STORE_UNLOCK_UNTIL_KEY
    );
    return parseInt(unlockedUntil ?? "0");
  }

  async getSessionPassword(uuid: string): Promise<string | undefined> {
    const [preferences, password] = await Promise.all([
      await this.getWalletDataForUser(uuid),
      this.sessionDB.get<string>(
        SessionStorageKeys.KEYRING_SESSION_PASSWORD_STORAGE_KEY
      ),
    ]);

    const platform = getEnv();
    const isMobile = platform.startsWith("mobile");

    // IMPORTANT: on mobile were always unlocked. -> return session password
    if (isMobile) {
      return password;
    }
    const unlockUntil = await this.getUnlockedUntil();
    // if we should be auto-unlocked -> return session password
    if (unlockUntil > Date.now()) {
      return password;
      // ? Buffer.from(password, "hex").toString("utf-8")
      // : undefined;
    }
    // if there is a password but we should be locked -> remove the password.
    if (password) {
      await this.removeSessionPassword();
    }
    return undefined;
  }

  async removeSessionPassword(): Promise<void> {
    const platform = getEnv();
    const isMobile = platform.startsWith("mobile");

    // IMPORTANT Dont touch password on mobile
    if (!isMobile) {
      await this.sessionDB.remove(
        SessionStorageKeys.KEYRING_SESSION_PASSWORD_STORAGE_KEY
      );
    }
  }

  async setSessionPassword(password: string): Promise<void> {
    // IMPORTANT Dont touch password on mobile for backwards compatibility
    // if (!isMobile) {
    //   password = Buffer.from(password).toString("hex");
    // }
    return this.sessionDB.set(
      SessionStorageKeys.KEYRING_SESSION_PASSWORD_STORAGE_KEY,
      password
    );
  }

  async import(items: { [key: string]: any }) {
    await this.persistentDB.import(items);
    await this.sessionDB.reset();
  }

  async setUserPublicKey(
    userId: string,
    blockchain: Blockchain,
    publicKey: string,
    info: Partial<UserPublicKeyInfo> | null
  ) {
    const publicKeyStore: UserPublicKeyStore =
      (await this.persistentDB.get(
        PersistentStorageKeys.USER_PUBLIC_KEY_STORE
      )) ?? {};

    if (info) {
      if (
        // info isnt complete
        !("isCold" in info && "name" in info && "type" in info) &&
        // and pubkey
        !publicKeyStore[userId].platforms[blockchain]?.publicKeys[publicKey]
      ) {
        // cant partially update unknown publickey
        throw new Error("Unknown PublicKey");
      }
      publicKeyStore[userId] ??= {
        activePlatform: blockchain,
        platforms: {},
      };
      publicKeyStore[userId].platforms[blockchain] ??= {
        activePublicKey: publicKey,
        publicKeys: {},
      };

      publicKeyStore[userId].activePlatform ??= blockchain;

      const current =
        publicKeyStore[userId].platforms[blockchain]!.publicKeys[publicKey];
      publicKeyStore[userId].platforms[blockchain]!.publicKeys[publicKey] = {
        ...(current ?? {}),
        ...info,
      };
    } else {
      // if we remove a pubkey (null)
      const user = publicKeyStore[userId];
      const platform = user?.platforms[blockchain];
      if (user && platform) {
        // if last pubkey on platform -> remove Platform
        if (
          platform.publicKeys[publicKey] &&
          Object.keys(platform.publicKeys).length <= 1
        ) {
          return this.setUserPlatform(userId, blockchain, null);
        }
        // not last pubkey on platform
        else {
          delete platform.publicKeys[publicKey];
          // update activePublickey if necessary
          if (platform.activePublicKey === publicKey) {
            platform.activePublicKey = Object.keys(platform.publicKeys)[0];
          }
        }
      }
    }
    await this.persistentDB.set(
      PersistentStorageKeys.USER_PUBLIC_KEY_STORE,
      publicKeyStore
    );
  }

  async setUserPublicKeys(
    userId: string,
    publicKeys: UserPublicKeyStore[string] | null
  ) {
    const publicKeyStore =
      (await this.persistentDB.get(
        PersistentStorageKeys.USER_PUBLIC_KEY_STORE
      )) ?? {};
    if (publicKeys) {
      publicKeyStore[userId] = publicKeys;
    } else {
      delete publicKeyStore[userId];
    }
    await this.persistentDB.set(
      PersistentStorageKeys.USER_PUBLIC_KEY_STORE,
      publicKeyStore
    );
  }

  async setUserPlatform(
    userId: string,
    platform: Blockchain,
    publicKeys: UserPublicKeyStore[string]["platforms"][Blockchain] | null
  ) {
    const publicKeyStore: UserPublicKeyStore =
      (await this.persistentDB.get(
        PersistentStorageKeys.USER_PUBLIC_KEY_STORE
      )) ?? {};
    if (publicKeys) {
      publicKeyStore[userId] ??= {
        activePlatform: platform,
        platforms: {},
      };
      publicKeyStore[userId].platforms[platform] = publicKeys;
    } else {
      const user = publicKeyStore[userId];
      if (user) {
        // if last platform on user -> remove user
        if (
          user.platforms[platform] &&
          Object.keys(user.platforms).length <= 1
        ) {
          // delete User
          delete publicKeyStore[userId];
        }
        // not last platform
        else {
          delete user.platforms[platform];
          // update activePlatform if necessary
          if (user.activePlatform === platform) {
            user.activePlatform = Object.keys(user.platforms)[0] as Blockchain;
          }
        }
      }
    }
    await this.persistentDB.set(
      PersistentStorageKeys.USER_PUBLIC_KEY_STORE,
      publicKeyStore
    );
  }

  async setUserActivePublicKey(
    userId: string,
    blockchain: Blockchain,
    publicKey: string
  ) {
    const publicKeyStore: UserPublicKeyStore =
      (await this.persistentDB.get(
        PersistentStorageKeys.USER_PUBLIC_KEY_STORE
      )) ?? {};
    const publicKeyInfo =
      publicKeyStore[userId].platforms[blockchain]?.publicKeys[publicKey];
    if (!publicKey) {
      throw new Error("Unknown PublicKey");
    }

    publicKeyStore[userId].platforms[blockchain]!.activePublicKey = publicKey;
    publicKeyStore[userId].activePlatform = blockchain;

    await this.persistentDB.set(
      PersistentStorageKeys.USER_PUBLIC_KEY_STORE,
      publicKeyStore
    );
  }

  async getUserPublicKeys(
    user: string
  ): Promise<UserPublicKeyStore[string] | null> {
    const publicKeyStore: UserPublicKeyStore =
      (await this.persistentDB.get(
        PersistentStorageKeys.USER_PUBLIC_KEY_STORE
      )) ?? {};
    return publicKeyStore[user] ?? null;
  }

  async getUserPublicKey(
    user: string,
    blockchain: Blockchain,
    publicKey: string
  ): Promise<UserPublicKeyInfo | null> {
    const publicKeyStore: UserPublicKeyStore =
      (await this.persistentDB.get(
        PersistentStorageKeys.USER_PUBLIC_KEY_STORE
      )) ?? {};
    return (
      publicKeyStore[user]?.platforms[blockchain]?.publicKeys[publicKey] ?? null
    );
  }

  async _getIsColdStore(): Promise<IsColdStore> {
    return (
      (await this.persistentDB.get(PersistentStorageKeys.KEY_IS_COLD_STORE)) ??
      {}
    );
  }

  async _getKeynameStore(): Promise<KeyNameStore> {
    return (
      (await this.persistentDB.get(PersistentStorageKeys.KEY_KEYNAME_STORE)) ??
      {}
    );
  }

  async getActiveUser(): Promise<User> {
    const data = await this.getUserData();
    return data.activeUser;
  }

  async switchActiveUser(uuid: string) {
    const data = (await this.persistentDB.get(
      PersistentStorageKeys.STORE_KEY_USER_DATA
    )) as UserData;

    const newActiveUser = data?.users.find((user) => user.uuid === uuid);

    if (!newActiveUser) {
      throw new Error("Unknown User");
    }
    await this.persistentDB.set(PersistentStorageKeys.STORE_KEY_USER_DATA, {
      activeUser: newActiveUser,
      users: data.users,
    });
  }

  async setActiveUser(activeUser: User) {
    const data = await this.persistentDB.get<UserData>(
      PersistentStorageKeys.STORE_KEY_USER_DATA
    );
    if (!data) {
      await this.persistentDB.set(PersistentStorageKeys.STORE_KEY_USER_DATA, {
        activeUser,
        users: [activeUser],
      });
    } else {
      let isNew = !data.users.some((u: any) => u.uuid === activeUser.uuid);
      const users = isNew ? data.users.concat([activeUser]) : data.users;
      await this.persistentDB.set(PersistentStorageKeys.STORE_KEY_USER_DATA, {
        activeUser,
        users,
      });
    }
  }

  async getUserData(): Promise<UserData> {
    const data = await this.persistentDB.get<UserData>(
      PersistentStorageKeys.STORE_KEY_USER_DATA
    );
    if (!data) {
      throw new Error("user data not found");
    }
    return data;
  }

  async setUser(
    uuid: string,
    updateData: Partial<User> | null
  ): Promise<User | null> {
    const data = await this.persistentDB.get<UserData>(
      PersistentStorageKeys.STORE_KEY_USER_DATA
    );
    const user = data?.users.find((u: User) => u.uuid === uuid);
    if (!user) {
      throw "Unknown User";
    }
    if (!updateData) {
      // if data=== null -> remove user
      const newUsers = data?.users.filter((u: User) => u.uuid !== uuid) ?? [];
      if (newUsers.length === 0) {
        await this.persistentDB.remove(
          PersistentStorageKeys.STORE_KEY_USER_DATA
        );
        return null;
      }
      // if active user was removed -> update active user
      const newActiveUser =
        data?.activeUser.uuid === uuid ? newUsers[0] : data?.activeUser;

      await this.persistentDB.set(PersistentStorageKeys.STORE_KEY_USER_DATA, {
        activeUser: newActiveUser,
        users: newUsers,
      });
      return null;
    }
    const updatedUser = {
      ...user,
      ...updateData,
    };
    await this.persistentDB.set(PersistentStorageKeys.STORE_KEY_USER_DATA, {
      activeUser:
        data?.activeUser.uuid === uuid ? updatedUser : data?.activeUser,
      users: data?.users.map((u: User) => (u.uuid === uuid ? updatedUser : u)),
    });
    return updatedUser;
  }

  async setUserData(data: UserData) {
    await this.persistentDB.set(
      PersistentStorageKeys.STORE_KEY_USER_DATA,
      data
    );
  }

  async getWalletDataForUser(uuid: string): Promise<Preferences> {
    const data = await this.persistentDB.get<Preferences>(
      this.walletDataKey(uuid)
    );
    if (!data) {
      throw new Error(`wallet data for user ${uuid} is undefined`);
    }

    const platform = getEnv();
    const isMobile = platform.startsWith("mobile");

    // TODO: confirm that this migration can now be removed, then delete it
    if (isMobile) {
      try {
        /**
         * this migration
         * (1) extracts the protocol://domain:port from all of the origin URLS
         *     note that ':port' will only be included if it's not 80 or 443
         * (2) removes any duplicate values
         */
        data.approvedOrigins = Array.from(
          new Set(
            (data as Preferences).approvedOrigins.map((o) => {
              const parsedUrl = new URL(o);
              return `${parsedUrl.protocol}//${parsedUrl.host}`;
            })
          )
        );
      } catch (err) {
        console.error("Approved Origins migration failed", err);
      }
    }

    //
    // Migrate everything, lazily.
    //
    // @ts-ignore
    if (data.solana && data.ethereum) {
      // @ts-ignore
      data.blockchains = {
        // @ts-ignore
        solana: {
          // @ts-ignore
          ...data.solana,
          // @ts-ignore
          connectionUrl: data.solana.cluster,
        },
        // @ts-ignore
        ethereum: {
          // @ts-ignore
          ...data.ethereum,
        },
      };
      // @ts-ignore
      data.solana = undefined;
      // @ts-ignore
      data.ethereum = undefined;
      // Lazily blockchains if needed.
    }

    Object.entries(getAllBlockchainConfigs()).forEach(
      ([blockchain, { PreferencesDefault }]) => {
        data.blockchains[blockchain] = Object.fromEntries(
          Object.entries(PreferencesDefault).map(([key, defaultValue]) => {
            let value = data.blockchains?.[blockchain]?.[key];
            if (!value || value === "") {
              value = defaultValue;
            }
            return [key, value];
          })
        );
        // migrate off xnfts.dev connection URLs.
        if (
          data.blockchains[blockchain]?.connectionUrl?.includes("xnfts.dev")
        ) {
          data.blockchains[blockchain].connectionUrl =
            PreferencesDefault.connectionUrl;
        }
      }
    );
    return data;
  }

  async setWalletDataForUser(uuid: string, data?: Preferences | null) {
    if (data) {
      data.preferencesLastUpdated = Date.now();
      await this.persistentDB.set(this.walletDataKey(uuid), data);
    } else {
      await this.persistentDB.remove(this.walletDataKey(uuid));
    }
  }

  private walletDataKey(uuid: string): string {
    return `${PersistentStorageKeys.STORE_KEY_WALLET_DATA}_${uuid}`;
  }

  private async getWalletData_DEPRECATED(): Promise<
    DeprecatedWalletDataDoNotUse | undefined
  > {
    const data = await this.persistentDB.get<DeprecatedWalletDataDoNotUse>(
      PersistentStorageKeys.STORE_KEY_WALLET_DATA
    );
    return data;
  }

  private async setWalletData_DEPRECATED(
    data: undefined | DeprecatedWalletDataDoNotUse
  ) {
    if (data) {
      await this.persistentDB.set(
        PersistentStorageKeys.STORE_KEY_WALLET_DATA,
        data
      );
    } else {
      await this.persistentDB.remove(
        PersistentStorageKeys.STORE_KEY_WALLET_DATA
      );
    }
  }

  // The keyring store should only ever be accessed through this method.
  //
  // Note: this method reserves the right to mutate `userInfo`. This is required
  //       for example, for the 510 migration, where a UUID doesn't exist and
  //       so the migration needs to get and fetch it--and set it on the
  //       `userInfo` object for use elsewhere.
  async getKeyringStore(userInfo: {
    uuid: string;
    password: string;
  }): Promise<KeyringStoreJson> {
    await runMigrationsIfNeeded(
      userInfo,
      this.MigrationPrivateStoreInterface()
    );
    const json = await this.getKeyringStore_NO_MIGRATION(userInfo.password);
    return json;
  }

  private async getKeyringStore_NO_MIGRATION(password: string) {
    const ciphertextPayload = await this.getKeyringCiphertext();
    if (ciphertextPayload === undefined || ciphertextPayload === null) {
      throw new Error("keyring store not found on disk");
    }
    const plaintext = await decrypt(ciphertextPayload, password);
    const json = JSON.parse(plaintext);
    return json;
  }

  async checkPassword(password: string): Promise<boolean> {
    try {
      await this.getKeyringStore_NO_MIGRATION(password);
      return true;
    } catch (err) {
      return false;
    }
  }

  async doesCiphertextExist(): Promise<boolean> {
    const ciphertext = await this.getKeyringCiphertext();
    return ciphertext !== undefined && ciphertext !== null;
  }

  async setKeyringStore(
    json: KeyringStoreJson,
    password: string
  ): Promise<void> {
    const plaintext = JSON.stringify(json);
    const ciphertext = await encrypt(plaintext, password);
    await this.setKeyringCiphertext(ciphertext);
  }

  // Never call this externally. Only exported for migrations.
  private async getKeyringCiphertext(): Promise<SecretPayload | undefined> {
    return await this.persistentDB.get<SecretPayload>(
      PersistentStorageKeys.KEY_KEYRING_STORE
    );
  }

  private async setKeyringCiphertext(ciphertext: SecretPayload) {
    await this.persistentDB.set(
      PersistentStorageKeys.KEY_KEYRING_STORE,
      ciphertext
    );
  }
}
