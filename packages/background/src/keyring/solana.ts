import { validateMnemonic, generateMnemonic, mnemonicToSeedSync } from "bip39";
import { Keypair, PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import * as bs58 from "bs58";
import {
  generateUniqueId,
  LEDGER_INJECTED_CHANNEL_REQUEST,
  LEDGER_METHOD_CONNECT,
  LEDGER_METHOD_SIGN_TRANSACTION,
  LEDGER_METHOD_SIGN_MESSAGE,
  DerivationPath,
  LEDGER_INJECTED_CHANNEL_RESPONSE,
} from "@coral-xyz/common";
import { deriveKeypairs, deriveKeypair } from "./crypto";
import type {
  ImportedDerivationPath,
  Keyring,
  KeyringFactory,
  KeyringJson,
  HdKeyring,
  HdKeyringFactory,
  HdKeyringJson,
  LedgerKeyringJson,
  LedgerKeyring,
} from "./types";
import { postMessageToIframe } from "../shared";

export class SolanaKeyringFactory implements KeyringFactory {
  public fromJson(payload: KeyringJson): SolanaKeyring {
    const keypairs = payload.keypairs.map((secret: string) =>
      Keypair.fromSecretKey(Buffer.from(secret, "hex"))
    );
    return new SolanaKeyring(keypairs);
  }

  public fromSecretKeys(secretKeys: Array<string>): SolanaKeyring {
    const keypairs = secretKeys.map((secret: string) =>
      Keypair.fromSecretKey(Buffer.from(secret, "hex"))
    );
    return new SolanaKeyring(keypairs);
  }
}

class SolanaKeyring implements Keyring {
  constructor(readonly keypairs: Array<Keypair>) {}

  public publicKeys(): Array<string> {
    return this.keypairs.map((kp) => kp.publicKey.toString());
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
      keypairs: this.keypairs.map((kp) =>
        Buffer.from(kp.secretKey).toString("hex")
      ),
    };
  }
}

export class SolanaHdKeyringFactory implements HdKeyringFactory {
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
    const keypairs = deriveKeypairs(seed, derivationPath, accountIndices);
    return new SolanaHdKeyring({
      mnemonic,
      seed,
      accountIndices,
      keypairs,
      derivationPath,
    });
  }

  public generate(strength): HdKeyring {
    const mnemonic = generateMnemonic(strength);
    const seed = mnemonicToSeedSync(mnemonic);
    const accountIndices = [0];
    const derivationPath = DerivationPath.Bip44;
    const keypairs = deriveKeypairs(seed, derivationPath, accountIndices);

    return new SolanaHdKeyring({
      mnemonic,
      seed,
      accountIndices,
      derivationPath,
      keypairs,
    });
  }

  public fromJson(obj: HdKeyringJson): HdKeyring {
    const { mnemonic, seed: seedStr, accountIndices, derivationPath } = obj;
    const seed = Buffer.from(seedStr, "hex");
    const keypairs = deriveKeypairs(seed, derivationPath, accountIndices);

    const kr = new SolanaHdKeyring({
      mnemonic,
      seed,
      accountIndices,
      derivationPath,
      keypairs,
    });

    return kr;
  }
}

class SolanaHdKeyring extends SolanaKeyring implements HdKeyring {
  readonly mnemonic: string;
  private seed: Buffer;
  private accountIndices: Array<number>;
  private derivationPath: DerivationPath;

  constructor({
    mnemonic,
    seed,
    accountIndices,
    keypairs,
    derivationPath,
  }: {
    mnemonic: string;
    seed: Buffer;
    accountIndices: Array<number>;
    keypairs: Array<Keypair>;
    derivationPath: DerivationPath;
  }) {
    super(keypairs);
    this.mnemonic = mnemonic;
    this.seed = seed;
    this.accountIndices = accountIndices;
    this.derivationPath = derivationPath;
  }

  public deriveNext(): [string, number] {
    // TODO: this may not be the desired behaviour, what about non-contiguous indices?
    const nextAccountIndex = Math.max(...this.accountIndices) + 1;
    const kp = deriveKeypair(
      this.seed.toString("hex"),
      nextAccountIndex,
      this.derivationPath
    );
    this.keypairs.push(kp);
    this.accountIndices.push(nextAccountIndex);
    return [kp.publicKey.toString(), nextAccountIndex];
  }

