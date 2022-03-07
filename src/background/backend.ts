import { TransactionSignature } from "@solana/web3.js";
import {
  KEY_CONNECTION_URL,
  LocalStorageDb,
  KeyringStore,
  KeyringStoreState,
} from "../keyring/store";
import { DerivationPath } from "../keyring/crypto";
import { NotificationsClient } from "../common";

const SUCCESS_RESPONSE = "success";

export class Backend {
  private keyringStore: KeyringStore;

  constructor(notifications: NotificationsClient) {
    this.keyringStore = new KeyringStore(notifications);
  }

  connect(ctx: Context, onlyIfTrustedMaybe: boolean) {
    // todo
    return SUCCESS_RESPONSE;
  }

  disconnect(ctx: Context) {
    // todo
    return SUCCESS_RESPONSE;
  }

  signAndSendTx(ctx: Context, tx: any): TransactionSignature {
    // todo
    const txId = "todo";
    return txId;
  }

  signMessage(ctx: Context, msg: any): MessageSignature {
    // todo
    const signature = "todo";
    return signature;
  }

  // Creates a brand new keyring store. Should be run once on initializtion.
  async keyringStoreCreate(
    mnemonic: string,
    derivationPath: DerivationPath,
    password: string
  ): Promise<string> {
    await this.keyringStore.init(mnemonic, derivationPath, password);
    return SUCCESS_RESPONSE;
  }

  async keyringStoreUnlock(password: string): Promise<String> {
    await this.keyringStore.tryUnlock(password);
    return SUCCESS_RESPONSE;
  }

  keyringStoreLock() {
    this.keyringStore.lock();
    return SUCCESS_RESPONSE;
  }

  async keyringStoreState(): Promise<KeyringStoreState> {
    return await this.keyringStore.state();
  }

  keyringStoreKeepAlive(): string {
    this.keyringStore.updateLastUsed();
    return SUCCESS_RESPONSE;
  }

  // Returns all pubkeys available for signing.
  keyringStoreReadAllPubkeys(): Array<string> {
    // todo
    return ["Bq9hhowd6Q7a3T63Jw13p7VRx3jEmFc8vQBo6MD9jYyb"];
  }

  // Adds a new HdKeyring to the store.
  hdKeyringCreate(mnemonic: string): string {
    // todo
    return SUCCESS_RESPONSE;
  }

  // Adds a new ecretKey to the store (secret key is a private not a mnemonic).
  keyringCreate(secretKey: string): string {
    // todo
    return SUCCESS_RESPONSE;
  }

  async connectionUrlRead(): Promise<string> {
    return await LocalStorageDb.get(KEY_CONNECTION_URL);
  }

  async connectionUrlUpdate(url: string): Promise<boolean> {
    const oldUrl = await LocalStorageDb.get(KEY_CONNECTION_URL);
    if (oldUrl === url) {
      return false;
    }
    await LocalStorageDb.set(KEY_CONNECTION_URL, url);
    return true;
  }
}

export type Context = {
  sender: any;
};

type MessageSignature = string;
