import { BrowserRuntime } from "../common/browser";

export class KeyringStore {
  // Persistant data encrypted.
  private db: Db;

  // Volatile data in plaintext.
  private memDb: Db;

  //
  //	private keyring: HdKeyring;

  //
  //	private

  //
  constructor(db: LocalStorageDb, memDb: MemDb) {}

  /*
	// Creates a new keyring with the given mnemonic.
	public addKeyring(keyring: Keyring) {

	}
	*/

  /*
	public static fromLocalStorage(): KeyringStore {
		const localStorage = new LocalStorageDb();
		const encryptedKeyrings = localStorage.get('keyrings');
	}
	*/

  public unlockKeyrings() {
    // todo
  }

  public lockKeyrings() {}
}

export interface Db {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
}

class LocalStorageDb implements Db {
  async get(key: string): Promise<any> {
    return await BrowserRuntime.getLocalStorage(key);
  }

  async set(key: string, value: any): Promise<void> {
    await BrowserRuntime.setLocalStorage(key, value);
  }
}

class MemDb {
  private db = {};

  async get(key: string): Promise<any> {
    return this.db[key];
  }
  async set(key: string, value: any): Promise<void> {
    this.db[key] = value;
  }
}
