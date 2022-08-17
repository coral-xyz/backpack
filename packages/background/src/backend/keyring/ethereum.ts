import { ethers } from "ethers";
import type { Wallet } from "ethers";
import { validateMnemonic, generateMnemonic, mnemonicToSeedSync } from "bip39";
import type {
  Keyring,
  KeyringFactory,
  KeyringJson,
  HdKeyring,
  HdKeyringFactory,
  HdKeyringJson,
} from "./types";
import { DerivationPath } from "@coral-xyz/common";

function deriveWallets(
  seed: Buffer,
  derivationPath: DerivationPath,
  accountIndices: Array<number>
): Array<Wallet> {
  const wallets: Array<Wallet> = [];
  for (const accountIndex of accountIndices) {
    wallets.push(deriveWallet(seed, accountIndex, derivationPath));
  }
  return wallets;
}

function deriveWallet(
  seed: Buffer,
  accountIndex: number,
  derivationPath: DerivationPath
): Wallet {
  const hdNode = ethers.utils.HDNode.fromSeed(seed);
  const path = derivePathStr(derivationPath, accountIndex);
  const child = hdNode.derivePath(path);
  return new ethers.Wallet(child.privateKey);
}

function derivePathStr(derivationPath: DerivationPath, accountIndex: number) {
  switch (derivationPath) {
    case DerivationPath.Bip44:
      return accountIndex === 0 ? `m/44'/60'` : `m/44'/60'/${accountIndex - 1}`;
    case DerivationPath.Bip44Change:
      return `m/44'/60'/${accountIndex}/0'`;
    default:
      throw new Error(`invalid derivation path: ${derivationPath}`);
  }
}

export class EthereumKeyringFactory implements KeyringFactory {
  fromJson(payload: KeyringJson): Keyring {
    const wallets = payload.secretKeys.map((secret) => {
      return new ethers.Wallet(Buffer.from(secret, "hex"));
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

  public deleteKeyIfNeeded(pubkey: string): number {
    const index = this.wallets.findIndex((w) => w.address === pubkey);
    this.wallets = this.wallets.filter((w) => w.address !== pubkey);
    return index;
  }

  // @ts-ignore
  public async signTransaction(tx: Buffer, address: string): Promise<string> {}

  // @ts-ignore
  public async signMessage(message: Buffer, address: string): Promise<string> {}

  public exportSecretKey(address: string): string | null {
    const wallet = this.wallets.find((w) => w.address === address);
    return wallet ? wallet.privateKey : null;
  }

  public importSecretKey(secretKey: string): string {
    const wallet = new ethers.Wallet(secretKey);
    this.wallets.push(wallet);
    return wallet.address;
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
      derivationPath = DerivationPath.Bip44Change;
    }
    if (!validateMnemonic(mnemonic)) {
      throw new Error("Invalid seed words");
    }
    const seed = mnemonicToSeedSync(mnemonic);
    const wallets = deriveWallets(seed, derivationPath, accountIndices);
    return new EthereumHdKeyring({
      mnemonic,
      seed,
      accountIndices,
      wallets,
      derivationPath,
    });
  }

  // @ts-ignore
  public generate(): HdKeyring {
    // todo
  }

  // @ts-ignore
  public fromJson(obj: HdKeyringJson): HdKeyring {
    const { mnemonic, seed: seedStr, accountIndices, derivationPath } = obj;
    const seed = Buffer.from(seedStr, "hex");
    const wallets = deriveWallets(seed, derivationPath, accountIndices);
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
  private seed: Buffer;
  private accountIndices: Array<number>;
  private derivationPath: DerivationPath;

  constructor({ mnemonic, seed, accountIndices, wallets, derivationPath }) {
    super(wallets);
    this.mnemonic = mnemonic;
    this.seed = seed;
    this.accountIndices = accountIndices;
    this.derivationPath = derivationPath;
  }

  public deriveNext(): [string, number] {
    const nextAccountIndex = Math.max(...this.accountIndices) + 1;
    const wallet = deriveWallet(
      this.seed,
      nextAccountIndex,
      this.derivationPath
    );
    this.wallets.push(wallet);
    this.accountIndices.push(nextAccountIndex);
    return [wallet.address, nextAccountIndex];
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
