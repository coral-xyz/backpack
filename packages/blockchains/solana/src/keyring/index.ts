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
import type { PublicKeyPath } from "@coral-xyz/common";
import {
  Blockchain,
  getIndexedPath,
  LEDGER_METHOD_SOLANA_SIGN_MESSAGE,
  LEDGER_METHOD_SOLANA_SIGN_TRANSACTION,
  legacyBip44ChangeIndexed,
  legacyBip44Indexed,
  // legacySolletIndexed,
} from "@coral-xyz/common";
import { Keypair, PublicKey } from "@solana/web3.js";
import { mnemonicToSeedSync, validateMnemonic } from "bip39";
import * as bs58 from "bs58";
import nacl from "tweetnacl";

import { deriveSolanaKeypair } from "../util";

export class SolanaKeyringFactory implements KeyringFactory {
  public init(secretKeys: Array<string>): SolanaKeyring {
    const keypairs = secretKeys.map((secret: string) =>
      Keypair.fromSecretKey(Buffer.from(secret, "hex"))
    );
    return new SolanaKeyring(keypairs);
  }

  /**
   *
   */
  public fromJson(payload: KeyringJson): SolanaKeyring {
    const keypairs = payload.secretKeys.map((secret: string) =>
      Keypair.fromSecretKey(Buffer.from(secret, "hex"))
    );
    return new SolanaKeyring(keypairs);
  }
}

class SolanaKeyring implements Keyring {
  constructor(public keypairs: Array<Keypair>) {}

  public publicKeys(): Array<string> {
    return this.keypairs.map((kp) => kp.publicKey.toString());
  }

  public deletePublicKey(publicKey: string) {
    this.keypairs = this.keypairs.filter(
      (kp) => kp.publicKey.toString() !== publicKey
    );
  }

  // `address` is the key on the keyring to use for signing.
  public async signTransaction(tx: Buffer, address: string): Promise<string> {
    const pubkey = new PublicKey(address);
    const kp = this.keypairs.find((kp) => kp.publicKey.equals(pubkey));
    if (!kp) {
      throw new Error(`unable to find ${address.toString()}`);
    }
    return bs58.encode(nacl.sign.detached(new Uint8Array(tx), kp.secretKey));
  }

  public async signMessage(tx: Buffer, address: string): Promise<string> {
    // TODO: this shouldn't blindly sign. We should check some
    //       type of unique prefix that asserts this isn't a
    //       real transaction.
    return this.signTransaction(tx, address);
  }

  public exportSecretKey(address: string): string | null {
    const pubkey = new PublicKey(address);
    const kp = this.keypairs.find((kp) => kp.publicKey.equals(pubkey));
    if (!kp) {
      return null;
    }
    return bs58.encode(kp.secretKey);
  }

  public importSecretKey(secretKey: string): string {
    const kp = Keypair.fromSecretKey(Buffer.from(secretKey, "hex"));
    this.keypairs.push(kp);
    return kp.publicKey.toString();
  }

  public toJson(): any {
    return {
      secretKeys: this.keypairs.map((kp) =>
        Buffer.from(kp.secretKey).toString("hex")
      ),
    };
  }
}

export class SolanaHdKeyringFactory implements HdKeyringFactory {
  public init(
    mnemonic: string,
    derivationPaths: Array<string>,
    accountIndex: number
  ): HdKeyring {
    if (!validateMnemonic(mnemonic)) {
      throw new Error("Invalid seed words");
    }
    return new SolanaHdKeyring({
      mnemonic,
      seed: mnemonicToSeedSync(mnemonic),
      derivationPaths,
      accountIndex,
    });
  }

  public fromJson({
    mnemonic,
    seed,
    derivationPaths,
    accountIndex,
    walletIndex,
    legacyPathType,
  }: HdKeyringJson): HdKeyring {
    return new SolanaHdKeyring({
      mnemonic,
      seed: Buffer.from(seed, "hex"),
      derivationPaths,
      accountIndex,
      walletIndex,
      legacyPathType,
    });
  }
}

class SolanaHdKeyring extends SolanaKeyring implements HdKeyring {
  readonly mnemonic: string;
  private seed: Buffer;
  private derivationPaths: Array<string>;
  private accountIndex: number;
  private walletIndex?: number;
  private legacyPathType?: "bip44" | "bip44change" | "sollet-deprecated";

