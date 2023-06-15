import type {
  Blockchain,
  BlockchainKeyringJson,
  DeprecatedWalletDataDoNotUse,
  Preferences,
} from "@coral-xyz/common";

import type { SecretPayload } from "./keyring/crypto";
import { decrypt, encrypt } from "./keyring/crypto";
import { runMigrationsIfNeeded } from "./keyring/migrations";

export { extensionDB } from "./extensionDB";

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

export type UserKeyringJson = {
  uuid: string;
  username: string;
  activeBlockchain: Blockchain;
  mnemonic?: string;
  blockchains: {
    [blockchain: string]: BlockchainKeyringJson;
  };
};

export interface SecureDB {
  get: (key: string) => Promise<any>;
  set: (key: string, value: any) => Promise<void>;
  remove: (key: string) => Promise<void>;
  reset: () => Promise<void>;
}

type UserData = {
  activeUser: User;
  users: Array<User>;
};

export type User = {
  username: string;
  uuid: string;
  jwt: string;
};

export type MigrationPrivateStoreInterface = {
  store: SecureStore;
  db: SecureDB;
  getKeyringCiphertext: () => Promise<SecretPayload>;
  getKeyringStore_NO_MIGRATION: (password: string) => Promise<KeyringStoreJson>;
  getWalletData_DEPRECATED: () => Promise<
    DeprecatedWalletDataDoNotUse | undefined
  >;
  setWalletData_DEPRECATED: (
    data: undefined | DeprecatedWalletDataDoNotUse
  ) => Promise<void>;
};

const KEY_IS_COLD_STORE = "is-cold-store";
const KEY_KEYNAME_STORE = "keyname-store";
const STORE_KEY_USER_DATA = "user-data";
const STORE_KEY_WALLET_DATA = "wallet-data";
const KEY_KEYRING_STORE = "keyring-store";

export class SecureStore {
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
  private MigrationPrivateStoreInterface: MigrationPrivateStoreInterface = {
    store: this,
    db: this.db,
    getKeyringCiphertext: this.getKeyringCiphertext.bind(this),
    getKeyringStore_NO_MIGRATION: this.getKeyringStore_NO_MIGRATION.bind(this),
    getWalletData_DEPRECATED: this.getWalletData_DEPRECATED.bind(this),
    setWalletData_DEPRECATED: this.setWalletData_DEPRECATED.bind(this),
  };

  constructor(private db: SecureDB) {}

  async reset() {
    return this.db.reset();
  }

  async setIsCold(publicKey: string, isCold?: boolean) {
    let keynames = await this.db.get(KEY_IS_COLD_STORE);
    if (!keynames) {
      keynames = {};
    }
    keynames[publicKey] = isCold;
    await this.db.set(KEY_IS_COLD_STORE, keynames);
  }

  async getIsCold(publicKey: string): Promise<boolean> {
    const isColdKeys = await this.db.get(KEY_IS_COLD_STORE);
    const isCold = !!isColdKeys?.[publicKey];
    return isCold;
  }

  async setKeyname(publicKey: string, name: string) {
    let keynames = await this.db.get(KEY_KEYNAME_STORE);
    if (!keynames) {
      keynames = {};
    }
    keynames[publicKey] = name;
    await this.db.set(KEY_KEYNAME_STORE, keynames);
  }

  async getKeyname(publicKey: string): Promise<string> {
    const names = await this.db.get(KEY_KEYNAME_STORE);
    const name = names[publicKey];
    if (!name) {
      throw Error(`unable to find name for key: ${publicKey.toString()}`);
    }
    return name;
  }

  async getActiveUser(): Promise<User> {
    const data = await this.getUserData();
    return data.activeUser;
  }

  async setActiveUser(activeUser: User) {
    const data = await this.db.get(STORE_KEY_USER_DATA);
    if (data == undefined || data == null) {
      await this.db.set(STORE_KEY_USER_DATA, {
        activeUser,
        users: [activeUser],
      });
    } else {
      let isNew = !data.users.some((u: any) => u.uuid === activeUser.uuid);
      const users = isNew ? data.users.concat([activeUser]) : data.users;
      await this.db.set(STORE_KEY_USER_DATA, {
        activeUser,
        users,
      });
    }
  }

  async getUserData(): Promise<UserData> {
    const data = await this.db.get(STORE_KEY_USER_DATA);
    if (data === undefined) {
      throw new Error("user data not found");
    }
    return data;
  }

  /**
   * Used to update users in storage. This is primarily used for updating the
   * cached JWT value, but may be used if usernames are made immutable in the
   * future.
   */
  async setUser(uuid: string, updateData: Partial<User>): Promise<User> {
    const data = await this.db.get(STORE_KEY_USER_DATA);
    const user = data.users.find((u: User) => u.uuid === uuid);
    const updatedUser = {
      ...user,
      ...updateData,
    };
    await this.db.set(STORE_KEY_USER_DATA, {
      activeUser: data.activeUser.uuid === uuid ? updatedUser : data.activeUser,
      users: data.users
        .filter((u: User) => u.uuid !== uuid)
        .concat([updatedUser]),
    });
    return updatedUser;
  }

  async setUserData(data: UserData) {
    await this.db.set(STORE_KEY_USER_DATA, data);
  }

  async getWalletDataForUser(uuid: string): Promise<Preferences> {
    const data = await this.db.get(this.walletDataKey(uuid));
    if (data === undefined) {
      throw new Error(`wallet data for user ${uuid} is undefined`);
    }
    return data;
  }

  async setWalletDataForUser(uuid: string, data?: Preferences) {
    await this.db.set(this.walletDataKey(uuid), data);
  }

  private walletDataKey(uuid: string): string {
    return `${STORE_KEY_WALLET_DATA}_${uuid}`;
  }

  private async getWalletData_DEPRECATED(): Promise<
    DeprecatedWalletDataDoNotUse | undefined
  > {
    const data = await this.db.get(STORE_KEY_WALLET_DATA);
    return data;
  }

  private async setWalletData_DEPRECATED(
    data: undefined | DeprecatedWalletDataDoNotUse
  ) {
    await this.db.set(STORE_KEY_WALLET_DATA, data);
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
    await runMigrationsIfNeeded(userInfo, this.MigrationPrivateStoreInterface);
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

  async checkPassword(password: string) {
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
    const ciphertext = await encrypt(plaintext, password!);
    await this.setKeyringCiphertext(ciphertext);
  }

  // Never call this externally. Only exported for migrations.
  private async getKeyringCiphertext(): Promise<SecretPayload> {
    return await this.db.get(KEY_KEYRING_STORE);
  }

  private async setKeyringCiphertext(ciphertext: SecretPayload) {
    await this.db.set(KEY_KEYRING_STORE, ciphertext);
  }
}
