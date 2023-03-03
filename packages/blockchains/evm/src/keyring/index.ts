import type {
  HdKeyring,
  HdKeyringFactory,
  HdKeyringJson,
  Keyring,
  KeyringFactory,
  KeyringJson,
  LedgerKeyring,
  LedgerKeyringJson,
} from "@coral-xyz/blockchain-keyring";
import { LedgerKeyringBase } from "@coral-xyz/blockchain-keyring";
import type { WalletDescriptor } from "@coral-xyz/common";
import {
  Blockchain,
  getIndexedPath,
  LEDGER_METHOD_ETHEREUM_SIGN_MESSAGE,
  LEDGER_METHOD_ETHEREUM_SIGN_TRANSACTION,
  nextIndicesFromPaths,
} from "@coral-xyz/common";
import { mnemonicToSeedSync, validateMnemonic } from "bip39";
import type { Wallet } from "ethers";
import { ethers } from "ethers";

import { deriveEthereumWallet } from "../util";

export class EthereumKeyringFactory implements KeyringFactory {
  init(secretKeys: Array<string>): Keyring {
    const wallets = secretKeys.map((secretKey) => {
      return new ethers.Wallet(secretKey);
    });
    return new EthereumKeyring(wallets);
  }

  fromJson(payload: KeyringJson): Keyring {
    const wallets = payload.secretKeys.map((secret: string) => {
      return new ethers.Wallet(Buffer.from(secret, "hex").toString());
    });
    return new EthereumKeyring(wallets);
  }
}

export class EthereumKeyring implements Keyring {
  constructor(public wallets: Array<Wallet>) {}

  public publicKeys(): Array<string> {
    return this.wallets.map((w) => w.address);
  }

  public deletePublicKey(publicKey: string) {
    this.wallets = this.wallets.filter((w) => w.address !== publicKey);
  }

  public importSecretKey(secretKey: string): string {
    const wallet = new ethers.Wallet(secretKey);
    this.wallets.push(wallet);
    return wallet.address;
  }

  public exportSecretKey(address: string): string | null {
    const wallet = this.wallets.find((w) => w.address === address);
    return wallet ? wallet.privateKey : null;
  }

  public async signTransaction(
    serializedTx: Buffer,
    signerAddress: string
  ): Promise<string> {
    const wallet = this.wallets.find((w) => w.address === signerAddress);
    if (!wallet) {
      throw new Error(`unable to find ${signerAddress.toString()}`);
    }
    const tx = ethers.utils.parseTransaction(
      ethers.utils.hexlify(serializedTx)
    );
    return await wallet.signTransaction(
      tx as ethers.providers.TransactionRequest
    );
  }

  public async signMessage(
    message: Buffer,
    signerAddress: string
  ): Promise<string> {
    const wallet = this.wallets.find((w) => w.address === signerAddress);
    if (!wallet) {
      throw new Error(`unable to find ${signerAddress.toString()}`);
    }
    return await wallet.signMessage(message.toString());
  }

  public toJson(): any {
    return {
      // Private keys, just using the Solana secret key nomenclature
      secretKeys: this.wallets.map((w) =>
        Buffer.from(w.privateKey).toString("hex")
      ),
    };
  }
}

export class EthereumHdKeyringFactory implements HdKeyringFactory {
  public init(mnemonic: string, derivationPaths: Array<string>): HdKeyring {
    if (!validateMnemonic(mnemonic)) {
      throw new Error("Invalid seed words");
    }
    const seed = mnemonicToSeedSync(mnemonic);
    return new EthereumHdKeyring({
      mnemonic,
      seed,
      derivationPaths,
    });
  }

  // @ts-ignore
  public fromJson({
    mnemonic,
    seed,
    derivationPaths,
    accountIndex,
    walletIndex,
  }: HdKeyringJson): HdKeyring {
    return new EthereumHdKeyring({
      mnemonic,
      seed: Buffer.from(seed, "hex"),
      derivationPaths,
      accountIndex,
      walletIndex,
    });
  }
}

export class EthereumHdKeyring extends EthereumKeyring implements HdKeyring {
  readonly mnemonic: string;
  private derivationPaths: Array<string>;
  private seed: Buffer;
  private accountIndex?: number;
  private walletIndex?: number;