  public getPublicKey(accountIndex: number): string {
    // This might not be true once we implement account deletion.
    // One solution is to simply make that a UI detail.
    if (this.keypairs.length !== this.accountIndices.length) {
      throw new Error("invariant violation");
    }
    const kp = this.keypairs[this.accountIndices.indexOf(accountIndex)];
    return kp.publicKey.toString();
  }

  public toJson(): HdKeyringJson {
    return {
      mnemonic: this.mnemonic,
      seed: this.seed.toString("hex"),
      accountIndices: this.accountIndices,
      derivationPath: this.derivationPath,
    };
  }
}

// This code runs inside a ServiceWorker, so the message listener below must be
// created immediately. That's why `responseResolvers` is in the file's global scope.

const responseResolvers: {
  [reqId: string]: {
    resolve: (value: any) => void;
    reject: (reason?: string) => void;
  };
} = {};

export class SolanaLedgerKeyringFactory {
  public init(): SolanaLedgerKeyring {
    return new SolanaLedgerKeyring([]);
  }

  public fromJson(obj: LedgerKeyringJson): SolanaLedgerKeyring {
    return new SolanaLedgerKeyring(obj.derivationPaths);
  }
}

export class SolanaLedgerKeyring implements LedgerKeyring {
  private derivationPaths: Array<ImportedDerivationPath>;

  constructor(derivationPaths: Array<ImportedDerivationPath>) {
    this.derivationPaths = derivationPaths;
  }

  public keyCount(): number {
    return this.derivationPaths.length;
  }

  public async connect() {
    const resp = await this.request({
      method: LEDGER_METHOD_CONNECT,
      params: [],
    });
    return resp;
  }

  public async ledgerImport(path: string, account: number, publicKey: string) {
    const found = this.derivationPaths.find(
      ({ path, account, publicKey: pk }) => publicKey === pk
    );
    if (found) {
      throw new Error("ledger account already exists");
    }
    this.derivationPaths.push({ path, account, publicKey });
  }

  public publicKeys(): Array<string> {
    return this.derivationPaths.map((dp) => dp.publicKey);
  }

  public async signTransaction(tx: Buffer, address: string): Promise<string> {
    const path = this.derivationPaths.find((p) => p.publicKey === address);
    if (!path) {
      throw new Error("ledger address not found");
    }
    return await this.request({
      method: LEDGER_METHOD_SIGN_TRANSACTION,
      params: [bs58.encode(tx), path.path, path.account],
    });
  }

  public async signMessage(msg: Buffer, address: string): Promise<string> {
    const path = this.derivationPaths.find((p) => p.publicKey === address);
    if (!path) {
      throw new Error("ledger address not found");
    }
    return await this.request({
      method: LEDGER_METHOD_SIGN_MESSAGE,
      params: [bs58.encode(msg), path.path, path.account],
    });
  }

  exportSecretKey(address: string): string | null {
    throw new Error("ledger keyring cannot secret keys");
  }

  importSecretKey(secretKey: string): string {
    throw new Error("ledger keyring cannot import secret keys");
  }

  public toString(): string {
    return JSON.stringify({
      derivationPath: this.derivationPaths,
    });
  }

  public static fromString(str: string): SolanaLedgerKeyring {
    const { derivationPaths } = JSON.parse(str);
    return new SolanaLedgerKeyring(derivationPaths);
  }

  public toJson(): LedgerKeyringJson {
    return {
      derivationPaths: this.derivationPaths,
    };
  }

  private async request<T = any>(req: {
    method: string;
    params: Array<any>;
  }): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = generateUniqueId();
      responseResolvers[id] = { resolve, reject };
      const msg = {
        type: LEDGER_INJECTED_CHANNEL_REQUEST,
        detail: {
          id,
          ...req,
        },
      };
      postMessageToIframe(msg);
    });
  }
}

// Handle receiving postMessages
self.addEventListener("message", (msg) => {
  try {
    if (msg.data.type !== LEDGER_INJECTED_CHANNEL_RESPONSE) {
      return;
    }

    const {
      data: { detail },
    } = msg;
    const { id, result, error } = detail;

    const resolver = responseResolvers[id];
    if (!resolver) {
      // Why does this get thrown?
      throw new Error(`resolver not found for request id: ${id}`);
    }
    const { resolve, reject } = resolver;
    delete responseResolvers[id];

    if (error) {
      reject(error);
    }
    resolve(result);
  } catch (err) {
    console.error(err);
  }
});
