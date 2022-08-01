import * as bs58 from "bs58";
import type { KeyringStoreState } from "@coral-xyz/recoil";
import { KeyringStoreStateEnum } from "@coral-xyz/recoil";
import type { EventEmitter, DerivationPath } from "@coral-xyz/common";
import {
  Blockchain,
  SolanaExplorer,
  NOTIFICATION_KEYRING_STORE_LOCKED,
  BACKEND_EVENT,
} from "@coral-xyz/common";
import * as crypto from "./crypto";
import type { SolanaLedgerKeyring } from "./solana";
import type { HdKeyringFactory, HdKeyring, KeyringFactory, Keyring } from ".";
import {
  SolanaHdKeyringFactory,
  SolanaKeyringFactory,
  SolanaLedgerKeyringFactory,
  EthereumHdKeyringFactory,
  EthereumKeyringFactory,
} from ".";
import { getWalletData, setWalletData, LocalStorageDb } from "../store";

const LOCK_INTERVAL_SECS = 15 * 60;

// const BLOCKCHAIN_ETHEREUM = "ethereum";
const BLOCKCHAIN_DEFAULT = Blockchain.SOLANA;

const DEFAULT_SOLANA_CONNECTION_URL =
  process.env.DEFAULT_SOLANA_CONNECTION_URL ||
  "https://solana-api.projectserum.com";

// Manages all key data for all blockchains.
export class KeyringStore {
  readonly blockchains: Map<string, BlockchainKeyring>;
  private lastUsedTs: number;
  private password?: string;
  private autoLockInterval?: ReturnType<typeof setInterval>;
  private activeBlockchainLabel?: string;
  private events: EventEmitter;

  constructor(events: EventEmitter) {
    this.blockchains = new Map([
      [Blockchain.SOLANA, BlockchainKeyring.solana()],
      //      [BLOCKCHAIN_ETHEREUM, BlockchainKeyring.ethereum()],
    ]);
    this.lastUsedTs = 0;
    this.events = events;
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
    ledgerPublicKeys: Array<string>;
  } {
    return this.withUnlock(() => {
      return this.activeBlockchain().publicKeys();
    });
  }

  // Initializes the keystore for the first time.
  public async init(
    mnemonic: string,
    derivationPath: DerivationPath,
    password: string,
    accountIndices: Array<number>
  ) {
    // Initialize keyrings.
    this.password = password;
    this.activeBlockchainLabel = BLOCKCHAIN_DEFAULT;
    this.activeBlockchainUnchecked().init(
      mnemonic,
      derivationPath,
      accountIndices
    );

    // Persist the initial wallet ui metadata.
    await setWalletData({
      autoLockSecs: LOCK_INTERVAL_SECS,
      approvedOrigins: [],
      darkMode: true,
      solana: {
        explorer: SolanaExplorer.DEFAULT,
        commitment: "confirmed",
      },
    });

    // Persist the encrypted data to then store.
    this.persist(true);

    // Automatically lock the store when idle.
    this.autoLockStart();
  }

  public async checkPassword(password: string) {
    try {
      await this.decryptKeyringFromStorage(password);
      return true;
    } catch (err) {
      return false;
    }
  }

  public async tryUnlock(password: string) {
    return this.withLock(async () => {
      const plaintext = await this.decryptKeyringFromStorage(password);

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

      // Automatically lock the store when idle.
      this.autoLockStart();
    });
  }

