import * as bs58 from "bs58";
import type { DerivationPath } from "@coral-xyz/common";
import { getLogger } from "@coral-xyz/common";
import type {
  HdKeyringFactory,
  HdKeyring,
  KeyringFactory,
  Keyring,
} from "./types";
import type { SolanaLedgerKeyring } from "./solana";
import {
  SolanaKeyringFactory,
  SolanaHdKeyringFactory,
  SolanaLedgerKeyringFactory,
} from "./solana";
import { EthereumHdKeyringFactory, EthereumKeyringFactory } from "./ethereum";
import * as store from "../store";
import { DefaultKeyname } from "../store";

const logger = getLogger("background/backend/keyring");

// Represents key data for a single blockchain network, e.g., solana or ethereum.
export class BlockchainKeyring {
  private hdKeyringFactory: HdKeyringFactory;
  private keyringFactory: KeyringFactory;
  private ledgerKeyringFactory: SolanaLedgerKeyringFactory; // TODO: make interface
  private hdKeyring?: HdKeyring;
  private importedKeyring?: Keyring;
  public ledgerKeyring?: SolanaLedgerKeyring; // TODO: make interface
  private activeWallet?: string;
  private deletedWallets?: Array<string>;

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

  public async init(
    mnemonic: string,
    derivationPath: DerivationPath,
    accountIndices: Array<number>
  ): Promise<Array<[string, string]>> {
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
    const newAccounts: Array<[string, string]> = [];
    for (const index of accountIndices) {
      const name = DefaultKeyname.defaultDerived(index);
      const pubkey = this.hdKeyring.getPublicKey(index);
      await store.setKeyname(pubkey, name);
      newAccounts.push([pubkey, name]);
    }
    return newAccounts;
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

  public deriveNextKey(): [string, string, number] {
    const [pubkey, accountIndex] = this.hdKeyring!.deriveNext();

    // Save a default name.
    const name = DefaultKeyname.defaultDerived(accountIndex);
    store.setKeyname(pubkey, name);

    return [pubkey, name, accountIndex];
  }

  public async importSecretKey(
    secretKey: string,
    name: string
  ): Promise<[string, string]> {
    const pubkey = this.importedKeyring!.importSecretKey(secretKey).toString();
    if (!name || name.length === 0) {
      name = DefaultKeyname.defaultImported(
        this.importedKeyring!.publicKeys().length
      );
    }
    await store.setKeyname(pubkey, name);
    return [pubkey, name];
  }

  public getActiveWallet(): string | undefined {
    return this.activeWallet;
  }

  public async activeWalletUpdate(newWallet: string) {
    this.activeWallet = newWallet;
  }

  public async keyDelete(pubkey: string) {
    if (this.hdKeyring!.deleteKeyIfNeeded(pubkey) >= 0) {
      return;
    }
    if (this.importedKeyring!.deleteKeyIfNeeded(pubkey) >= 0) {
      return;
    }
    if (this.ledgerKeyring!.deleteKeyIfNeeded(pubkey) >= 0) {
      return;
    }
    logger.error(`unable to find key to delete in keyring store: ${pubkey}`);
    throw new Error("key not found");
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
    };
  }

  public fromJson(json): any {
    const {
      hdKeyring,
      importedKeyring,
      ledgerKeyring,
      activeWallet,
      deletedWallets,
    } = json;
    this.hdKeyring = this.hdKeyringFactory.fromJson(hdKeyring);
    this.importedKeyring = this.keyringFactory.fromJson(importedKeyring);
    this.ledgerKeyring = this.ledgerKeyringFactory.fromJson(ledgerKeyring);
    this.activeWallet = activeWallet;
    this.deletedWallets = deletedWallets;
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

  private getKeyring(pubkey: string): Keyring {
    let found = this.hdKeyring!.publicKeys().find((k) => k === pubkey);
    if (found) {
      return this.hdKeyring!;
    }
    found = this.importedKeyring!.publicKeys().find((k) => k === pubkey);
    if (found) {
      return this.importedKeyring!;
    }
    return this.ledgerKeyring!;
  }

  public hasPublicKey(pubkey: string): boolean {
    for (const keyring of [
      this.hdKeyring!,
      this.importedKeyring!,
      this.ledgerKeyring!,
    ]) {
      if (keyring.publicKeys().find((k) => k === pubkey)) {
        return true;
      }
    }
    return false;
  }
}
