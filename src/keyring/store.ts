import { PublicKey } from "@solana/web3.js";
import { BrowserRuntime } from "../common/browser";
import * as crypto from "./crypto";
import { DerivationPath } from "./crypto";
import { HdKeyring, Keyring } from ".";
import {
  NotificationsClient,
  NOTIFICATION_KEYRING_STORE_LOCKED,
} from "../common";

const LOCK_INTERVAL_SECS = 15 * 60 * 1000;

const SOLANA = "solana";

export class KeyringStore {
  private notifications: NotificationsClient;
  private lastUsedTs: number;
  private password?: string;
  private autoLockInterval?: ReturnType<typeof setInterval>;
  private blockchains: Map<string, BlockchainKeyring>;
  private activeBlockchainLabel: string;

  constructor(notifications: NotificationsClient) {
    this.activeBlockchainLabel = SOLANA;
    this.blockchains = new Map([[SOLANA, new BlockchainKeyring()]]);
    this.notifications = notifications;
    this.lastUsedTs = 0;
    this.autoLockStart();
  }

  public async state(): Promise<KeyringStoreState> {
    if (this.isUnlocked()) {
      return KeyringStoreStateEnum.Unlocked;
    }
    if (await this.isLocked()) {
      return KeyringStoreStateEnum.Locked;
    }
    return KeyringStoreStateEnum.NeedsOnboarding;
  }

  public publicKeys(): {
    hdPublicKeys: Array<PublicKey>;
    importedPublicKeys: Array<PublicKey>;
  } {
    if (!this.isUnlocked()) {
      throw new Error("keyring store is not unlocked");
    }
    return this.activeBlockchain().publicKeys();
  }

  public lock() {
    this.activeBlockchain().lock();
    this.lastUsedTs = 0;
  }

  public async tryUnlock(password: string) {
    if (this.isUnlocked()) {
      throw new Error("unable to unlock");
    }

    // Decrypt the keyring from storage.
    const ciphertextPayload = await LocalStorageDb.get(KEY_KEYRING_STORE);
    if (ciphertextPayload === undefined || ciphertextPayload === null) {
      throw new Error("keyring store not found on disk");
    }
    const plaintext = await crypto.decrypt(ciphertextPayload, password);
    const { solana, lastUsedTs: _ } = JSON.parse(plaintext);

    // Unlock the keyring stores.
    this.activeBlockchain().tryUnlock(solana);
    this.password = password;
    this.updateLastUsed();
  }

  // Initializes the keystore for the first time.
  public async init(
    mnemonic: string,
    derivationPath: DerivationPath,
    password: string
  ) {
    if (this.isUnlocked()) {
      throw new Error("unable to initialize");
    }

    //
    this.password = password;

    // Initialize keyrings.
    this.activeBlockchain().init(mnemonic, derivationPath);

    // Update last used timestamp.
    this.updateLastUsed();

    // Persist the initial wallet ui metadata.
    await setWalletData({
      autoLockSecs: LOCK_INTERVAL_SECS,
    });

    // Persist the encrypted data to then store.
    this.persist();
  }

  public keepAlive() {
    this.updateLastUsed();
  }

  public deriveNextKey(): [PublicKey, number] {
    if (!this.isUnlocked()) {
      throw new Error("keyring not unlocked");
    }
    const [pubkey, accountIndex] = this.activeBlockchain().deriveNextKey();

    // Update last used timestamp.
    this.updateLastUsed();

    this.persist();
    return [pubkey, accountIndex];
  }

  // Returns the public key of the secret key imported.
  public importSecretKey(secretKey: string): PublicKey {
    if (!this.isUnlocked()) {
      throw new Error("keyring store is not unlocked");
    }
    const pubkey = this.activeBlockchain().importSecretKey(secretKey);
    return pubkey;
  }

  public async passwordUpdate(currentPassword: string, newPassword: string) {
    if (!this.isUnlocked()) {
      throw new Error("keyring store is not unlocked");
    }
    if (currentPassword !== this.password) {
      throw new Error("incorrect password");
    }
    this.password = newPassword;
    this.persist();
  }

  public exportSecretKey(password: string, pubkey: string): string {
    if (!this.isUnlocked()) {
      throw new Error("keyring store is not unlocked");
    }
    if (password !== this.password) {
      throw new Error("incorrect password");
    }
    return this.activeBlockchain().exportSecretKey(pubkey);
  }

