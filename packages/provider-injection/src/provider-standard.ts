import type {
  ConnectInput,
  ConnectOutput,
  SignAndSendTransactionFeature,
  SignAndSendTransactionInputs,
  SignAndSendTransactionOutputs,
  SignMessageFeature,
  SignMessageInputs,
  SignMessageOutputs,
  SignTransactionFeature,
  SignTransactionInputs,
  SignTransactionOutputs,
  Wallet,
  WalletAccount,
  WalletAccountFeatureNames,
  WalletEventNames,
  WalletEvents,
} from "@solana/wallet-standard";
import { VERSION_1_0_0 } from "@solana/wallet-standard";
import {
  bytesEqual,
  CHAIN_SOLANA_DEVNET,
  CHAIN_SOLANA_LOCALNET,
  CHAIN_SOLANA_MAINNET,
  CHAIN_SOLANA_TESTNET,
} from "@solana/wallet-standard-util";
import {
  clusterApiUrl,
  Transaction,
  TransactionSignature,
} from "@solana/web3.js";
import { decode } from "bs58";
import { icon } from "./icon";

export type BackpackSolanaWalletChain =
  | typeof CHAIN_SOLANA_MAINNET
  | typeof CHAIN_SOLANA_DEVNET
  | typeof CHAIN_SOLANA_TESTNET
  | typeof CHAIN_SOLANA_LOCALNET;

export class BackpackSolanaWalletAccount implements WalletAccount {
  readonly #publicKey: Uint8Array;
  readonly #chain: BackpackSolanaWalletChain;

  get address() {
    return this.publicKey;
  }

  get publicKey() {
    return this.#publicKey;
  }

  get chain() {
    return this.#chain;
  }

  get features(): SignAndSendTransactionFeature<this> &
    SignTransactionFeature<this> &
    SignMessageFeature<this> {
    return {
      signAndSendTransaction: {
        signAndSendTransaction: (...args) =>
          this.#signAndSendTransaction(...args),
      },
      signTransaction: {
        signTransaction: (...args) => this.#signTransaction(...args),
      },
      signMessage: { signMessage: (...args) => this.#signMessage(...args) },
    };
  }

  constructor(publicKey: Uint8Array, chain: BackpackSolanaWalletChain) {
    this.#publicKey = publicKey;
    this.#chain = chain;
  }

  async #signAndSendTransaction(
    inputs: SignAndSendTransactionInputs<this>
  ): Promise<SignAndSendTransactionOutputs<this>> {
    if (inputs.some((input) => !!input.extraSigners?.length))
      throw new Error("extraSigners not implemented");

    const transactions = inputs.map(({ transaction }) =>
      Transaction.from(transaction)
    );

    let signatures: TransactionSignature[];
    if (transactions.length === 1) {
      signatures = [await window.backpack.send(transactions[0])];
    } else if (transactions.length > 1) {
      signatures = await window.backpack.sendAll(
        transactions.map((tx) => ({ tx }))
      );
    } else {
      signatures = [];
    }

    return signatures.map((signature) => ({ signature: decode(signature) }));
  }

  async #signTransaction(
    inputs: SignTransactionInputs<this>
  ): Promise<SignTransactionOutputs<this>> {
    if (inputs.some((input) => !!input.extraSigners?.length))
      throw new Error("extraSigners not implemented");

    const transactions = inputs.map(({ transaction }) =>
      Transaction.from(transaction)
    );

    let signedTransactions: Transaction[];
    if (transactions.length === 1) {
      signedTransactions = [
        await window.backpack.signTransaction(transactions[0]),
      ];
    } else if (transactions.length > 1) {
      signedTransactions = await window.backpack.signAllTransactions(
        transactions
      );
    } else {
      signedTransactions = [];
    }

    return signedTransactions.map((transaction) => ({
      signedTransaction: transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      }),
    }));
  }

  async #signMessage(
    inputs: SignMessageInputs<this>
  ): Promise<SignMessageOutputs<this>> {
    if (inputs.some((input) => !!input.extraSigners?.length))
      throw new Error("extraSigners not implemented");

    if (inputs.length === 1) {
      const signedMessage = inputs[0].message;
      const signature = await window.backpack.signMessage(signedMessage);
      return [{ signedMessage, signatures: [signature] }];
    } else if (inputs.length > 1) {
      throw new Error("signAllMessages not implemented");
    } else {
      return [];
    }
  }
}