  private async decryptKeyringFromStorage(password: string) {
    const ciphertextPayload = await LocalStorageDb.get(KEY_KEYRING_STORE);
    if (ciphertextPayload === undefined || ciphertextPayload === null) {
      throw new Error("keyring store not found on disk");
    }
    const plaintext = await crypto.decrypt(ciphertextPayload, password);
    return plaintext;
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

  public reset() {
    return LocalStorageDb.reset();
  }

  public async autoLockUpdate(autoLockSecs: number) {
    return await this.withUnlock(async () => {
      const data = await getWalletData();
      await setWalletData({
        ...data,
        autoLockSecs,
      });

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
      const result = await this.activeBlockchain().connectionUrlUpdate(url);
      await this.persist();
      return result;
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

  public async ledgerImport(dPath: string, account: number, pubkey: string) {
    return this.withUnlock(async () => {
      const ledgerKeyring = this.activeBlockchain().ledgerKeyring!;
      const name = KeynameStore.defaultNameLedger(ledgerKeyring.keyCount());
      await ledgerKeyring.ledgerImport(dPath, account, pubkey);
      await this.setKeyname(pubkey, name);

      await this.persist();
    });
  }

  public createMnemonic(strength: number): string {
    const factory = new SolanaHdKeyringFactory();
    const kr = factory.generate(strength);
    return kr.mnemonic;
  }

  public previewPubkeys(
    mnemonic: string,
    derivationPath: DerivationPath,
    numberOfAccounts: number
  ): string[] {
    const factory = new SolanaHdKeyringFactory();
    const hdKeyring = factory.fromMnemonic(mnemonic, derivationPath, [
      ...Array(numberOfAccounts).keys(),
    ]);
    return [...Array(numberOfAccounts).keys()].map((i) =>
      hdKeyring.getPublicKey(i)
    );
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

  private async persist(forceBecauseCalledFromInit = false) {
    if (!forceBecauseCalledFromInit && !this.isUnlocked()) {
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
          this.events.emit(BACKEND_EVENT, {
            name: NOTIFICATION_KEYRING_STORE_LOCKED,
          });
          clearInterval(this.autoLockInterval!);
        }
      }, (autoLockSecs ?? LOCK_INTERVAL_SECS) * 1000);
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
    ledgerPublicKeys: Array<string>;
  } {
    const hdPublicKeys = this.hdKeyring!.publicKeys();
    const importedPublicKeys = this.importedKeyring!.publicKeys();
    const ledgerPublicKeys = this.ledgerKeyring!.publicKeys();
    return {
      hdPublicKeys,
      importedPublicKeys,
      ledgerPublicKeys,
    };
  }

  public lock() {
    this.hdKeyring = undefined;
    this.importedKeyring = undefined;
    this.ledgerKeyring = undefined;
    this.activeWallet = undefined;
  }

  public async init(
    mnemonic: string,
    derivationPath: DerivationPath,
    accountIndices: Array<number>
  ) {
    // Initialize keyrings.
    this.hdKeyring = this.hdKeyringFactory.fromMnemonic(
      mnemonic,
      derivationPath,
      accountIndices
    );
    this.importedKeyring = this.keyringFactory.fromSecretKeys([]);
    this.ledgerKeyring = this.ledgerKeyringFactory.init();
    this.activeWallet = this.hdKeyring.getPublicKey(accountIndices[0]);
    this.deletedWallets = [];

    // Persist a given name for this wallet.
    for (const index of accountIndices) {
      const name = KeynameStore.defaultName(index);
      const pubkey = this.hdKeyring.getPublicKey(index);
      await KeynameStore.setName(pubkey, name);
    }
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
  public async signTransaction(
    txMsg: string,
    walletAddress: string
  ): Promise<string> {
    const keyring = this.getKeyring(walletAddress);
    const msg = Buffer.from(bs58.decode(txMsg));
    return keyring.signTransaction(msg, walletAddress);
  }

  public async signMessage(
    msg: string,
    walletAddress: string
  ): Promise<string> {
    const keyring = this.getKeyring(walletAddress);
    const msgBuffer = Buffer.from(bs58.decode(msg));
    return keyring.signMessage(msgBuffer, walletAddress);
  }

  private getKeyring(walletAddress: string): Keyring {
    let found = this.hdKeyring!.publicKeys().find((k) => k === walletAddress);
    if (found) {
      return this.hdKeyring!;
    }
    found = this.importedKeyring!.publicKeys().find((k) => k === walletAddress);
    if (found) {
      return this.importedKeyring!;
    }
    return this.ledgerKeyring!;
  }
}

// Keys used by the local storage db.
const KEY_KEYRING_STORE = "keyring-store";
const KEY_KEYNAME_STORE = "keyname-store";

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

  public static defaultNameLedger(accountIndex: number): string {
    return `Ledger ${accountIndex + 1}`;
  }
}
