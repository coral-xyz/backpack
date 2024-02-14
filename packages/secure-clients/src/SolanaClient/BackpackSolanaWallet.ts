import { Blockchain } from "@coral-xyz/common";
import type { SVMClient } from "@coral-xyz/secure-background/clients";
import type { SecureEvent } from "@coral-xyz/secure-background/types";
import type {
  Commitment,
  ConfirmOptions,
  Connection,
  Finality,
  SendOptions,
  Signer,
  SimulatedTransactionResponse,
  SimulateTransactionConfig,
} from "@solana/web3.js";
import {
  Keypair,
  ParsedAccountData,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import { decode, encode } from "bs58";

import { confirmTransaction } from "./utils/confirmTransaction";
import {
  deserializeLegacyTransaction,
  deserializeTransaction,
  isVersionedTransaction,
} from "./utils/transaction-helpers";
import { SolanaSignInInput, SolanaSignInOutput } from "@solana/wallet-standard-features"

export class BackpackSolanaWallet {
  private secureSvmClient: SVMClient;
  private connection: Connection;

  constructor(svmClient: SVMClient, connection: Connection) {
    this.secureSvmClient = svmClient;
    this.connection = connection;
  }

  public async connect({
    blockchain,
    silent,
  }: {
    blockchain: Blockchain;
    silent?: boolean;
  }): Promise<{
    publicKey: string;
    connectionUrl: string;
  }> {
    const connected = await this.secureSvmClient.connect({
      blockchain,
      silent,
    });

    if (!connected.response) {
      throw connected.error;
    }

    return connected.response;
  }

  public async disconnect(): Promise<{
    disconnected: true;
  }> {
    const connected = await this.secureSvmClient.disconnect();

    if (!connected.response) {
      throw connected.error;
    }

    return connected.response;
  }

  async prepareSolanaOffchainMessage({
    message,
    encoding = "UTF-8",
    maxLength = 1212,
  }: {
    message: Uint8Array;
    encoding: "ASCII" | "UTF-8";
    maxLength: 1212 | 65515;
  }): Promise<Uint8Array> {
    // https://github.com/solana-labs/solana/blob/e80f67dd58b7fa3901168055211f346164efa43a/docs/src/proposals/off-chain-message-signing.md

    if (message.length > maxLength) {
      throw new Error(`Max message length (${maxLength}) exeeded!`);
    }
    const firstByte = new Uint8Array([255]);
    const domain8Bit = Uint8Array.from("solana offchain", (x) =>
      x.charCodeAt(0)
    );
    const headerVersion8Bit = new Uint8Array([0]);
    const headerFormat8Bit =
      encoding === "ASCII"
        ? new Uint8Array([0])
        : maxLength === 1212
          ? new Uint8Array([1])
          : new Uint8Array([2]);

    const headerLength16Bit = new Uint16Array([message.length]);
    const headerLength8Bit = new Uint8Array(
      headerLength16Bit.buffer,
      headerLength16Bit.byteOffset,
      headerLength16Bit.byteLength
    );

    const payload = new Uint8Array([
      ...firstByte,
      ...domain8Bit,
      ...headerVersion8Bit,
      ...headerFormat8Bit,
      ...headerLength8Bit,
      ...message,
    ]);

    return payload;
  }

  public async signMessage(
    request: {
      publicKey: PublicKey;
      message: Uint8Array;
      uuid?: string;
    }
    // uiOptions?: SecureEvent<"SECURE_SVM_SIGN_MESSAGE">["uiOptions"]
  ): Promise<Uint8Array> {
    const svmResponse = await this.secureSvmClient.signMessage({
      publicKey: request.publicKey.toBase58(),
      message: encode(request.message),
      uuid: request.uuid,
    });
    if (!svmResponse.response) {
      throw svmResponse.error;
    }
    return decode(svmResponse.response.signedMessage);
  }

  public async signIn(
    input?: SolanaSignInInput
  ): Promise<{
    signedMessage: string;
    signature: string;
    publicKey: string;
    connectionUrl: string;
  }> {
    const svmResponse = await this.secureSvmClient.signIn({
      blockchain: Blockchain.SOLANA,
      input
    });
    if (!svmResponse.response) {
      throw svmResponse.error;
    }
    return svmResponse.response;
  }

  private async prepareTransaction<
    T extends Transaction | VersionedTransaction
  >(request: {
    publicKey: PublicKey;
    tx: T;
    signers?: Signer[];
    commitment?: Commitment;
    customConnection?: Connection;
  }): Promise<T> {
    const tx = request.tx;
    const publicKey = request.publicKey;
    const signers = request.signers;
    const connection = request.customConnection ?? this.connection;
    const commitment = request.commitment;

    if (!isVersionedTransaction(tx)) {
      if (signers) {
        signers.forEach((s: Signer) => {
          tx.partialSign(s);
        });
      }
      if (!tx.feePayer) {
        tx.feePayer = publicKey;
      }
      if (!tx.recentBlockhash) {
        const { blockhash } = await connection.getLatestBlockhash(commitment);
        tx.recentBlockhash = blockhash;
      }
    } else {
      if (signers) {
        tx.sign(signers);
      }
    }
    return tx;
  }

  public async signTransaction<T extends Transaction | VersionedTransaction>(
    request: {
      publicKey: PublicKey;
      tx: T;
      signers?: Signer[];
      customConnection?: Connection;
      commitment?: Commitment;
      uuid?: string;
      disableTxMutation?: boolean;
    },
    uiOptions?: SecureEvent<"SECURE_SVM_SIGN_TX">["uiOptions"]
  ): Promise<T> {
    const publicKey = request.publicKey;
    const preparedTx = await this.prepareTransaction(request);
    const txStr = encode(preparedTx.serialize({ requireAllSignatures: false }));

    const signature = await this.secureSvmClient.signTransaction(
      {
        publicKey: publicKey.toBase58(),
        tx: txStr,
        uuid: request.uuid,
        disableTxMutation: request.disableTxMutation,
      },
      { uiOptions }
    );

    if (!signature.response?.signature || !signature.response?.signedTx) {
      throw signature.error;
    }

    return (
      isVersionedTransaction(request.tx)
        ? VersionedTransaction.deserialize(decode(signature.response.signedTx))
        : Transaction.from(decode(signature.response.signedTx))
    ) as T;
  }

  public async signAllTransactions<
    T extends Transaction | VersionedTransaction
  >(
    request: {
      publicKey: PublicKey;
      txs: T[];
      signers?: Signer[];
      customConnection?: Connection;
      commitment?: Commitment;
      uuid?: string;
      disableTxMutation?: boolean;
    },
    _uiOptions?: SecureEvent<"SECURE_SVM_SIGN_MESSAGE">["uiOptions"]
  ): Promise<T[]> {
    const publicKey = request.publicKey;

    const txStrs = await Promise.all(
      request.txs.map(async (tx) => {
        const preparedTx = await this.prepareTransaction({
          publicKey: request.publicKey,
          tx,
          signers: request.signers,
          customConnection: request.customConnection,
          commitment: request.commitment,
        });
        return encode(preparedTx.serialize({ requireAllSignatures: false }));
      })
    );

    const signatures = await this.secureSvmClient.signAllTransactions({
      publicKey: publicKey.toBase58(),
      txs: txStrs,
      uuid: request.uuid,
      disableTxMutation: request.disableTxMutation,
    });

    if (!signatures.response?.signatures) {
      throw signatures.error;
    }

    const txs = signatures.response.signatures.map(({ signedTx }, i) =>
      isVersionedTransaction(request.txs[i])
        ? VersionedTransaction.deserialize(decode(signedTx))
        : Transaction.from(decode(signedTx))
    );

    return txs as T[];
  }

  public async send<T extends Transaction | VersionedTransaction>(
    request: {
      publicKey: PublicKey;
      tx: T;
      customConnection?: Connection;
      signers?: Signer[];
      options?: SendOptions | ConfirmOptions;
      uuid?: string;
    },
    uiOptions?: SecureEvent<"SECURE_SVM_SIGN_TX">["uiOptions"]
  ): Promise<string> {
    const tx = request.tx;
    const signers = request.signers;
    const publicKey = request.publicKey;
    const options = request.options;
    const connection = request.customConnection ?? this.connection;
    const uuid = request.uuid;
    const commitment =
      options && "commitment" in options ? options.commitment : undefined;

    const signedTx = await this.signTransaction(
      {
        tx,
        signers,
        publicKey,
        customConnection: request.customConnection,
        commitment,
        uuid,
      },
      uiOptions
    );
    const serializedTransaction = signedTx.serialize();

    return connection.sendRawTransaction(serializedTransaction, options);
  }

  public async sendAndConfirm<T extends Transaction | VersionedTransaction>(
    request: {
      publicKey: PublicKey;
      tx: T;
      customConnection?: Connection;
      signers?: Signer[];
      options?: SendOptions | ConfirmOptions;
      uuid?: string;
    },
    uiOptions?: SecureEvent<"SECURE_SVM_SIGN_TX">["uiOptions"]
  ): Promise<string> {
    const options = request.options;
    const commitment =
      options && "commitment" in options ? options.commitment : undefined;
    const finality = commitment === "finalized" ? "finalized" : "confirmed";

    const signature = await this.send(
      {
        ...request,
        options: {
          commitment: "confirmed",
          preflightCommitment: "confirmed",
          ...request.options,
        },
      },
      uiOptions
    );
    await confirmTransaction(this.connection, signature, finality);
    return signature;
  }

  public async simulate<T extends Transaction | VersionedTransaction>(request: {
    publicKey: PublicKey;
    tx: T;
    customConnection?: Connection;
    signers?: Signer[];
    options?: SendOptions | ConfirmOptions;
    uuid?: string;
    includedAccounts?: string[];
  }): Promise<SimulatedTransactionResponse> {
    const tx = request.tx;
    const connection = request.customConnection ?? this.connection;
    const publicKey = request.publicKey;
    const options = request.options;
    const commitment =
      options && "commitment" in options ? options.commitment : undefined;

    const preparedTx = await this.prepareTransaction({
      ...request,
      commitment,
    });

    const signersOrConf =
      "message" in tx
        ? ({
          accounts: {
            encoding: "base64",
            addresses: [
              ...(request.includedAccounts ?? []),
              publicKey.toString(),
            ],
          },
        } as SimulateTransactionConfig)
        : undefined;

    const response = await (isVersionedTransaction(preparedTx)
      ? connection.simulateTransaction(preparedTx, signersOrConf)
      : this.connection.simulateTransaction(preparedTx, undefined, [
        ...(request.includedAccounts?.map((p) => new PublicKey(p)) ?? []),
        publicKey,
      ]));

    return response.value;
  }

  public async confirmTransaction(
    signature: string,
    finality: Finality = "confirmed"
  ) {
    return confirmTransaction(this.connection, signature, finality);
  }
}
