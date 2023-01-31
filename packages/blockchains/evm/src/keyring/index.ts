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
import type { PathType, PublicKeyPath } from "@coral-xyz/common";
import {
  Blockchain,
  getIndexedPath,
  LEDGER_METHOD_ETHEREUM_SIGN_MESSAGE,
  LEDGER_METHOD_ETHEREUM_SIGN_TRANSACTION,
  legacyBip44ChangeIndexed,
  legacyBip44Indexed,
} from "@coral-xyz/common";
import { HDNode } from "@ethersproject/hdnode";
import { mnemonicToSeedSync, validateMnemonic } from "bip39";
import type { Wallet } from "ethers";
import { ethers } from "ethers";

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
  public init(
    mnemonic: string,
    derivationPaths: Array<string>,
    accountIndex: number
  ): HdKeyring {
    if (!validateMnemonic(mnemonic)) {
      throw new Error("Invalid seed words");
    }
    const seed = mnemonicToSeedSync(mnemonic);
    return new EthereumHdKeyring({
      mnemonic,
      seed,
      derivationPaths,
      accountIndex,
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
  private seed: Buffer;
  private accountIndex: number;
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
    accountIndex: number;
    walletIndex?: number;
  }) {
    const node = HDNode.fromMnemonic(mnemonic);
    const wallets = derivationPaths.map(
      (path) => new ethers.Wallet(node.derivePath(path))
    );
    super(wallets);
    this.mnemonic = mnemonic;
    this.seed = seed;
    this.accountIndex = accountIndex;
    this.walletIndex = walletIndex;
  }

  deriveNextKey(): { publicKey: string; derivationPath: string } {
    if (this.accountIndex) throw new Error("invalid account index");

    this.walletIndex =
      this.walletIndex === undefined ? 0 : this.walletIndex + 1;

    const derivationPath = getIndexedPath(
      Blockchain.ETHEREUM,
      this.accountIndex,
      this.walletIndex
    );
    const wallet = ethers.Wallet.fromMnemonic(this.mnemonic, derivationPath);
    this.wallets.push(wallet);

    return {
      publicKey: wallet.address,
      derivationPath,
    };
  }

  addDerivationPath(derivationPath: string): string {
    const wallet = ethers.Wallet.fromMnemonic(this.mnemonic, derivationPath);
    this.wallets.push(wallet);
    return wallet.address;
  }

  // @ts-ignore
  public toJson(): HdKeyringJson {
    return {
      mnemonic: this.mnemonic,
      seed: this.seed.toString("hex"),
      // Serialize wallets as derivation paths
      derivationPaths: this.wallets.map((w) => w.mnemonic.path),
      accountIndex: this.accountIndex,
      walletIndex: this.walletIndex,
    };
  }
}

export class EthereumLedgerKeyringFactory {
  public init(publicKeyPaths: Array<PublicKeyPath>): LedgerKeyring {
    return new EthereumLedgerKeyring(publicKeyPaths);
  }

  public fromJson(obj: LedgerKeyringJson): LedgerKeyring {
    return new EthereumLedgerKeyring(obj.publicKeyPaths);
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
    const publicKeyPath = this.publicKeyPaths.find(
      (p) => p.publicKey === publicKey
    );
    if (!publicKeyPath) {
      throw new Error("ledger public key not found");
    }
    const tx = ethers.utils.parseTransaction(
      ethers.utils.hexlify(serializedTx)
    );
    return await this.request({
      method: LEDGER_METHOD_ETHEREUM_SIGN_TRANSACTION,
      params: [tx, publicKeyPath.derivationPath],
    });
  }

  public async signMessage(msg: Buffer, publicKey: string): Promise<string> {
    const publicKeyPath = this.publicKeyPaths.find(
      (p) => p.publicKey === publicKey
    );
    if (!publicKeyPath) {
      throw new Error("ledger public key not found");
    }
    return await this.request({
      method: LEDGER_METHOD_ETHEREUM_SIGN_MESSAGE,
      params: [msg, publicKeyPath.derivationPath],
    });
  }
}
