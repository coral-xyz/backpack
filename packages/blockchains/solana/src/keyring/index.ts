import type {
  HdKeyring,
  HdKeyringFactory,
  HdKeyringJson,
  Keyring,
  KeyringFactory,
  KeyringJson,
  KeystoneKeyring,
  KeystoneKeyringFactory,
  LedgerKeyring,
  LedgerKeyringJson,
} from "@coral-xyz/blockchain-keyring";
import {
  KeystoneKeyringBase,
  LedgerKeyringBase,
} from "@coral-xyz/blockchain-keyring";
import type {
  KeystoneKeyringJson,
  UR,
  WalletDescriptor,
} from "@coral-xyz/common";
import {
  Blockchain,
  getIndexedPath,
  LEDGER_METHOD_SOLANA_SIGN_MESSAGE,
  LEDGER_METHOD_SOLANA_SIGN_TRANSACTION,
  nextIndicesFromPaths,
} from "@coral-xyz/common";
import { Keypair, Message, PublicKey, Transaction } from "@solana/web3.js";
import { mnemonicToSeedSync, validateMnemonic } from "bip39";
import { ethers } from "ethers";
import nacl from "tweetnacl";

import { deriveSolanaKeypair } from "../util";

import { KeystoneKeyring as KeystoneKeyringOrigin } from "./keystone";

const { base58 } = ethers.utils;

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
    return base58.encode(nacl.sign.detached(new Uint8Array(tx), kp.secretKey));
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
    return base58.encode(kp.secretKey);
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

class SolanaHdKeyring extends SolanaKeyring implements HdKeyring {
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
      const { accountIndex, walletIndex } = nextIndicesFromPaths(
        this.derivationPaths
      );
      if (!this.accountIndex) this.accountIndex = accountIndex;
      if (!this.walletIndex) this.walletIndex = walletIndex;
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

export class SolanaLedgerKeyring
  extends LedgerKeyringBase
  implements LedgerKeyring
{
  public async signTransaction(tx: Buffer, publicKey: string): Promise<string> {
    const walletDescriptor = this.walletDescriptors.find(
      (p) => p.publicKey === publicKey
    );
    if (!walletDescriptor) {
      throw new Error("ledger address not found");
    }
    return await this.request({
      method: LEDGER_METHOD_SOLANA_SIGN_TRANSACTION,
      params: [
        base58.encode(tx),
        walletDescriptor.derivationPath.replace("m/", ""),
      ],
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
      params: [
        base58.encode(msg),
        walletDescriptor.derivationPath.replace("m/", ""),
      ],
    });
  }
}

export class SolanaKeystoneKeyringFactory implements KeystoneKeyringFactory {
  public fromAccounts(
    accounts: Array<WalletDescriptor>,
    xfp?: string
  ): KeystoneKeyring {
    return new SolanaKeystoneKeyring({ accounts, xfp });
  }

  public async fromUR(ur: UR): Promise<KeystoneKeyring> {
    return await SolanaKeystoneKeyring.fromUR(ur);
  }

  public fromJson(obj: KeystoneKeyringJson): KeystoneKeyring {
    return new SolanaKeystoneKeyring(obj);
  }
}

export class SolanaKeystoneKeyring
  extends KeystoneKeyringBase
  implements KeystoneKeyring
{
  private keyring: KeystoneKeyringOrigin;

  constructor({
    accounts,
    xfp,
  }: {
    accounts?: WalletDescriptor[];
    xfp?: string;
  }) {
    super();
    this.keyring = new KeystoneKeyringOrigin();
    if (accounts && xfp) {
      this.setAccounts(accounts, xfp);
    }
  }

  public onPlay(fn: (ur: UR) => Promise<void>) {
    this.keyring.getInteraction().onPlay(fn);
  }

  public onRead(fn: () => Promise<UR>) {
    this.keyring.getInteraction().onRead(fn);
  }

  public async signTransaction(
    txMsg: Buffer,
    address: string
  ): Promise<string> {
    const signedTx = await this.keyring.signTransaction(
      address,
      Transaction.populate(Message.from(txMsg))
    );
    return signedTx.signature ? base58.encode(signedTx.signature) : "";
  }

  public async signMessage(msg: Buffer, address: string): Promise<string> {
    return base58.encode(await this.keyring.signMessage(address, msg));
  }

  public async keystoneImport(ur: UR, pubKey?: string) {
    this.keyring.getInteraction().onRead(() => ur);
    await this.keyring.readKeyring();
    // reset onRead
    this.keyring.getInteraction().onRead();
    if (pubKey) {
      const accounts = this.getCachedAccounts();
      const i = accounts.findIndex((e) => e.publicKey === pubKey);
      this.addPublicKey(accounts[i]);
    }
  }

  public static async fromUR(ur: UR) {
    const inst = new SolanaKeystoneKeyring({});
    await inst.keystoneImport(ur);
    return inst;
  }

  public setAccounts(accounts: WalletDescriptor[], xfp: string) {
    this.keyring.syncKeyringData({
      xfp,
      keys: accounts
        .filter((e) => e.xfp === xfp)
        .map((e) => ({
          hdPath: e.derivationPath,
          index: -1,
          pubKey: e.publicKey,
        })),
      device: "Backpack Extension",
    });
    this.setPublicKeys(accounts);
  }

  public getCachedAccounts(): WalletDescriptor[] {
    const xfp = this.keyring.getXFP();
    return this.keyring.getAccounts().map((e) => ({
      derivationPath: e.hdPath,
      index: e.index,
      publicKey: e.pubKey,
      xfp,
    }));
  }

  public getXFP(): string {
    return this.keyring.getXFP();
  }

  public toJson() {
    return {
      accounts: this.getAccounts(),
      xfp: this.keyring.getXFP(),
    };
  }
}
