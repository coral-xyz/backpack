import { validateMnemonic, generateMnemonic, mnemonicToSeedSync } from "bip39";
import { Keypair, PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import * as bs58 from "bs58";
import { deriveKeypairs, deriveKeypair, DerivationPath } from "./crypto";

export class Keyring {
  constructor(readonly keypairs: Array<Keypair>) {}

  public publicKeys(): Array<PublicKey> {
    return this.keypairs.map((kp) => kp.publicKey);
  }

  // `address` is the key on the keyring to use for signing.
  public signTransaction(tx: Buffer, address: PublicKey): string {
    const kp = this.keypairs.find((kp) => kp.publicKey.equals(address));
    if (!kp) {
      throw new Error(`unable to find ${address.toString()}`);
    }
    return bs58.encode(nacl.sign.detached(tx, kp.secretKey));
  }

  public exportSecretKey(address: PublicKey): string | null {
    const kp = this.keypairs.find((kp) => kp.publicKey.equals(address));
    if (!kp) {
      return null;
    }
    return bs58.encode(kp.secretKey);
  }

  public static fromSecretKeys(secretKeys: Array<string>): Keyring {
    const keypairs = secretKeys.map((secret: string) =>
      Keypair.fromSecretKey(Buffer.from(secret, "hex"))
    );
    return new Keyring(keypairs);
  }

  public importSecretKey(secretKey: string): PublicKey {
    const kp = Keypair.fromSecretKey(Buffer.from(secretKey, "hex"));
    this.keypairs.push(kp);
    return kp.publicKey;
  }

  public toJson(): any {
    return {
      keypairs: this.keypairs.map((kp) =>
        Buffer.from(kp.secretKey).toString("hex")
      ),
    };
  }

  public static fromJson(payload: any): Keyring {
    const keypairs = payload.keypairs.map((secret: string) =>
      Keypair.fromSecretKey(Buffer.from(secret, "hex"))
    );
    return new Keyring(keypairs);
  }
}

export class HdKeyring extends Keyring {
  readonly mnemonic: string;
  private seed: Buffer;
  private numberOfAccounts: number;
  private derivationPath: DerivationPath;

  constructor({
    mnemonic,
    seed,
    numberOfAccounts,
    keypairs,
    derivationPath,
  }: {
    mnemonic: string;
    seed: Buffer;
    numberOfAccounts: number;
    keypairs: Array<Keypair>;
    derivationPath: DerivationPath;
  }) {
    super(keypairs);
    this.mnemonic = mnemonic;
    this.seed = seed;
    this.numberOfAccounts = numberOfAccounts;
    this.derivationPath = derivationPath;
  }

  public static fromMnemonic(
    mnemonic: string,
    derivationPath?: DerivationPath
  ): HdKeyring {
    if (!derivationPath) {
      derivationPath = DerivationPath.Bip44Change;
    }
    if (!validateMnemonic(mnemonic)) {
      throw new Error("Invalid seed words");
    }
    const seed = mnemonicToSeedSync(mnemonic);
    const numberOfAccounts = 1;
    const keypairs = deriveKeypairs(seed, derivationPath, numberOfAccounts);
    return new HdKeyring({
      mnemonic,
      seed,
      numberOfAccounts,
      keypairs,
      derivationPath,
    });
  }

  public static generate() {
    const mnemonic = generateMnemonic(256);
    const seed = mnemonicToSeedSync(mnemonic);
    const numberOfAccounts = 1;
    const derivationPath = DerivationPath.Bip44;
    const keypairs = deriveKeypairs(seed, derivationPath, numberOfAccounts);

    return new HdKeyring({
      mnemonic,
      seed,
      numberOfAccounts,
      derivationPath,
      keypairs,
    });
  }

  public deriveNext(): [PublicKey, number] {
    const kp = deriveKeypair(
      this.seed.toString("hex"),
      this.numberOfAccounts,
      this.derivationPath
    );
    this.keypairs.push(kp);
    this.numberOfAccounts += 1;
    return [kp.publicKey, this.numberOfAccounts - 1];
  }

  public getPublicKey(accountIndex: number): PublicKey {
    // This might not be true once we implement account deletion.
    // One solution is to simply make that a UI detail.
    if (this.keypairs.length !== this.numberOfAccounts) {
      throw new Error("invariant violation");
    }
    if (accountIndex >= this.keypairs.length) {
      throw new Error(
        `cannot get public key for account index: ${accountIndex}`
      );
    }
    const kp = this.keypairs[accountIndex];
    return kp.publicKey;
  }

  public toJson(): any {
    return {
      mnemonic: this.mnemonic,
      seed: this.seed.toString("hex"),
      numberOfAccounts: this.numberOfAccounts,
      derivationPath: this.derivationPath,
    };
  }

  public static fromJson(obj: any): HdKeyring {
    const { mnemonic, seed: seedStr, numberOfAccounts, derivationPath } = obj;
    const seed = Buffer.from(seedStr, "hex");
    const keypairs = deriveKeypairs(seed, derivationPath, numberOfAccounts);

    const kr = new HdKeyring({
      mnemonic,
      seed,
      numberOfAccounts,
      derivationPath,
      keypairs,
    });

    return kr;
  }
}

export class LedgerKeyring {
  private derivationPath: DerivationPath;
  private iframe: any;
  private iframeUrl: string;

  constructor({ derivationPath }: { derivationPath: DerivationPath }) {
    this.derivationPath = derivationPath;

    // Iframe.
    this.iframeUrl = "https://200ms-labs.github.io/anchor-wallet";
    this.iframe = document.createElement("iframe");
    this.iframe.src = this.iframeUrl;
    this.iframe.allow = `hid 'src'`;
    document.head.appendChild(this.iframe);
  }

  public signTransaction(tx: Buffer, address: PublicKey): string {
    // todo
    return "";
  }

  public toString(): string {
    return JSON.stringify({
      derivationPath: this.derivationPath,
    });
  }

  public static fromString(str: string): LedgerKeyring {
    const { derivationPath } = JSON.parse(str);

    return new LedgerKeyring({
      derivationPath,
    });
  }
}