  public exportMnemonic(password: string): string {
    if (!this.isUnlocked()) {
      throw new Error("keyring store is not unlocked");
    }
    if (password !== this.password) {
      throw new Error("incorrect password");
    }
    return this.activeBlockchain().mnemonic();
  }

  public resetMnemonic(password: string) {
    if (!this.isUnlocked()) {
      throw new Error("keyring store is not unlocked");
    }
    if (password !== this.password) {
      throw new Error("incorrect password");
    }
    // TODO.
  }

  public async autoLockUpdate(autoLockSecs: number) {
    if (!this.isUnlocked()) {
      throw new Error("keyring store is not unlocked");
    }
    const data = await getWalletData();
    await setWalletData({
      ...data,
      autoLockSecs,
    });

    clearInterval(this.autoLockInterval!);
    this.autoLockStart();
  }

  public async activeWallet(): Promise<string> {
    const w = await this.activeBlockchain().getActiveWallet();
    return w!;
  }

  public async activeWalletUpdate(newWallet: string) {
    await this.activeBlockchain().activeWalletUpdate(newWallet);
    await this.persist();
  }

  public async keyDelete(pubkey: PublicKey) {
    await this.activeBlockchain().keyDelete(pubkey);
    await this.persist();
  }

  public async connectionUrlRead(): Promise<string> {
    return await this.activeBlockchain().connectionUrlRead();
  }

  public async connectionUrlUpdate(url: string): Promise<boolean> {
    return await this.activeBlockchain().connectionUrlUpdate(url);
  }

  private activeBlockchain(): BlockchainKeyring {
    return this.blockchains.get(this.activeBlockchainLabel)!;
  }

  private updateLastUsed() {
    this.lastUsedTs = Date.now() / 1000;
  }

  private toJson(): any {
    const json: any = {
      lastUsedTs: this.lastUsedTs,
      activeBlockchainLabel: this.activeBlockchainLabel,
    };
    this.blockchains.forEach((bc, bcLabel) => {
      json[bcLabel] = bc.toJson();
    });
    return json;
  }

  private isUnlocked(): boolean {
    return this.activeBlockchain().isUnlocked() && this.lastUsedTs !== 0;
  }

  private async isLocked(): Promise<boolean> {
    if (this.isUnlocked()) {
      return false;
    }
    const ciphertext = await LocalStorageDb.get(KEY_KEYRING_STORE);
    return ciphertext !== undefined && ciphertext !== null;
  }

  private async persist() {
    if (!this.isUnlocked()) {
      throw new Error("invariant violation");
    }
    const plaintext = JSON.stringify(this.toJson());
    const ciphertext = await crypto.encrypt(plaintext, this.password!);
    await LocalStorageDb.set(KEY_KEYRING_STORE, ciphertext);
  }

  private autoLockStart() {
    // Check the last time the keystore was used at a regular interval.
    // If it hasn't been used recently, lock the keystore.
    getWalletData().then(({ autoLockSecs }) => {
      this.autoLockInterval = setInterval(() => {
        const currentTs = Date.now() / 1000;
        if (currentTs - this.lastUsedTs >= LOCK_INTERVAL_SECS) {
          this.lock();
          this.notifications.pushNotification({
            name: NOTIFICATION_KEYRING_STORE_LOCKED,
          });
          clearInterval(this.autoLockInterval!);
        }
      }, autoLockSecs ?? LOCK_INTERVAL_SECS);
    });
  }
}

export class KeynameStore {
  public static async setName(pubkey: PublicKey, name: string) {
    let keynames = await LocalStorageDb.get(KEY_KEYNAME_STORE);
    if (!keynames) {
      keynames = {};
    }
    keynames[pubkey.toString()] = name;
    await LocalStorageDb.set(KEY_KEYNAME_STORE, keynames);
  }

  public static async getName(pubkey: PublicKey): Promise<string> {
    const names = await LocalStorageDb.get(KEY_KEYNAME_STORE);
    const name = names[pubkey.toString()];
    if (!name) {
      throw new Error(`unable to find name for key: ${pubkey.toString()}`);
    }
    return name;
  }
}

