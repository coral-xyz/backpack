import * as bs58 from "bs58";
import { BrowserRuntime } from "../common/browser";
import * as crypto from "./crypto";
import { DerivationPath } from "./crypto";
import {
  SolanaHdKeyringFactory,
  SolanaKeyringFactory,
  SolanaLedgerKeyring,
  SolanaLedgerKeyringFactory,
  EthereumHdKeyringFactory,
  EthereumKeyringFactory,
  HdKeyringFactory,
  HdKeyring,
  KeyringFactory,
  Keyring,
} from ".";
import {
  NotificationsClient,
  NOTIFICATION_KEYRING_STORE_LOCKED,
} from "../common";

const LOCK_INTERVAL_SECS = 15 * 60 * 1000;

export const BLOCKCHAIN_SOLANA = "solana";
// const BLOCKCHAIN_ETHEREUM = "ethereum";
const BLOCKCHAIN_DEFAULT = BLOCKCHAIN_SOLANA;

const DEFAULT_SOLANA_CONNECTION_URL = "https://solana-api.projectserum.com";

export const KeyringStoreStateEnum: { [key: string]: KeyringStoreState } = {
  Locked: "locked",
  Unlocked: "unlocked",
  NeedsOnboarding: "needs-onboarding",
};
export type KeyringStoreState = "locked" | "unlocked" | "needs-onboarding";

// Manages all key data for all blockchains.
export class KeyringStore {
  readonly blockchains: Map<string, BlockchainKeyring>;
  private notifications: NotificationsClient;
  private lastUsedTs: number;
  private password?: string;
  private autoLockInterval?: ReturnType<typeof setInterval>;
  private activeBlockchainLabel?: string;

