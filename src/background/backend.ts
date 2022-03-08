import { PublicKey, TransactionSignature } from "@solana/web3.js";
import {
  KEY_CONNECTION_URL,
  LocalStorageDb,
  KeyringStore,
  KeyringStoreState,
} from "../keyring/store";
import { DerivationPath } from "../keyring/crypto";
import { KeynameStore, getWalletData, setWalletData } from "../keyring/store";
import {
  NotificationsClient,
  NOTIFICATION_KEYRING_KEY_DELETE,
  NOTIFICATION_KEYNAME_UPDATE,
  NOTIFICATION_KEYRING_DERIVED_WALLET,
  NOTIFICATION_ACTIVE_WALLET_UPDATED,
  NOTIFICATION_KEYRING_IMPORTED_SECRET_KEY,
} from "../common";

const SUCCESS_RESPONSE = "success";

export class Backend {
  private keyringStore: KeyringStore;
  private notifications: NotificationsClient;

  constructor(notifications: NotificationsClient) {
    this.keyringStore = new KeyringStore(notifications);
    this.notifications = notifications;
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
    this.keyringStore.keepAlive();
    return SUCCESS_RESPONSE;
  }

  // Returns all pubkeys available for signing.
  async keyringStoreReadAllPubkeys(): Promise<{
    hdPublicKeys: Array<NamedPublicKey>;
    importedPublicKeys: Array<NamedPublicKey>;
  }> {
    const pubkeys = this.keyringStore.publicKeys();
    const [hdNames, importedNames] = await Promise.all([
      Promise.all(pubkeys.hdPublicKeys.map((pk) => KeynameStore.getName(pk))),
      Promise.all(
        pubkeys.importedPublicKeys.map((pk) => KeynameStore.getName(pk))
      ),
    ]);
    return {
      hdPublicKeys: pubkeys.hdPublicKeys.map((pk, idx) => {
        return {
          publicKey: pk.toString(),
          name: hdNames[idx],
        };
      }),
      importedPublicKeys: pubkeys.importedPublicKeys.map((pk, idx) => {
        return {
          publicKey: pk.toString(),
          name: importedNames[idx],
        };
      }),
    };
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

  async activeWallet(): Promise<string> {
    const { activeWallet } = await getWalletData();
    return activeWallet;
  }

  async activeWalletUpdate(newWallet: string): Promise<string> {
    const data = await getWalletData();
    await setWalletData({
      ...data,
      activeWallet: newWallet,
    });
    this.notifications.pushNotification({
      name: NOTIFICATION_ACTIVE_WALLET_UPDATED,
      data: {
        activeWallet: newWallet,
      },
    });
    return SUCCESS_RESPONSE;
  }

  async keyringDeriveWallet(): Promise<string> {
    // Derive the next key.
    const [pubkey, accountIndex] = this.keyringStore.deriveNextKey();
    // Save a default name.
    const name = `Wallet ${accountIndex + 1}`;
    await KeynameStore.setName(pubkey, name);

    // Fire notification to listeners.
    this.notifications.pushNotification({
      name: NOTIFICATION_KEYRING_DERIVED_WALLET,
      data: {
        publicKey: pubkey.toString(),
        name,
      },
    });
    // Return the newly created key.
    return pubkey.toString();
  }

  async keynameUpdate(pubkey: PublicKey, newName: string): Promise<string> {
    await KeynameStore.setName(pubkey, newName);
    this.notifications.pushNotification({
      name: NOTIFICATION_KEYNAME_UPDATE,
      data: {
        publicKey: pubkey.toString(),
        name: newName,
      },
    });
    return SUCCESS_RESPONSE;
  }

  async keyringKeyDelete(pubkey: PublicKey): Promise<string> {
    const walletData = await getWalletData();
    await setWalletData({
      ...walletData,
      deletedWallets: walletData.deletedWallets.concat([pubkey.toString()]),
    });
    this.notifications.pushNotification({
      name: NOTIFICATION_KEYRING_KEY_DELETE,
      data: {
        publicKey: pubkey.toString(),
      },
    });
    return SUCCESS_RESPONSE;
  }

  async passwordUpdate(
    currentPassword: string,
    newPassword: string
  ): Promise<string> {
    await this.keyringStore.passwordUpdate(currentPassword, newPassword);
    return SUCCESS_RESPONSE;
  }

  async importSecretKey(secretKey: string): Promise<string> {
    const publicKey = this.keyringStore.importSecretKey(secretKey);
    this.notifications.pushNotification({
      name: NOTIFICATION_KEYRING_IMPORTED_SECRET_KEY,
      data: {
        publicKey,
      },
    });
    return SUCCESS_RESPONSE;
  }

  keyringExportSecretKey(password: string, pubkey: string): string {
    return this.keyringStore.exportSecretKey(password, pubkey);
  }

  keyringExportMnemonic(password: string): string {
    return this.keyringStore.exportMnemonic(password);
  }

  keyringResetMnemonic(password: string): string {
    this.keyringStore.resetMnemonic(password);
    return SUCCESS_RESPONSE;
  }

  async keyringAutolockUpdate(secs: number): Promise<string> {
    await this.keyringStore.autolockUpdate(secs);
    return SUCCESS_RESPONSE;
  }
}

export type Context = {
  sender: any;
};

type MessageSignature = string;
export type NamedPublicKey = {
  publicKey: string;
  name: string;
};
