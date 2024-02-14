import type { WalletDescriptor } from "@coral-xyz/common";
import { Blockchain } from "@coral-xyz/common";
import { mnemonicToSeedSync, validateMnemonic } from "bip39";
import type { BaseWallet, TransactionRequest } from "ethers6";
import { HDNodeWallet, hexlify, Mnemonic, Transaction, Wallet } from "ethers6";

import { LedgerKeyringBase } from "../../keyring/ledger";
import type {
  HdKeyring,
  HdKeyringFactory,
  HdKeyringJson,
  Keyring,
  KeyringBase,
  KeyringFactory,
  KeyringJson,
  LedgerKeyring,
  LedgerKeyringJson,
} from "../../keyring/types";

import {
  deriveEthereumPrivateKey,
  deriveEthereumWallet,
  getEthereumWallet,
} from "./util";

export class EthereumKeyringFactory implements KeyringFactory {
  init(secretKeys: Array<string>): Keyring {
    const wallets = secretKeys.map((secretKey) => {
      return new Wallet(secretKey);
    });
    return new EthereumKeyring(wallets);
  }

  fromJson(payload: KeyringJson): Keyring {
    const wallets = payload.secretKeys.map((secret: string) => {
      return new Wallet(Buffer.from(secret, "hex").toString());
    });
    return new EthereumKeyring(wallets);
  }
}

class EthereumKeyringBase implements KeyringBase {
  constructor(public wallets: Array<BaseWallet>) {}

  public publicKeys(): Array<string> {
    return this.wallets.map((w) => w.address);
  }

  public deletePublicKey(publicKey: string) {
    this.wallets = this.wallets.filter((w) => w.address !== publicKey);
  }

  public importSecretKey(secretKey: string, publicKey: string): string {
    const wallet = new Wallet(secretKey);
    if (wallet.address !== publicKey) {
      throw new Error("Invalid Keypair. Keys don't match");
    }
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
    const tx = Transaction.from(hexlify(serializedTx));
    return await wallet.signTransaction(tx as TransactionRequest);
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

  public seedToSecretKey(seed: Buffer, derivationPath: string): string {
    return deriveEthereumPrivateKey(seed, derivationPath);
  }

  public secretKeyToPublicKeys(
    secretKey: string
  ): { type: string; publicKey: string }[] {
    const validated = getEthereumWallet(secretKey);
    return [{ type: "EVM Standard Public Key", publicKey: validated.address }];
  }
}

class EthereumKeyring extends EthereumKeyringBase {
  public toJson(): KeyringJson {
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

class EthereumHdKeyring extends EthereumKeyringBase implements HdKeyring {
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

  addDerivationPath(derivationPath: string, publicKey: string): string {
    const wallet = HDNodeWallet.fromMnemonic(
      Mnemonic.fromPhrase(this.mnemonic),
      derivationPath
    );
    if (wallet.address !== publicKey) {
      throw new Error("Invalid Keypair. Keys don't match");
    }
    if (!this.derivationPaths.includes(derivationPath)) {
      // Don't persist duplicate public keys
      this.derivationPaths.push(derivationPath);
      this.wallets.push(wallet);
    }

    return wallet.address;
  }

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

class EthereumLedgerKeyring extends LedgerKeyringBase implements LedgerKeyring {
  public async prepareSignTransaction(request: {
    publicKey: string;
    tx: string;
  }): Promise<{
    signableTx: string;
    derivationPath: string;
  }> {
    const walletDescriptor = this.walletDescriptors.find(
      (p) => p.publicKey === request.publicKey
    );
    if (!walletDescriptor) {
      throw new Error("ledger public key not found");
    }
    return {
      signableTx: request.tx,
      derivationPath: walletDescriptor.derivationPath,
    };
  }

  public async prepareSignMessage(request: {
    publicKey: string;
    message: string;
  }): Promise<{
    signableMessage: string;
    derivationPath: string;
  }> {
    const walletDescriptor = this.walletDescriptors.find(
      (p) => p.publicKey === request.publicKey
    );
    if (!walletDescriptor) {
      throw new Error("ledger public key not found");
    }
    return {
      signableMessage: request.message,
      derivationPath: walletDescriptor.derivationPath,
    };
  }
}