export class BackpackSolanaWallet
  implements Wallet<BackpackSolanaWalletAccount>
{
  #listeners: {
    [E in WalletEventNames<BackpackSolanaWalletAccount>]?: WalletEvents<BackpackSolanaWalletAccount>[E][];
  } = {};
  #account: BackpackSolanaWalletAccount | undefined;

  get version() {
    return VERSION_1_0_0;
  }

  get name() {
    return "Backpack";
  }

  get icon() {
    return icon;
  }

  get chains() {
    return this.#account ? [this.#account.chain] : [];
  }

  get features() {
    return [
      "signAndSendTransaction" as const,
      "signTransaction" as const,
      "signMessage" as const,
    ];
  }

  get accounts() {
    return this.#account ? [this.#account] : [];
  }

  get hasMoreAccounts() {
    return false;
  }

  constructor() {
    window.backpack.on("connect", this._connect, this);
    window.backpack.on("disconnect", this._disconnect, this);
    window.backpack.on("connectionDidChange", this._reconnect, this);

    this._connect();
  }

  async connect<
    Chain extends BackpackSolanaWalletAccount["chain"],
    FeatureNames extends WalletAccountFeatureNames<BackpackSolanaWalletAccount>,
    Input extends ConnectInput<BackpackSolanaWalletAccount, Chain, FeatureNames>
  >({
    chains,
    addresses,
    features,
    silent,
  }: Input): Promise<
    ConnectOutput<BackpackSolanaWalletAccount, Chain, FeatureNames, Input>
  > {
    if (!silent && !window.backpack.isConnected) {
      await window.backpack.connect();
    }

    this._connect();

    return {
      accounts: this.accounts as any,
      hasMoreAccounts: false,
    };
  }

  on<E extends WalletEventNames<BackpackSolanaWalletAccount>>(
    event: E,
    listener: WalletEvents<BackpackSolanaWalletAccount>[E]
  ): () => void {
    this.#listeners[event]?.push(listener) ||
      (this.#listeners[event] = [listener]);
    return (): void => this.#off(event, listener);
  }

  #emit<E extends WalletEventNames<BackpackSolanaWalletAccount>>(
    event: E,
    ...args: Parameters<WalletEvents<BackpackSolanaWalletAccount>[E]>
  ): void {
    this.#listeners[event]?.forEach((listener) => listener.apply(null, args));
  }

  #off<E extends WalletEventNames<BackpackSolanaWalletAccount>>(
    event: E,
    listener: WalletEvents<BackpackSolanaWalletAccount>[E]
  ): void {
    this.#listeners[event] = this.#listeners[event]?.filter(
      (existingListener) => listener !== existingListener
    );
  }

  private _connect(): void {
    const publicKey = window.backpack.publicKey?.toBytes();
    if (publicKey) {
      let chain: BackpackSolanaWalletChain = CHAIN_SOLANA_MAINNET;
      const endpoint = window.backpack.connection.rpcEndpoint;
      if (endpoint === clusterApiUrl("devnet")) {
        chain = CHAIN_SOLANA_DEVNET;
      } else if (endpoint === clusterApiUrl("testnet")) {
        chain = CHAIN_SOLANA_TESTNET;
      } else if (/^https?:\/\/localhost[:\/]/.test(endpoint)) {
        chain = CHAIN_SOLANA_LOCALNET;
      }

      const account = this.#account;
      if (
        !account ||
        account.chain !== chain ||
        !bytesEqual(account.publicKey, publicKey)
      ) {
        this.#account = new BackpackSolanaWalletAccount(publicKey, chain);
        this.#emit("change", ["accounts", "chains"]);
      }
    }
  }

  private _disconnect(): void {
    if (this.#account) {
      this.#account = undefined;
      this.#emit("change", ["accounts", "chains"]);
    }
  }

  private _reconnect(): void {
    if (window.backpack.publicKey) {
      this._connect();
    } else {
      this._disconnect();
    }
  }
}
