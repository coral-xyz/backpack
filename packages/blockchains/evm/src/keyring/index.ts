import type {
  HdKeyring,
  HdKeyringFactory,
  HdKeyringJson,
  ImportedDerivationPath,
  Keyring,
  KeyringFactory,
  KeyringJson,
  LedgerKeyring,
  LedgerKeyringJson,
} from "@coral-xyz/blockchain-keyring";
import { LedgerKeyringBase } from "@coral-xyz/blockchain-keyring";
import {
  DerivationPath,
  LEDGER_METHOD_ETHEREUM_SIGN_MESSAGE,
  LEDGER_METHOD_ETHEREUM_SIGN_TRANSACTION,
} from "@coral-xyz/common";
import { mnemonicToSeedSync, validateMnemonic } from "bip39";
import type { Wallet } from "ethers";
import { ethers } from "ethers";

import { deriveEthereumWallet, deriveEthereumWallets } from "../util";

export class EthereumKeyringFactory implements KeyringFactory {
  fromJson(payload: KeyringJson): Keyring {
    const wallets = payload.secretKeys.map((secret: string) => {
      return new ethers.Wallet(Buffer.from(secret, "hex").toString());
    });
    return new EthereumKeyring(wallets);
  }

  fromSecretKeys(secretKeys: Array<string>): Keyring {
    const wallets = secretKeys.map((secretKey) => {
      return new ethers.Wallet(secretKey);
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
  public fromMnemonic(
    mnemonic: string,
    derivationPath?: DerivationPath,
    accountIndices: Array<number> = [0]
  ): HdKeyring {
    if (!derivationPath) {
      derivationPath = DerivationPath.Default;
    }
    if (!validateMnemonic(mnemonic)) {
      throw new Error("Invalid seed words");
    }
    const seed = mnemonicToSeedSync(mnemonic);
    const wallets = deriveEthereumWallets(seed, derivationPath, accountIndices);
    return new EthereumHdKeyring({
      mnemonic,
      seed,
      accountIndices,
      wallets,
      derivationPath,
    });
  }

  // @ts-ignore
  public fromJson(obj: HdKeyringJson): HdKeyring {
    const { mnemonic, seed: seedStr, accountIndices, derivationPath } = obj;
    const seed = Buffer.from(seedStr, "hex");
    const wallets = deriveEthereumWallets(seed, derivationPath, accountIndices);
    return new EthereumHdKeyring({
      mnemonic,
      seed,
      accountIndices,
      wallets,
      derivationPath,
    });
  }
}

export class EthereumHdKeyring extends EthereumKeyring implements HdKeyring {
  readonly mnemonic: string;
  readonly derivationPath: DerivationPath;
  private seed: Buffer;
  private accountIndices: Array<number>;

  constructor({
    mnemonic,
    seed,
    accountIndices,
    wallets,
    derivationPath,
  }: {
    mnemonic: string;
    seed: Buffer;
    accountIndices: Array<number>;
    wallets: Array<Wallet>;
    derivationPath: DerivationPath;
  }) {
    super(wallets);
    this.mnemonic = mnemonic;
    this.seed = seed;
    this.accountIndices = accountIndices;
    this.derivationPath = derivationPath;
  }

  /**
   * Import a new wallet using an account index. if the account index is not
   * given the next available account index is used.
   */
  public importAccountIndex(accountIndex?: number): [string, number] {
    if (accountIndex === undefined) {
      accountIndex = Math.max(...this.accountIndices) + 1;
    }
    const wallet = deriveEthereumWallet(
      this.seed,
      accountIndex,
      this.derivationPath
    );
    this.wallets.push(wallet);
    this.accountIndices.push(accountIndex);
    return [wallet.address, accountIndex];
  }

  // @ts-ignore
  public getPublicKey(accountIndex: number): string {
    if (this.wallets.length !== this.accountIndices.length) {
      throw new Error("invariant violation");
    }
    const wallet = this.wallets[this.accountIndices.indexOf(accountIndex)];
    return wallet.address;
  }

  // @ts-ignore
  public toJson(): HdKeyringJson {
    return {
      mnemonic: this.mnemonic,
      seed: this.seed.toString("hex"),
      accountIndices: this.accountIndices,
      derivationPath: this.derivationPath,
    };
  }
}

export class EthereumLedgerKeyringFactory {
  public fromAccounts(accounts: Array<ImportedDerivationPath>): LedgerKeyring {
    return new EthereumLedgerKeyring(accounts);
  }

  public fromJson(obj: LedgerKeyringJson): LedgerKeyring {
    return new EthereumLedgerKeyring(obj.derivationPaths);
  }
}

export class EthereumLedgerKeyring
  extends LedgerKeyringBase
  implements LedgerKeyring
{
  public async signTransaction(
    serializedTx: Buffer,
    address: string
  ): Promise<string> {
    const path = this.derivationPaths.find((p) => p.publicKey === address);
    if (!path) {
      throw new Error("ledger address not found");
    }
    const tx = ethers.utils.parseTransaction(
      ethers.utils.hexlify(serializedTx)
    );
    const result = await this.request({
      method: LEDGER_METHOD_ETHEREUM_SIGN_TRANSACTION,
      params: [tx, path.path, path.account],
    });
    return result;
  }

  public async signMessage(msg: Buffer, address: string): Promise<string> {
    const path = this.derivationPaths.find((p) => p.publicKey === address);
    if (!path) {
      throw new Error("ledger address not found");
    }
    return await this.request({
      method: LEDGER_METHOD_ETHEREUM_SIGN_MESSAGE,
      params: [msg, path.path, path.account],
    });
  }

  public static fromString(str: string): EthereumLedgerKeyring {
    const { derivationPaths } = JSON.parse(str);
    return new EthereumLedgerKeyring(derivationPaths);
  }
}
