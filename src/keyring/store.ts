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

const BLOCKCHAIN_SOLANA = "solana";
const BLOCKCHAIN_ETHEREUM = "ethereum";

export class KeyringStore {
  private blockchains: Map<string, BlockchainKeyring>;
  private notifications: NotificationsClient;
  private lastUsedTs: number;
  private password?: string;
  private autoLockInterval?: ReturnType<typeof setInterval>;
  private activeBlockchainLabel?: string;

  constructor(notifications: NotificationsClient) {
    this.blockchains = new Map([
      [BLOCKCHAIN_SOLANA, new BlockchainKeyring()],
    ]);
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
    return this.withUnlock(() => {
      return this.activeBlockchain().publicKeys();
    });
  }

  public lock() {
    return this.withUnlock(() => {
      this.activeBlockchain().lock();
      this.lastUsedTs = 0;
      this.activeBlockchainLabel = undefined;
    });
  }

  public async tryUnlock(password: string) {
    return this.withLock(async () => {
      // Decrypt the keyring from storage.
      const ciphertextPayload = await LocalStorageDb.get(KEY_KEYRING_STORE);
      if (ciphertextPayload === undefined || ciphertextPayload === null) {
        throw new Error("keyring store not found on disk");
      }
      const plaintext = await crypto.decrypt(ciphertextPayload, password);
      const {
        solana,
        activeBlockchainLabel,
        lastUsedTs: _,
      } = JSON.parse(plaintext);

      // Unlock the keyring stores.
      this.activeBlockchainLabel = activeBlockchainLabel;
      this.activeBlockchainUnchecked().tryUnlock(solana);
      this.password = password;
    });
  }

  // Initializes the keystore for the first time.
  public async init(
    mnemonic: string,
    derivationPath: DerivationPath,
    password: string
  ) {
    return this.withLock(async () => {
      // Initialize keyrings.
      this.password = password;
      this.activeBlockchain().init(mnemonic, derivationPath);

      // Persist the initial wallet ui metadata.
			await initWalletData();

      // Persist the encrypted data to then store.
      this.persist();
    });
  }

  public async deriveNextKey(): Promise<[PublicKey, string]> {
    return this.withUnlock(async () => {
      // Derive the next key.
      const [pubkey, accountIndex] = this.activeBlockchain().deriveNextKey();

      // Save a default name.
      const name = `Wallet ${accountIndex + 1}`;
      await KeynameStore.setName(pubkey, name);

      // Persist.
      this.persist();
      return [pubkey, name];
    });
  }

  // Returns the public key of the secret key imported.
  public importSecretKey(secretKey: string): PublicKey {
    return this.withUnlock(() => {
      const pubkey = this.activeBlockchain().importSecretKey(secretKey);
      return pubkey;
    });
  }

  public async passwordUpdate(currentPassword: string, newPassword: string) {
    return this.withPassword(currentPassword, () => {
      this.password = newPassword;
      this.persist();
    });
  }

  public exportSecretKey(password: string, pubkey: string): string {
    return this.withPassword(password, () => {
      return this.activeBlockchain().exportSecretKey(pubkey);
    });
  }

  public exportMnemonic(password: string): string {
    return this.withPassword(password, () => {
      return this.activeBlockchain().mnemonic();
    });
  }

  public resetMnemonic(password: string) {
    return this.withPassword(password, () => {
      // TODO.
    });
  }

  public async autoLockUpdate(autoLockSecs: number) {
		return this.withUnlock(async () => {
			await walletDataSetAutoLock(autoLockSecs);
			clearInterval(this.autoLockInterval!);
			this.autoLockStart();
		});
  }

  public async activeWallet(): Promise<string> {
    return this.withUnlock(async () => {
      const w = await this.activeBlockchain().getActiveWallet();
      return w!;
    });
  }

  public async activeWalletUpdate(newWallet: string) {
    return this.withUnlock(async () => {
      await this.activeBlockchain().activeWalletUpdate(newWallet);
      await this.persist();
    });
  }

  public async keyDelete(pubkey: PublicKey) {
    return this.withUnlock(async () => {
      await this.activeBlockchain().keyDelete(pubkey);
      await this.persist();
    });
  }

  public async connectionUrlRead(): Promise<string> {
    return this.withUnlock(async () => {
      return await this.activeBlockchain().connectionUrlRead();
    });
  }

  public async connectionUrlUpdate(url: string): Promise<boolean> {
    return this.withUnlock(async () => {
      return await this.activeBlockchain().connectionUrlUpdate(url);
    });
  }

  public keepAlive() {
    return this.withUnlock(() => {});
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

  private async isLocked(): Promise<boolean> {
    if (this.isUnlocked()) {
      return false;
    }
    const ciphertext = await LocalStorageDb.get(KEY_KEYRING_STORE);
    return ciphertext !== undefined && ciphertext !== null;
  }

  private isUnlocked(): boolean {
    return (
      this.activeBlockchainLabel !== undefined &&
      this.activeBlockchainUnchecked().isUnlocked() &&
      this.lastUsedTs !== 0
    );
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
    walletDataGetAutoLockSecs().then(autoLockSecs => {
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

	// Utility for asserting the wallet is currently unloccked.
  private withUnlock<T>(fn: () => T) {
    if (!this.isUnlocked()) {
      throw new Error("keyring store is not unlocked");
    }
    this.updateLastUsed();
    return fn();
  }

	// Utility for asserting the wallet is currently locked.
  private withLock<T>(fn: () => T): T {
    if (this.isUnlocked()) {
      throw new Error("keyring store is not locked");
    }
    this.updateLastUsed();
    return fn();
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

  private updateLastUsed() {
    this.lastUsedTs = Date.now() / 1000;
  }

  private activeBlockchain(): BlockchainKeyring {
    return this.withUnlock(() => {
      return this.activeBlockchainUnchecked();
    });
  }

	// Never use this.
  private activeBlockchainUnchecked(): BlockchainKeyring {
		return this.blockchains.get(this.activeBlockchainLabel!)!;
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
    this.activeWallet = undefined;
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

  public tryUnlock(blockchain: any) {
    const { hdKeyring, importedKeyring, activeWallet, deletedWallets } =
      blockchain;
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

  public toJson(): any {
    if (!this.hdKeyring || !this.importedKeyring) {
      throw new Error("blockchain keyring is locked");
    }
    return {
      hdKeyring: this.hdKeyring.toJson(),
      importedKeyring: this.importedKeyring.toJson(),
      activeWallet: this.activeWallet,
      deletedWallets: this.deletedWallets,
    };
  }
}

// Persistent metadata for the UI shared across all networks.
export type WalletData = {
  autoLockSecs: number;
};

async function initWalletData() {
  await setWalletData({
    autoLockSecs: LOCK_INTERVAL_SECS,
  });
}

async function walletDataSetAutoLock(autoLockSecs: number) {
	const data = await getWalletData();
	await setWalletData({
		...data,
		autoLockSecs,
	});
}

async function walletDataGetAutoLockSecs(): Promise<number> {
	return getWalletData().then(({ autoLockSecs }) => autoLockSecs);
}

async function getWalletData(): Promise<WalletData> {
  const data = await LocalStorageDb.get(KEY_WALLET_DATA);
  return data;
}

async function setWalletData(data: WalletData) {
  await LocalStorageDb.set(KEY_WALLET_DATA, data);
}
