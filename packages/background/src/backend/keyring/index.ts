import type { KeyringStoreState } from "@coral-xyz/recoil";
import { KeyringStoreStateEnum } from "@coral-xyz/recoil";
import type { EventEmitter } from "@coral-xyz/common";
import {
  Blockchain,
  DerivationPath,
  SolanaExplorer,
  SolanaCluster,
  NOTIFICATION_KEYRING_STORE_LOCKED,
  BACKEND_EVENT,
} from "@coral-xyz/common";
import * as crypto from "./crypto";
import { SolanaHdKeyringFactory } from "./solana";
import * as store from "../store";
import { DefaultKeyname } from "../store";
import { BlockchainKeyring } from "./blockchain";

const BLOCKCHAIN_DEFAULT = Blockchain.SOLANA;

/**
 * Keyring API for managing all wallet keys.
 */
export class KeyringStore {
  private blockchains: Map<string, BlockchainKeyring>;
  private lastUsedTs: number;
  private password?: string;
  private autoLockInterval?: ReturnType<typeof setInterval>;
  private activeBlockchain_?: string;
  private events: EventEmitter;
  private mnemonic: string;

  constructor(events: EventEmitter) {
    this.blockchains = new Map();
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
    [key: string]: {
      hdPublicKeys: Array<string>;
      importedPublicKeys: Array<string>;
      ledgerPublicKeys: Array<string>;
    };
  } {
    return this.withUnlock(() => {
      const entries = Array.from(this.blockchains).map(
        ([blockchain, keyring]) => {
          return [blockchain, keyring.publicKeys()];
        }
      );
      return Object.fromEntries(entries);
    });
  }

  // Initializes the keystore for the first time.
  public async init(
    mnemonic: string,
    derivationPath: DerivationPath,
    password: string,
    accountIndices: Array<number>
  ) {
    this.password = password;
    this.mnemonic = mnemonic;

    // Init default blockchain keyring (Solana).
    this.activeBlockchain_ = BLOCKCHAIN_DEFAULT;
    this.initBlockchainKeyring(
      mnemonic,
      derivationPath,
      accountIndices,
      BLOCKCHAIN_DEFAULT
    );

    // Persist the initial wallet ui metadata.
    await store.setWalletData({
      autoLockSecs: store.DEFAULT_LOCK_INTERVAL_SECS,
      approvedOrigins: [],
      darkMode: true,
      solana: {
        explorer: SolanaExplorer.DEFAULT,
        cluster: SolanaCluster.DEFAULT,
        commitment: "confirmed",
      },
    });

    // Persist the encrypted data to then store.
    await this.persist(true);

    // Automatically lock the store when idle.
    await this.tryUnlock(password);
  }