// Keys used by the local storage db.
const KEY_KEYRING_STORE = "keyring-store";
const KEY_KEYNAME_STORE = "keyname-store";
const KEY_CONNECTION_URL = "connection-url";
const KEY_WALLET_DATA = "wallet-data";

class LocalStorageDb {
  static async get(key: string): Promise<any> {
    return await BrowserRuntime.getLocalStorage(key);
  }

  static async set(key: string, value: any): Promise<void> {
    await BrowserRuntime.setLocalStorage(key, value);
  }
}

export const KeyringStoreStateEnum: { [key: string]: KeyringStoreState } = {
  Locked: "locked",
  Unlocked: "unlocked",
  NeedsOnboarding: "needs-onboarding",
};
export type KeyringStoreState = "locked" | "unlocked" | "needs-onboarding";

class BlockchainKeyring {
  private hdKeyring?: HdKeyring;
  private importedKeyring?: Keyring;
  private activeWallet?: string;
  private deletedWallets?: Array<string>;

  public publicKeys(): {
    hdPublicKeys: Array<PublicKey>;
    importedPublicKeys: Array<PublicKey>;
  } {
    const hdPublicKeys = this.hdKeyring!.publicKeys();
    const importedPublicKeys = this.importedKeyring!.publicKeys();
    return {
      hdPublicKeys,
      importedPublicKeys,
    };
  }

  public lock() {
    this.hdKeyring = undefined;
    this.importedKeyring = undefined;
  }

  public async init(mnemonic: string, derivationPath: DerivationPath) {
    // Initialize keyrings.
    this.hdKeyring = HdKeyring.fromMnemonic(mnemonic, derivationPath);
    this.importedKeyring = Keyring.fromSecretKeys([]);
    this.activeWallet = this.hdKeyring.getPublicKey(0).toString();
    this.deletedWallets = [];

    // Persist a given name for this wallet.
    await KeynameStore.setName(this.hdKeyring.getPublicKey(0), "Wallet 1");
  }

  public exportSecretKey(pubkey: string): string {
    const pk = new PublicKey(pubkey);
    let sk = this.hdKeyring!.exportSecretKey(pk);
    if (sk) {
      return sk;
    }
    sk = this.importedKeyring!.exportSecretKey(pk);
    if (sk) {
      return sk;
    }
    throw new Error(`unable to find keypair for ${pubkey}`);
  }

  public mnemonic(): string {
    return this.hdKeyring!.mnemonic;
  }

  public toJson(): any {
    if (!this.hdKeyring || !this.importedKeyring) {
      throw new Error("keyring store is locked");
    }
    return {
      hdKeyring: this.hdKeyring.toJson(),
      importedKeyring: this.importedKeyring.toJson(),
      activeWallet: this.activeWallet,
      deletedWallets: this.deletedWallets,
    };
  }

  public tryUnlock(solana: any) {
    const { hdKeyring, importedKeyring, activeWallet, deletedWallets } = solana;
    this.hdKeyring = HdKeyring.fromJson(hdKeyring);
    this.importedKeyring = Keyring.fromJson(importedKeyring);
    this.activeWallet = activeWallet;
    this.deletedWallets = deletedWallets;
  }

  public isUnlocked(): boolean {
    return this.hdKeyring !== undefined || this.importedKeyring !== undefined;
  }

  public deriveNextKey(): [PublicKey, number] {
    return this.hdKeyring!.deriveNext();
  }

  public importSecretKey(secretKey: string): PublicKey {
    return this.importedKeyring!.importSecretKey(secretKey);
  }

  async getActiveWallet(): Promise<string | undefined> {
    return this.activeWallet;
  }

  async activeWalletUpdate(newWallet: string) {
    this.activeWallet = newWallet;
  }

  async keyDelete(pubkey: PublicKey) {
    this.deletedWallets = this.deletedWallets!.concat([pubkey.toString()]);
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

// Persistent metadata for the UI shared across all networks.
export type WalletData = {
  autoLockSecs: number;
};

async function getWalletData(): Promise<WalletData> {
  const data = await LocalStorageDb.get(KEY_WALLET_DATA);
  return data;
}

async function setWalletData(data: WalletData) {
  await LocalStorageDb.set(KEY_WALLET_DATA, data);
}
