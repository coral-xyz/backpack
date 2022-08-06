import type {
  Bytes,
  ConnectInput,
  ConnectOutput,
  SignAndSendTransactionInput,
  SignAndSendTransactionMethod,
  SignAndSendTransactionOutput,
  SignMessageInput,
  SignMessageMethod,
  SignMessageOutput,
  SignTransactionInput,
  SignTransactionMethod,
  SignTransactionOutput,
  Wallet,
  WalletAccount,
  WalletAccountMethodNames,
  WalletEventNames,
  WalletEvents,
} from "@solana/wallet-standard";
import {
  bytesEqual,
  CHAIN_SOLANA_DEVNET,
  CHAIN_SOLANA_LOCALNET,
  CHAIN_SOLANA_MAINNET,
  CHAIN_SOLANA_TESTNET,
  concatBytes,
} from "@solana/wallet-standard";
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
  private _publicKey: Bytes;
  private _chain: BackpackSolanaWalletChain;

  get address() {
    return this.publicKey;
  }

  get publicKey() {
    return this._publicKey;
  }

  get chain() {
    return this._chain;
  }

  get ciphers() {
    return [];
  }

  get methods(): SignTransactionMethod<this> &
    SignAndSendTransactionMethod<this> &
    SignMessageMethod<this> {
    return {
      signAndSendTransaction: (...args) =>
        this._signAndSendTransaction(...args),
      signTransaction: (...args) => this._signTransaction(...args),
      signMessage: (...args) => this._signMessage(...args),
    };
  }

  constructor(publicKey: Bytes, chain: BackpackSolanaWalletChain) {
    this._publicKey = publicKey;
    this._chain = chain;
  }

  private async _signAndSendTransaction(
    input: SignAndSendTransactionInput<this>
  ): Promise<SignAndSendTransactionOutput<this>> {
    if (input.extraSigners?.length)
      throw new Error("extraSigners not implemented");
    const transactions = input.transactions.map((rawTransaction) =>
      Transaction.from(rawTransaction)
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

    return { signatures: signatures.map((signature) => decode(signature)) };
  }

  private async _signTransaction(
    input: SignTransactionInput<this>
  ): Promise<SignTransactionOutput<this>> {
    if (input.extraSigners?.length)
      throw new Error("extraSigners not implemented");
    const transactions = input.transactions.map((rawTransaction) =>
      Transaction.from(rawTransaction)
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

    return {
      signedTransactions: signedTransactions.map((transaction) =>
        transaction.serialize({ requireAllSignatures: false })
      ),
    };
  }

  private async _signMessage(
    input: SignMessageInput<this>
  ): Promise<SignMessageOutput<this>> {
    if (input.extraSigners?.length)
      throw new Error("extraSigners not implemented");

    let signedMessages: Bytes[];
    if (input.messages.length === 1) {
      const signature = await window.backpack.signMessage(input.messages[0]);
      // FIXME: declining sig or being unable to sign should throw an error instead of returning null
      if (!signature) throw new Error("signMessage returned nothing");
      signedMessages = [concatBytes(input.messages[0], signature)];
    } else if (input.messages.length > 1) {
      throw new Error("signAllMessages not implemented");
    } else {
      signedMessages = [];
    }

    return { signedMessages };
  }
}

export class BackpackSolanaWallet
  implements Wallet<BackpackSolanaWalletAccount>
{
  private _listeners: { [E in WalletEventNames]?: WalletEvents[E][] } = {};
  private _account: BackpackSolanaWalletAccount | undefined;

  get version() {
    return "1.0.0";
  }

  get name() {
    return "Backpack";
  }

  get icon() {
    return icon;
  }

  get accounts() {
    return this._account ? [this._account] : [];
  }

  get chains() {
    return this._account ? [this._account.chain] : [];
  }

  get methods() {
    return [
      "signAndSendTransaction" as const,
      "signTransaction" as const,
      "signMessage" as const,
    ];
  }

  get ciphers() {
    return [];
  }

  constructor() {
    window.backpack.on("connect", () => this._connect());
    window.backpack.on("disconnect", () => this._disconnect());
    window.backpack.on("connectionDidChange", () => this._reconnect());

    this._connect();
  }

  async connect<
    Chain extends BackpackSolanaWalletAccount["chain"],
    MethodNames extends WalletAccountMethodNames<BackpackSolanaWalletAccount>,
    Input extends ConnectInput<BackpackSolanaWalletAccount, Chain, MethodNames>
  >({
    chains,
    addresses,
    methods,
    silent,
  }: Input): Promise<
    ConnectOutput<BackpackSolanaWalletAccount, Chain, MethodNames, Input>
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

  on<E extends WalletEventNames>(
    event: E,
    listener: WalletEvents[E]
  ): () => void {
    this._listeners[event]?.push(listener) ||
      (this._listeners[event] = [listener]);
    return (): void => this._off(event, listener);
  }

  private _emit<E extends WalletEventNames>(event: E): void {
    this._listeners[event]?.forEach((listener) => listener());
  }

  private _off<E extends WalletEventNames>(
    event: E,
    listener: WalletEvents[E]
  ): void {
    this._listeners[event] = this._listeners[event]?.filter(
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

      const account = this._account;
      if (
        !account ||
        account.chain !== chain ||
        !bytesEqual(account.publicKey, publicKey)
      ) {
        this._account = new BackpackSolanaWalletAccount(publicKey, chain);
        this._emit("accountsChanged");
        this._emit("chainsChanged");
      }
    }
  }

  private _disconnect(): void {
    if (this._account) {
      this._account = undefined;
      this._emit("accountsChanged");
      this._emit("chainsChanged");
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