  public initBlockchainKeyring(
    mnemonic: string,
    derivationPath: DerivationPath,
    accountIndices: Array<number>,
    blockchain: Blockchain
  ): BlockchainKeyring {
    const keyring = {
      [Blockchain.SOLANA]: BlockchainKeyring.solana,
      [Blockchain.ETHEREUM]: BlockchainKeyring.ethereum,
    }[blockchain]();
    keyring.init(mnemonic, derivationPath, accountIndices);
    this.blockchains.set(blockchain, keyring);
    return keyring;
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
      this.fromJson(JSON.parse(plaintext));
      this.password = password;
      // Automatically lock the store when idle.
      this.autoLockStart();
    });
  }

  private async decryptKeyringFromStorage(password: string) {
    const ciphertextPayload = await store.getEncryptedKeyring();
    if (ciphertextPayload === undefined || ciphertextPayload === null) {
      throw new Error("keyring store not found on disk");
    }
    const plaintext = await crypto.decrypt(ciphertextPayload, password);
    return plaintext;
  }

  public lock() {
    return this.withUnlock(() => {
      this.blockchains = new Map();
      this.lastUsedTs = 0;
      this.activeBlockchain_ = undefined;
    });
  }

  public async deriveNextKey(): Promise<[string, string]> {
    return this.withUnlock(async () => {
      // Derive the next key.
      const [pubkey, name] = this.activeBlockchainKeyring().deriveNextKey();
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
      const [pubkey, _name] =
        await this.activeBlockchainKeyring().importSecretKey(secretKey, name);
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
      return this.activeBlockchainKeyring().exportSecretKey(pubkey);
    });
  }

  public exportMnemonic(password: string): string {
    return this.withPassword(password, () => {
      return this.mnemonic;
    });
  }

  public reset() {
    return store.reset();
  }

  public async autoLockUpdate(autoLockSecs: number) {
    return await this.withUnlock(async () => {
      const data = await store.getWalletData();
      await store.setWalletData({
        ...data,
        autoLockSecs,
      });

      if (this.autoLockInterval) {
        clearInterval(this.autoLockInterval);
      }
      this.autoLockStart();
    });
  }

  public async activeWallet(): Promise<string> {
    return this.withUnlock(async () => {
      const bc = this.activeBlockchainKeyring();
      const w = bc.getActiveWallet();
      return w!;
    });
  }

  public async activeWalletUpdate(newWallet: string) {
    return this.withUnlock(async () => {
      await this.activeBlockchainKeyring().activeWalletUpdate(newWallet);
      await this.persist();
    });
  }

  public async keyDelete(pubkey: string) {
    return this.withUnlock(async () => {
      await this.activeBlockchainKeyring().keyDelete(pubkey);
      await this.persist();
    });
  }

  public keepAlive() {
    return this.withUnlock(() => {});
  }

  public ledgerConnect() {
    return this.withUnlock(() => {
      return this.activeBlockchainKeyring().ledgerKeyring!.connect();
    });
  }

  public async ledgerImport(dPath: string, account: number, pubkey: string) {
    return this.withUnlock(async () => {
      const ledgerKeyring = this.activeBlockchainKeyring().ledgerKeyring!;
      const name = DefaultKeyname.defaultLedger(ledgerKeyring.keyCount());
      await ledgerKeyring.ledgerImport(dPath, account, pubkey);
      await store.setKeyname(pubkey, name);

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
    // toJson on all the keyrings
    const blockchains = Object.fromEntries(
      [...this.blockchains].map(([k, v]) => [k, v.toJson()])
    );

    return {
      mnemonic: this.mnemonic,
      blockchains,
      lastUsedTs: this.lastUsedTs,
      activeBlockchain_: this.activeBlockchain_,
    };
  }

  private fromJson(json: any) {
    const { mnemonic, blockchains, activeBlockchainLabel, activeBlockchain_ } =
      json;

    if (activeBlockchainLabel) {
      // Migrate from previous store format
      // TODO can be removed after a while
      this.fromLegacyJson(json);
    } else {
      this.mnemonic = mnemonic;
      this.blockchains = new Map(
        Object.entries(blockchains).map(([blockchain, obj]) => {
          const blockchainKeyring = BlockchainKeyring[blockchain]();
          blockchainKeyring.fromJson(obj);
          return [blockchain, blockchainKeyring];
        })
      );
      this.activeBlockchain_ = activeBlockchain_;
    }
  }

  private fromLegacyJson(json: any) {
    const { activeBlockchainLabel, solana } = json;
    this.mnemonic = solana.hdKeyring.mnemonic;
    this.activeBlockchain_ = activeBlockchainLabel;
    this.blockchains = new Map();
    const blockchainKeyring = BlockchainKeyring[Blockchain.SOLANA]();
    blockchainKeyring.fromJson({
      ...solana,
      importedKeyring: {
        // Handle rename of this
        secretKeys: solana.importedKeyring.keypairs,
      },
    });
    this.blockchains.set(Blockchain.SOLANA, blockchainKeyring);
  }

  private async isLocked(): Promise<boolean> {
    if (this.isUnlocked()) {
      return false;
    }
    const ciphertext = await store.getEncryptedKeyring();
    return ciphertext !== undefined && ciphertext !== null;
  }

  private isUnlocked(): boolean {
    return this.activeBlockchain_ !== undefined && this.lastUsedTs !== 0;
  }

  private async persist(forceBecauseCalledFromInit = false) {
    if (!forceBecauseCalledFromInit && !this.isUnlocked()) {
      throw new Error("invariant violation");
    }
    const plaintext = JSON.stringify(this.toJson());
    const ciphertext = await crypto.encrypt(plaintext, this.password!);
    await store.setEncryptedKeyring(ciphertext);
  }

  private autoLockStart() {
    // Check the last time the keystore was used at a regular interval.
    // If it hasn't been used recently, lock the keystore.
    store.getWalletData().then(({ autoLockSecs }) => {
      const _autoLockSecs = autoLockSecs ?? store.DEFAULT_LOCK_INTERVAL_SECS;
      this.autoLockInterval = setInterval(() => {
        const currentTs = Date.now() / 1000;
        if (currentTs - this.lastUsedTs >= _autoLockSecs) {
          this.lock();
          this.events.emit(BACKEND_EVENT, {
            name: NOTIFICATION_KEYRING_STORE_LOCKED,
          });
          clearInterval(this.autoLockInterval!);
        }
      }, _autoLockSecs * 1000);
    });
  }

  // Utility for asserting the wallet is currently unlocked.
  private withUnlock<T>(fn: () => T) {
    if (!this.isUnlocked()) {
      throw new Error("keyring store is not unlocked");
    }
    const resp = fn();
    this.updateLastUsed();
    return resp;
  }

  // Utility for asserting the wallet is currently locked.
  private withLock<T>(fn: () => T): T {
    if (this.isUnlocked()) {
      throw new Error("keyring store is not locked");
    }
    const resp = fn();
    this.updateLastUsed();
    return resp;
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

  public activeBlockchainKeyring(): BlockchainKeyring {
    return this.withUnlock(() => {
      return this.activeBlockchainUnchecked();
    });
  }

  // Never use this.
  private activeBlockchainUnchecked(): BlockchainKeyring {
    return this.blockchains.get(this.activeBlockchain_!)!;
  }

  public activeBlockchain(): string {
    return this.activeBlockchain_!;
  }

  public activeBlockchainUpdate(activeBlockchain: string) {
    const activeBlockchainKeyring = this.blockchains.get(activeBlockchain);
    if (!activeBlockchainKeyring) {
      // Init blockchain keyring if required
      this.initBlockchainKeyring(
        this.mnemonic,
        DerivationPath.Bip44Change,
        [0],
        activeBlockchain as Blockchain
      );
    }
    this.activeBlockchain_ = activeBlockchain;
  }
}