  constructor({
    mnemonic,
    seed,
    derivationPaths,
    accountIndex,
    walletIndex,
  }: {
    mnemonic: string;
    seed: Buffer;
    derivationPaths: Array<string>;
    accountIndex?: number;
    walletIndex?: number;
  }) {
    const wallets = derivationPaths.map((d) => deriveEthereumWallet(seed, d));
    super(wallets);
    this.mnemonic = mnemonic;
    this.seed = seed;
    this.derivationPaths = derivationPaths;
    this.accountIndex = accountIndex;
    this.walletIndex = walletIndex;
  }

  public deletePublicKey(publicKey: string) {
    const index = this.wallets.findIndex((w) => w.address === publicKey);
    if (index < 0) {
      return;
    }
    this.derivationPaths = this.derivationPaths
      .slice(0, index)
      .concat(this.derivationPaths.slice(index + 1));
    super.deletePublicKey(publicKey);
  }

  public nextDerivationPath(offset = 1) {
    this.ensureIndices();
    const derivationPath = getIndexedPath(
      Blockchain.ETHEREUM,
      this.accountIndex,
      this.walletIndex! + offset
    );
    if (this.derivationPaths.includes(derivationPath)) {
      // This key is already included for some reason, try again with
      // incremented walletIndex
      return this.nextDerivationPath(offset + 1);
    }
    return { derivationPath, offset };
  }

  deriveNextKey(): {
    publicKey: string;
    derivationPath: string;
  } {
    const { derivationPath, offset } = this.nextDerivationPath();
    // Save the offset to the wallet index
    this.walletIndex! += offset;
    const publicKey = this.addDerivationPath(derivationPath);
    return {
      publicKey,
      derivationPath,
    };
  }

  addDerivationPath(derivationPath: string): string {
    const wallet = ethers.Wallet.fromMnemonic(this.mnemonic, derivationPath);
    if (!this.derivationPaths.includes(derivationPath)) {
      // Don't persist duplicate public keys
      this.derivationPaths.push(derivationPath);
      this.wallets.push(wallet);
    }
    return wallet.address;
  }

  ensureIndices() {
    // If account index and wallet index don't exist, make a best guess based
    // on the existing derivation paths for the keyring
    if (this.accountIndex === undefined || this.walletIndex === undefined) {
      const { accountIndex, walletIndex } = nextIndicesFromPaths(
        this.derivationPaths
      );
      if (!this.accountIndex) this.accountIndex = accountIndex;
      if (!this.walletIndex) this.walletIndex = walletIndex;
    }
  }

  // @ts-ignore
  public toJson(): HdKeyringJson {
    return {
      mnemonic: this.mnemonic,
      seed: this.seed.toString("hex"),
      derivationPaths: this.derivationPaths,
      accountIndex: this.accountIndex,
      walletIndex: this.walletIndex,
    };
  }
}

export class EthereumLedgerKeyringFactory {
  public init(walletDescriptors: Array<WalletDescriptor>): LedgerKeyring {
    return new EthereumLedgerKeyring(walletDescriptors, Blockchain.ETHEREUM);
  }

  public fromJson(obj: LedgerKeyringJson): LedgerKeyring {
    return new EthereumLedgerKeyring(
      obj.walletDescriptors,
      Blockchain.ETHEREUM
    );
  }
}

export class EthereumLedgerKeyring
  extends LedgerKeyringBase
  implements LedgerKeyring
{
  public async signTransaction(
    serializedTx: Buffer,
    publicKey: string
  ): Promise<string> {
    const walletDescriptor = this.walletDescriptors.find(
      (p) => p.publicKey === publicKey
    );
    if (!walletDescriptor) {
      throw new Error("ledger public key not found");
    }
    const tx = ethers.utils.parseTransaction(
      ethers.utils.hexlify(serializedTx)
    );
    return await this.request({
      method: LEDGER_METHOD_ETHEREUM_SIGN_TRANSACTION,
      params: [tx, walletDescriptor.derivationPath],
    });
  }

  public async signMessage(msg: Buffer, publicKey: string): Promise<string> {
    const walletDescriptor = this.walletDescriptors.find(
      (p) => p.publicKey === publicKey
    );
    if (!walletDescriptor) {
      throw new Error("ledger public key not found");
    }
    return await this.request({
      method: LEDGER_METHOD_ETHEREUM_SIGN_MESSAGE,
      params: [msg, walletDescriptor.derivationPath],
    });
  }
}
