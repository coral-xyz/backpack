import {
  deserializeLegacyTransaction,
  deserializeTransaction,
  isVersionedTransaction,
} from "@coral-xyz/common";
import { SVMClient, UserClient } from "@coral-xyz/secure-background/clients";
import type {
  SecureEvent,
  TransportSender,
} from "@coral-xyz/secure-background/types";
import type {
  ConfirmOptions,
  Connection,
  PublicKey,
  SendOptions,
  Signer,
  SimulateTransactionConfig,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import { decode, encode } from "bs58";

export class SolanaClient {
  private secureSvmClient: SVMClient;
  private secureUserClient: UserClient;
  private connection: Connection;

  constructor(client: TransportSender, connection: Connection) {
    this.secureSvmClient = new SVMClient(client);
    this.secureUserClient = new UserClient(client);
    this.connection = connection;
  }

  public async connect(): Promise<{
    publicKey: string;
    connectionUrl: string;
  }> {
    const connected = await this.secureSvmClient.connect();

    if (!connected.response) {
      throw new Error(connected.error);
    }

    return connected.response;
  }

  public async disconnect(): Promise<{
    disconnected: true;
  }> {
    const connected = await this.secureSvmClient.disconnect();

    if (!connected.response) {
      throw new Error(connected.error);
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
    },
    uiOptions?: SecureEvent<"SECURE_SVM_SIGN_MESSAGE">["uiOptions"]
  ): Promise<Uint8Array> {
    const svmResponse = await this.secureSvmClient.signMessage(
      {
        publicKey: request.publicKey.toBase58(),
        message: encode(request.message),
      },
      uiOptions
    );
    if (!svmResponse.response) {
      throw new Error(svmResponse.error);
    }
    return decode(svmResponse.response.singedMessage);
  }

  private async prepareTransaction<
    T extends Transaction | VersionedTransaction
  >(request: {
    publicKey: PublicKey;
    tx: T;
    signers?: Signer[];
    customConnection?: Connection;
  }): Promise<T> {
    const tx = request.tx;
    const publicKey = request.publicKey;
    const signers = request.signers;
    const connection = request.customConnection ?? this.connection;

    const versioned = isVersionedTransaction(tx);
    if (!versioned) {
      if (signers) {
        signers.forEach((s: Signer) => {
          tx.partialSign(s);
        });
      }
      if (!tx.feePayer) {
        tx.feePayer = publicKey;
      }
      if (!tx.recentBlockhash) {
        const { blockhash } = await connection.getLatestBlockhash();
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
    },
    uiOptions?: SecureEvent<"SECURE_SVM_SIGN_MESSAGE">["uiOptions"]
  ): Promise<T> {
    const tx = request.tx;
    const publicKey = request.publicKey;
    const preparedTx = await this.prepareTransaction(request);
    const txStr = encode(preparedTx.serialize({ requireAllSignatures: false }));

    const signature = await this.secureSvmClient.signTransaction(
      {
        publicKey: publicKey.toBase58(),
        tx: txStr,
      },
      uiOptions
    );

    if (!signature.response?.signature) {
      throw new Error(signature.error);
    }
    tx.addSignature(publicKey, decode(signature.response.signature));

    return tx;
  }

  public async signAllTransactions<
    T extends Transaction | VersionedTransaction
  >(
    request: {
      publicKey: PublicKey;
      txs: T[];
      signers?: Signer[];
      customConnection?: Connection;
    },
    uiOptions?: SecureEvent<"SECURE_SVM_SIGN_MESSAGE">["uiOptions"]
  ): Promise<T[]> {
    const publicKey = request.publicKey;

    const txStrs = await Promise.all(
      request.txs.map(async (tx) => {
        const preparedTx = await this.prepareTransaction({
          publicKey: request.publicKey,
          tx,
          signers: request.signers,
          customConnection: request.customConnection,
        });
        return encode(preparedTx.serialize({ requireAllSignatures: false }));
      })
    );

    const signatures = await this.secureSvmClient.signAllTransactions(
      {
        publicKey: publicKey.toBase58(),
        txs: txStrs,
      },
      uiOptions
    );

    if (!signatures.response?.signatures) {
      throw new Error(signatures.error);
    }

    const txs = signatures.response.signatures.map((signature, i) => {
      const tx = request.txs[i];
      tx.addSignature(publicKey, decode(signature));
      return tx;
    });

    return txs;
  }

  public async send<T extends Transaction | VersionedTransaction>(
    request: {
      publicKey: PublicKey;
      tx: T;
      customConnection?: Connection;
      signers?: Signer[];
      options?: SendOptions | ConfirmOptions;
    },
    uiOptions?: SecureEvent<"SECURE_SVM_SIGN_MESSAGE">["uiOptions"]
  ): Promise<string> {
    const tx = request.tx;
    const signers = request.signers;
    const publicKey = request.publicKey;
    const options = request.options;
    const connection = request.customConnection ?? this.connection;

    const signedTx = await this.signTransaction(
      {
        tx,
        signers,
        publicKey,
        customConnection: request.customConnection,
      },
      uiOptions
    );
    const serializedTransaction = signedTx.serialize();

    return await connection.sendRawTransaction(serializedTransaction, options);
    // return await connection.sendRawTransaction(new Uint8Array(signedTx.serialize()), options);
  }

  public async sendAndConfirm<T extends Transaction | VersionedTransaction>(
    request: {
      publicKey: PublicKey;
      tx: T;
      customConnection?: Connection;
      signers?: Signer[];
      options?: SendOptions | ConfirmOptions;
    },
    uiOptions?: SecureEvent<"SECURE_SVM_SIGN_MESSAGE">["uiOptions"]
  ): Promise<string> {
    return this.send(
      {
        ...request,
        options: {
          ...request.options,
          commitment: "confirmed",
        },
      },
      uiOptions
    );
  }

  public async simulate<T extends Transaction | VersionedTransaction>(request: {
    publicKey: PublicKey;
    tx: T;
    customConnection?: Connection;
    signers?: Signer[];
    options?: SendOptions | ConfirmOptions;
  }) {
    const tx = request.tx;
    const connection = request.customConnection ?? this.connection;
    const publicKey = request.publicKey;
    const preparedTx = await this.prepareTransaction(request);

    const signersOrConf =
      "message" in tx
        ? ({
            accounts: {
              encoding: "base64",
              addresses: [publicKey.toString()],
            },
          } as SimulateTransactionConfig)
        : undefined;

    return isVersionedTransaction(preparedTx)
      ? await connection.simulateTransaction(preparedTx, signersOrConf)
      : await this.connection.simulateTransaction(preparedTx, undefined, [
          publicKey,
        ]);
  }
}