  constructor(notifications: NotificationsClient) {
    this.blockchains = new Map([
      [BLOCKCHAIN_SOLANA, BlockchainKeyring.solana()],
      //      [BLOCKCHAIN_ETHEREUM, BlockchainKeyring.ethereum()],
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
    hdPublicKeys: Array<string>;
    importedPublicKeys: Array<string>;
  } {
    return this.withUnlock(() => {
      return this.activeBlockchain().publicKeys();
    });
  }

  public lock() {
    return this.withUnlock(() => {
      this.blockchains.forEach((bc) => {
        bc.lock();
      });
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        lastUsedTs,
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
      this.activeBlockchainLabel = BLOCKCHAIN_DEFAULT;
      this.activeBlockchainUnchecked().init(mnemonic, derivationPath);

      // Persist the initial wallet ui metadata.
      await initWalletData();

      // Persist the encrypted data to then store.
      this.persist();
    });
  }

  public async deriveNextKey(): Promise<[string, string]> {
    return this.withUnlock(async () => {
      // Derive the next key.
      const [pubkey, name] = this.activeBlockchain().deriveNextKey();
      this.persist();
      return [pubkey, name];
    });
  }

  // Returns the public key of the secret key imported.
  public async importSecretKey(
    secretKey: string,
    name: string
  ): Promise<[string, string]> {
    return this.withUnlock(async () => {
      const [pubkey, _name] = await this.activeBlockchain().importSecretKey(
        secretKey,
        name
      );
      this.persist();
      return [pubkey, _name];
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
      const bc = this.activeBlockchain();
      const w = bc.getActiveWallet();
      return w!;
    });
  }

  public async activeWalletUpdate(newWallet: string) {
    return this.withUnlock(async () => {
      await this.activeBlockchain().activeWalletUpdate(newWallet);
      await this.persist();
    });
  }

  public async keyDelete(pubkey: string) {
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

  public async getKeyname(pk: string): Promise<string> {
    return await this.activeBlockchain().getKeyname(pk);
  }

  public async setKeyname(pk: string, newName: string) {
    await this.activeBlockchain().setKeyname(pk, newName);
  }

  public keepAlive() {
    return this.withUnlock(() => {});
  }

  public ledgerConnect() {
    return this.withUnlock(() => {
      return this.activeBlockchain().ledgerKeyring!.connect();
    });
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
    walletDataGetAutoLockSecs().then((autoLockSecs) => {
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

  public activeBlockchain(): BlockchainKeyring {
    return this.withUnlock(() => {
      return this.activeBlockchainUnchecked();
    });
  }

  // Never use this.
  private activeBlockchainUnchecked(): BlockchainKeyring {
    return this.blockchains.get(this.activeBlockchainLabel!)!;
  }

  public async isApprovedOrigin(origin: string): Promise<boolean> {
    const data = await getWalletData();
    if (!data.approvedOrigins) {
      return false;
    }
    const found = data.approvedOrigins.find((o) => o === origin);
    return found !== undefined;
  }

  public async approvedOrigins(): Promise<Array<string>> {
    const data = await getWalletData();
    return data.approvedOrigins;
  }

  public async approveOrigin(origin: string) {
    const data = await getWalletData();
    const found = data.approvedOrigins.find((o) => o === origin);
    if (found) {
      throw new Error(`origin already approved: ${origin}`);
    }
    await setWalletData({
      ...data,
      approvedOrigins: [...data.approvedOrigins, origin],
    });
  }

  public async approvedOriginsUpdate(approvedOrigins: Array<string>) {
    const data = await getWalletData();
    await setWalletData({
      ...data,
      approvedOrigins,
    });
  }
}

// Represents key data for a single blockchain network, e.g., solana or ethereum.
class BlockchainKeyring {
  private hdKeyringFactory: HdKeyringFactory;
  private keyringFactory: KeyringFactory;
  private ledgerKeyringFactory: SolanaLedgerKeyringFactory; // TODO: make interface
  private hdKeyring?: HdKeyring;
  private importedKeyring?: Keyring;
  public ledgerKeyring?: SolanaLedgerKeyring; // TODO: make interface
  private activeWallet?: string;
  private deletedWallets?: Array<string>;
  private connectionUrl?: string;

  constructor(
    hdKeyringFactory: HdKeyringFactory,
    keyringFactory: KeyringFactory,
    ledgerKeyringFactory: SolanaLedgerKeyringFactory
  ) {
    this.hdKeyringFactory = hdKeyringFactory;
    this.keyringFactory = keyringFactory;
    this.ledgerKeyringFactory = ledgerKeyringFactory;
  }

  public static solana(): BlockchainKeyring {
    return new BlockchainKeyring(
      new SolanaHdKeyringFactory(),
      new SolanaKeyringFactory(),
      new SolanaLedgerKeyringFactory()
    );
  }

  public static ethereum(): BlockchainKeyring {
    return new BlockchainKeyring(
      new EthereumHdKeyringFactory(),
      new EthereumKeyringFactory(),
      new SolanaLedgerKeyringFactory() // TODO make ethereum
    );
  }

  public publicKeys(): {
    hdPublicKeys: Array<string>;
    importedPublicKeys: Array<string>;
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
    this.ledgerKeyring = undefined;
    this.activeWallet = undefined;
  }

  public async init(mnemonic: string, derivationPath: DerivationPath) {
    // Initialize keyrings.
    this.hdKeyring = this.hdKeyringFactory.fromMnemonic(
      mnemonic,
      derivationPath
    );
    this.importedKeyring = this.keyringFactory.fromSecretKeys([]);
    this.ledgerKeyring = this.ledgerKeyringFactory.init();
    this.activeWallet = this.hdKeyring.getPublicKey(0);
    this.deletedWallets = [];

    // Persist a given name for this wallet.
    const name = KeynameStore.defaultName(0);
    const pubkey = this.hdKeyring.getPublicKey(0);
    await KeynameStore.setName(pubkey, name);
  }

  public exportSecretKey(pubkey: string): string {
    let sk = this.hdKeyring!.exportSecretKey(pubkey);
    if (sk) {
      return sk;
    }
    sk = this.importedKeyring!.exportSecretKey(pubkey);
    if (sk) {
      return sk;
    }
    throw new Error(`unable to find keypair for ${pubkey}`);
  }

  public mnemonic(): string {
    return this.hdKeyring!.mnemonic;
  }

  public tryUnlock(payload: any) {
    const {
      hdKeyring,
      importedKeyring,
      activeWallet,
      deletedWallets,
      connectionUrl,
      ledgerKeyring,
    } = payload;
    this.hdKeyring = this.hdKeyringFactory.fromJson(hdKeyring);
    this.importedKeyring = this.keyringFactory.fromJson(importedKeyring);
    this.ledgerKeyring = this.ledgerKeyringFactory.fromJson(ledgerKeyring);
    this.activeWallet = activeWallet;
    this.deletedWallets = deletedWallets;
    this.connectionUrl = connectionUrl;
  }

  public isUnlocked(): boolean {
    return this.hdKeyring !== undefined || this.importedKeyring !== undefined;
  }

  public deriveNextKey(): [string, string, number] {
    const [pubkey, accountIndex] = this.hdKeyring!.deriveNext();

    // Save a default name.
    const name = KeynameStore.defaultName(accountIndex);
    this.setKeyname(pubkey, name);

    return [pubkey, name, accountIndex];
  }

  public async importSecretKey(
    secretKey: string,
    name: string
  ): Promise<[string, string]> {
    const pubkey = this.importedKeyring!.importSecretKey(secretKey).toString();
    if (!name || name.length === 0) {
      name = KeynameStore.defaultNameImported(
        this.importedKeyring!.publicKeys().length
      );
    }
    await this.setKeyname(pubkey, name);
    return [pubkey, name];
  }

  public getActiveWallet(): string | undefined {
    return this.activeWallet;
  }

  public async activeWalletUpdate(newWallet: string) {
    this.activeWallet = newWallet;
  }

  public async keyDelete(pubkey: string) {
    this.deletedWallets = this.deletedWallets!.concat([pubkey]);
  }

  public async connectionUrlRead(): Promise<string> {
    return this.connectionUrl ?? DEFAULT_SOLANA_CONNECTION_URL;
  }

  public async connectionUrlUpdate(url: string): Promise<boolean> {
    if (this.connectionUrl === url) {
      return false;
    }
    this.connectionUrl = url;
    return true;
  }

  public async getKeyname(pubkey: string): Promise<string> {
    return await KeynameStore.getName(pubkey);
  }

  public async setKeyname(pubkey: string, newName: string) {
    await KeynameStore.setName(pubkey, newName);
  }

  public toJson(): any {
    if (!this.hdKeyring || !this.importedKeyring || !this.ledgerKeyring) {
      throw new Error("blockchain keyring is locked");
    }
    return {
      hdKeyring: this.hdKeyring.toJson(),
      importedKeyring: this.importedKeyring.toJson(),
      ledgerKeyring: this.ledgerKeyring.toJson(),
      activeWallet: this.activeWallet,
      deletedWallets: this.deletedWallets,
      connectionUrl: this.connectionUrl,
    };
  }

  // txMsg is base58 encoded for solana. Note that `txMsg` is the *Message*.
  // Distinctly different from the full transaction.
  public signTransaction(txMsg: string, walletAddress: string): string {
    const keyring = this.getKeyring(walletAddress);
    const msg = Buffer.from(bs58.decode(txMsg));
    return keyring.signTransaction(msg, walletAddress);
  }

  public signMessage(msg: string, walletAddress: string): string {
    const keyring = this.getKeyring(walletAddress);
    const msgBuffer = Buffer.from(bs58.decode(msg));
    return keyring.signMessage(msgBuffer, walletAddress);
  }

  private getKeyring(walletAddress: string): Keyring {
    const found = this.hdKeyring!.publicKeys().find((k) => k === walletAddress);
    if (found) {
      return this.hdKeyring!;
    } else {
      return this.importedKeyring!;
    }
  }
}

// Persistent metadata for the UI shared across all networks.
export type WalletData = {
  autoLockSecs: number;
  approvedOrigins: Array<string>;
};

async function initWalletData() {
  await setWalletData({
    autoLockSecs: LOCK_INTERVAL_SECS,
    approvedOrigins: [],
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

// Keys used by the local storage db.
const KEY_KEYRING_STORE = "keyring-store";
const KEY_KEYNAME_STORE = "keyname-store";
const KEY_WALLET_DATA = "wallet-data";
const KEY_NAV = "nav-store7";

class KeynameStore {
  public static async setName(pubkey: string, name: string) {
    let keynames = await LocalStorageDb.get(KEY_KEYNAME_STORE);
    if (!keynames) {
      keynames = {};
    }
    keynames[pubkey] = name;
    await LocalStorageDb.set(KEY_KEYNAME_STORE, keynames);
  }

  public static async getName(pubkey: string): Promise<string> {
    const names = await LocalStorageDb.get(KEY_KEYNAME_STORE);
    const name = names[pubkey];
    if (!name) {
      throw new Error(`unable to find name for key: ${pubkey.toString()}`);
    }
    return name;
  }

  public static defaultName(accountIndex: number): string {
    return `Wallet ${accountIndex + 1}`;
  }

  public static defaultNameImported(accountIndex: number): string {
    return `Imported Wallet ${accountIndex + 1}`;
  }
}

class LocalStorageDb {
  static async get(key: string): Promise<any> {
    return await BrowserRuntime.getLocalStorage(key);
  }

  static async set(key: string, value: any): Promise<void> {
    await BrowserRuntime.setLocalStorage(key, value);
  }
}

export async function getNavData(navKey: string): Promise<Nav | undefined> {
  const nav = await LocalStorageDb.get(KEY_NAV);
  return nav.data[navKey];
}

export async function setNavData(navKey: string, data: any) {
  const nav = await LocalStorageDb.get(KEY_NAV);
  nav.data[navKey] = data;
  await LocalStorageDb.set(KEY_NAV, nav);
}

export async function getNav(): Promise<Nav | undefined> {
  return await LocalStorageDb.get(KEY_NAV);
}

export async function setNav(nav: Nav) {
  await LocalStorageDb.set(KEY_NAV, nav);
}

export type Nav = { activeTab: string; data: { [navId: string]: NavData } };

export type NavData = {
  id: string;
  title: string;
  components: Array<string>;
  props: Array<any>;
  transition: string;
};