  constructor({
    mnemonic,
    seed,
    derivationPaths,
    accountIndex,
    walletIndex,
    legacyPathType,
  }: {
    mnemonic: string;
    seed: Buffer;
    derivationPaths: Array<string>;
    accountIndex: number;
    walletIndex?: number;
    legacyPathType?: "bip44" | "bip44change" | "sollet-deprecated";
  }) {
    const keypairs = derivationPaths.map((d) => deriveSolanaKeypair(seed, d));
    super(keypairs);
    this.mnemonic = mnemonic;
    this.seed = seed;
    this.derivationPaths = derivationPaths;
    this.accountIndex = accountIndex;
    this.walletIndex = walletIndex;
    this.legacyPathType = legacyPathType;
  }

  public deletePublicKey(publicKey: string) {
    const index = this.keypairs.findIndex(
      (kp) => kp.publicKey.toString() === publicKey
    );
    if (index < 0) {
      return;
    }
    this.derivationPaths = this.derivationPaths
      .slice(0, index)
      .concat(this.derivationPaths.slice(index + 1));
    super.deletePublicKey(publicKey);
  }

  public deriveNextKey(): { publicKey: string; derivationPath: string } {
    let derivationPath: string;
    if (this.legacyPathType) {
      // accountIndex maintains the same meaning it did in the legacy derivation
      // path system, i.e. the index of the last generated wallet, but it does
      // not correspond to the account index field of BIP44
      this.accountIndex += 1;
      console.debug("old derivation", this.accountIndex);
      if (this.legacyPathType === "bip44") {
        derivationPath = legacyBip44Indexed(
          Blockchain.SOLANA,
          this.accountIndex
        );
      } else if (this.legacyPathType === "bip44change") {
        derivationPath = legacyBip44ChangeIndexed(
          Blockchain.SOLANA,
          this.accountIndex
        );
      } else {
        // TODO sollet deprecated
        derivationPath = "";
      }
    } else {
      // New style derivation paths
      if (this.accountIndex) throw new Error("invalid account index");
      console.debug("new derivation", this.accountIndex, this.walletIndex);
      this.walletIndex = this.walletIndex ? this.walletIndex + 1 : 0;
      derivationPath = getIndexedPath(
        Blockchain.SOLANA,
        this.accountIndex,
        this.walletIndex
      );
    }
    const keypair = deriveSolanaKeypair(this.seed, derivationPath);
    this.keypairs.push(keypair);
    this.derivationPaths.push(derivationPath);
    return {
      publicKey: keypair.publicKey.toString(),
      derivationPath,
    };
  }

  public addDerivationPath(derivationPath: string): string {
    const keypair = deriveSolanaKeypair(this.seed, derivationPath);
    this.keypairs.push(keypair);
    this.derivationPaths.push(derivationPath);
    return keypair.publicKey.toString();
  }

  public toJson(): HdKeyringJson {
    return {
      mnemonic: this.mnemonic,
      seed: this.seed.toString("hex"),
      derivationPaths: this.derivationPaths,
      accountIndex: this.accountIndex,
      walletIndex: this.walletIndex,
      legacyPathType: this.legacyPathType,
    };
  }
}

export class SolanaLedgerKeyringFactory {
  public init(publicKeyPaths: Array<PublicKeyPath>): LedgerKeyring {
    return new SolanaLedgerKeyring(publicKeyPaths);
  }

  public fromJson(obj: LedgerKeyringJson): LedgerKeyring {
    return new SolanaLedgerKeyring(obj.publicKeyPaths);
  }
}

export class SolanaLedgerKeyring
  extends LedgerKeyringBase
  implements LedgerKeyring
{
  public async signTransaction(tx: Buffer, publicKey: string): Promise<string> {
    const publicKeyPath = this.publicKeyPaths.find(
      (p) => p.publicKey === publicKey
    );
    if (!publicKeyPath) {
      throw new Error("ledger address not found");
    }
    return await this.request({
      method: LEDGER_METHOD_SOLANA_SIGN_TRANSACTION,
      params: [bs58.encode(tx), publicKeyPath.derivationPath.replace("m/", "")],
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
      method: LEDGER_METHOD_SOLANA_SIGN_MESSAGE,
      params: [
        bs58.encode(msg),
        publicKeyPath.derivationPath.replace("m/", ""),
      ],
    });
  }
}
