import type { WalletDescriptor } from "@coral-xyz/common";
import {
  Blockchain,
  LEDGER_METHOD_SOLANA_SIGN_MESSAGE,
  LEDGER_METHOD_SOLANA_SIGN_TRANSACTION,
} from "@coral-xyz/common";
import { Keypair, PublicKey } from "@solana/web3.js";
import { mnemonicToSeedSync, validateMnemonic } from "bip39";
import { decode, encode } from "bs58";
import nacl from "tweetnacl";

import { getBlockchainConfig } from "../../blockchain-configs/blockchains";
import {
  getIndexedPath,
  nextIndicesFromPaths,
} from "../../keyring/derivationPaths";
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
  deriveSolanaKeypair,
  deriveSolanaPrivateKey,
  deserializeTransaction,
} from "./util";

export class SolanaKeyringFactory implements KeyringFactory {
  public init(secretKeys: Array<string>): SolanaKeyring {
    const keypairs = secretKeys.map((secret: string) =>
      Keypair.fromSecretKey(Buffer.from(secret, "hex"))
    );
    return new SolanaKeyring(keypairs);
  }

  public fromJson(payload: KeyringJson): SolanaKeyring {
    const keypairs = payload.secretKeys.map((secret: string) =>
      Keypair.fromSecretKey(Buffer.from(secret, "hex"))
    );
    return new SolanaKeyring(keypairs);
  }
}

class SolanaKeyringBase implements KeyringBase {
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
    return encode(nacl.sign.detached(new Uint8Array(tx), kp.secretKey));
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
    return encode(kp.secretKey);
  }

  public importSecretKey(secretKey: string): string {
    const kp = Keypair.fromSecretKey(Buffer.from(secretKey, "hex"));
    this.keypairs.push(kp);
    return kp.publicKey.toString();
  }

  public mnemonicToSecretKey(mnemonic: string, derivationPath: string): string {
    const seed = mnemonicToSeedSync(mnemonic);
    return Buffer.from(deriveSolanaPrivateKey(seed, derivationPath)).toString(
      "hex"
    );
  }
}

class SolanaKeyring extends SolanaKeyringBase implements Keyring {
  public toJson(): KeyringJson {
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
    accountIndex?: number,
    walletIndex?: number
  ): HdKeyring {
    if (!validateMnemonic(mnemonic)) {
      throw new Error("Invalid seed words");
    }
    return new SolanaHdKeyring({
      mnemonic,
      seed: mnemonicToSeedSync(mnemonic),
      derivationPaths,
      accountIndex,
      walletIndex,
    });
  }

  public fromJson({
    mnemonic,
    seed,
    derivationPaths,
    accountIndex,
    walletIndex,
  }: HdKeyringJson): HdKeyring {
    return new SolanaHdKeyring({
      mnemonic,
      seed: Buffer.from(seed, "hex"),
      derivationPaths,
      accountIndex,
      walletIndex,
    });
  }
}

class SolanaHdKeyring extends SolanaKeyringBase implements HdKeyring {
  readonly mnemonic: string;
  private seed: Buffer;
  private derivationPaths: Array<string>;
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
    const keypairs = derivationPaths.map((d) => deriveSolanaKeypair(seed, d));
    super(keypairs);
    this.mnemonic = mnemonic;
    this.seed = seed;
    this.derivationPaths = derivationPaths;
    this.accountIndex = accountIndex;
    this.walletIndex = walletIndex;
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

  public nextDerivationPath(offset = 1): {
    derivationPath: any;
    offset: number;
  } {
    this.ensureIndices();
    const bip44CoinType = getBlockchainConfig(Blockchain.SOLANA).bip44CoinType;
    const derivationPath = getIndexedPath(
      bip44CoinType,
      this.walletIndex! + offset
    );
    if (this.derivationPaths.includes(derivationPath)) {
      // This key is already included for some reason, try again with
      // incremented walletIndex
      return this.nextDerivationPath(offset + 1);
    }
    return { derivationPath, offset };
  }

  public deriveNextKey(): {
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

  public addDerivationPath(derivationPath: string): string {
    const keypair = deriveSolanaKeypair(this.seed, derivationPath);
    if (!this.derivationPaths.includes(derivationPath)) {
      // Don't persist duplicate public keys
      this.keypairs.push(keypair);
      this.derivationPaths.push(derivationPath);
    }
    return keypair.publicKey.toString();
  }

  // TODO duplicated in the evm keyring
  ensureIndices() {
    // If account index and wallet index don't exist, make a best guess based
    // on the existing derivation paths for the keyring
    if (this.accountIndex === undefined || this.walletIndex === undefined) {
      const { walletIndex } = nextIndicesFromPaths(this.derivationPaths);
      if (!this.accountIndex) this.accountIndex = 0;
      if (!this.walletIndex) this.walletIndex = walletIndex - 1;
    }
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

export class SolanaLedgerKeyringFactory {
  public init(walletDescriptors: Array<WalletDescriptor>): LedgerKeyring {
    return new SolanaLedgerKeyring(walletDescriptors, Blockchain.SOLANA);
  }

  public fromJson(obj: LedgerKeyringJson): LedgerKeyring {
    return new SolanaLedgerKeyring(obj.walletDescriptors, Blockchain.SOLANA);
  }
}

class SolanaLedgerKeyring extends LedgerKeyringBase implements LedgerKeyring {
  public async signTransaction(tx: Buffer, publicKey: string): Promise<string> {
    const walletDescriptor = this.walletDescriptors.find(
      (p) => p.publicKey === publicKey
    );
    if (!walletDescriptor) {
      throw new Error("ledger address not found");
    }
    return await this.request({
      method: LEDGER_METHOD_SOLANA_SIGN_TRANSACTION,
      params: [encode(tx), walletDescriptor.derivationPath.replace("m/", "")],
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
      method: LEDGER_METHOD_SOLANA_SIGN_MESSAGE,
      params: [encode(msg), walletDescriptor.derivationPath.replace("m/", "")],
    });
  }

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
      throw new Error("ledger address not found");
    }

    const transaction = deserializeTransaction(request.tx);
    const message = transaction.message.serialize();
    const signableTx = encode(message);

    return {
      signableTx,
      derivationPath: walletDescriptor.derivationPath.replace("m/", ""),
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
      throw new Error("ledger address not found");
    }

    // For ledger signing to work, message needs valid header:
    // https://github.com/solana-labs/solana/blob/e80f67dd58b7fa3901168055211f346164efa43a/docs/src/proposals/off-chain-message-signing.md

    // See secure-ui/clients/SolanaClient.prepareSolanaOffchainMessage

    return {
      signableMessage: request.message,
      derivationPath: walletDescriptor.derivationPath.replace("m/", ""),
    };
  }
}
