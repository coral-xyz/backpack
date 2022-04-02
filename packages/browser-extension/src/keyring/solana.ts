import { validateMnemonic, generateMnemonic, mnemonicToSeedSync } from "bip39";
import { Keypair, PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import * as bs58 from "bs58";
import { deriveKeypairs, deriveKeypair, DerivationPath } from "./crypto";
import {
  Keyring,
  KeyringFactory,
  KeyringJson,
  HdKeyring,
  HdKeyringFactory,
  HdKeyringJson,
  LedgerKeyringJson,
} from ".";

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

export class SolanaKeyring implements Keyring {
  constructor(readonly keypairs: Array<Keypair>) {}

  public publicKeys(): Array<string> {
    return this.keypairs.map((kp) => kp.publicKey.toString());
  }

  // `address` is the key on the keyring to use for signing.
  public signTransaction(tx: Buffer, address: string): string {
    const pubkey = new PublicKey(address);
    const kp = this.keypairs.find((kp) => kp.publicKey.equals(pubkey));
    if (!kp) {
      throw new Error(`unable to find ${address.toString()}`);
    }
    return bs58.encode(nacl.sign.detached(new Uint8Array(tx), kp.secretKey));
  }

  public signMessage(tx: Buffer, address: string): string {
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
    return new SolanaHdKeyring({
      mnemonic,
      seed,
      numberOfAccounts,
      keypairs,
      derivationPath,
    });
  }

  public generate(): HdKeyring {
    const mnemonic = generateMnemonic(256);
    const seed = mnemonicToSeedSync(mnemonic);
    const numberOfAccounts = 1;
    const derivationPath = DerivationPath.Bip44;
    const keypairs = deriveKeypairs(seed, derivationPath, numberOfAccounts);

    return new SolanaHdKeyring({
      mnemonic,
      seed,
      numberOfAccounts,
      derivationPath,
      keypairs,
    });
  }

  public fromJson(obj: HdKeyringJson): HdKeyring {
    const { mnemonic, seed: seedStr, numberOfAccounts, derivationPath } = obj;
    const seed = Buffer.from(seedStr, "hex");
    const keypairs = deriveKeypairs(seed, derivationPath, numberOfAccounts);

    const kr = new SolanaHdKeyring({
      mnemonic,
      seed,
      numberOfAccounts,
      derivationPath,
      keypairs,
    });

    return kr;
  }
}

export class SolanaHdKeyring extends SolanaKeyring implements HdKeyring {
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

  public deriveNext(): [string, number] {
    const kp = deriveKeypair(
      this.seed.toString("hex"),
      this.numberOfAccounts,
      this.derivationPath
    );
    this.keypairs.push(kp);
    this.numberOfAccounts += 1;
    return [kp.publicKey.toString(), this.numberOfAccounts - 1];
  }

  public getPublicKey(accountIndex: number): string {
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
    return kp.publicKey.toString();
  }

  public toJson(): HdKeyringJson {
    return {
      mnemonic: this.mnemonic,
      seed: this.seed.toString("hex"),
      numberOfAccounts: this.numberOfAccounts,
      derivationPath: this.derivationPath,
    };
  }
}

//const LEDGER_IFRAME_URL = "https://200ms-labs.github.io/anchor-wallet";
const LEDGER_IFRAME_URL = "https://localhost:4443/dist/browser";

export class SolanaLedgerKeyringFactory {
  public init(): SolanaLedgerKeyring {
    return new SolanaLedgerKeyring([]);
  }

  public fromJson(obj: LedgerKeyringJson): SolanaLedgerKeyring {
    return new SolanaLedgerKeyring(obj.derivationPaths);
  }
}

export class SolanaLedgerKeyring {
  private derivationPaths: Array<string>;

  private requestId: number;
  private responseResolvers: { [reqId: number]: [Function, Function] };

  private iframe: any;
  private iframeUrl: string;

  constructor(derivationPaths: Array<string>) {
    this.derivationPaths = derivationPaths;
    this.requestId = 0;
    this.responseResolvers = {};

    // Responses from the iframe.
    this._setupResponseChannel();

    // Inject the iframe.
    this.iframeUrl = LEDGER_IFRAME_URL;
    this.iframe = document.createElement("iframe");
    this.iframe.src = this.iframeUrl;
    this.iframe.allow = `hid 'src'`;
    document.head.appendChild(this.iframe);
  }

  public async connect() {
    const resp = await this.request({
      method: LEDGER_METHOD_CONNECT,
      params: [],
    });
    return resp;
  }

  public async confirmPublicKey() {
    return await this.request({
      method: LEDGER_METHOD_CONFIRM_PUBKEY,
      params: [],
    });
  }

  public signTransaction(tx: Buffer, address: PublicKey): string {
    // todo
    return "";
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

  private async request(req: { method: string; params: Array<any> }) {
    return new Promise((resolve, reject) => {
      const id = this.nextRequestId();
      this.responseResolvers[id] = [resolve, reject];
      const msg = {
        type: LEDGER_INJECTED_CHANNEL_REQUEST,
        detail: {
          id,
          ...req,
        },
      };
      this.iframe.contentWindow.postMessage(msg, "*");
    });
  }

  private nextRequestId(): number {
    const id = this.requestId;
    this.requestId += 1;
    return id;
  }

  private _setupResponseChannel() {
    window.addEventListener("message", (event) => {
      if (event.data.type !== LEDGER_INJECTED_CHANNEL_RESPONSE) {
        return;
      }
      const { id, result, error } = event.data.detail;
      const [resolve, reject] = this.responseResolvers[id];
      delete this.responseResolvers[id];
      if (error) {
        reject(error);
      }
      resolve(result);
    });
  }
}

// TODO: share all these with a common package.
const LEDGER_INJECTED_CHANNEL_REQUEST = "ledger-injected-request";
const LEDGER_INJECTED_CHANNEL_RESPONSE = "ledger-injected-response";
const LEDGER_METHOD_UNLOCK = "ledger-method-unlock";
const LEDGER_METHOD_CONNECT = "ledger-method-connect";
const LEDGER_METHOD_SIGN_TRANSACTION = "ledger-method-sign-transaction";
const LEDGER_METHOD_SIGN_MESSAGE = "ledger-method-sign-message";
const LEDGER_METHOD_CONFIRM_PUBKEY = "ledger-confirm-pubkey";
