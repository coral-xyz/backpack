import { TransactionSignature } from "@solana/web3.js";
import { KeyringStore, KeyringStoreState } from "../keyring/store";
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
    return [];
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
}

export type Context = {
  sender: any;
};

type MessageSignature = string;
