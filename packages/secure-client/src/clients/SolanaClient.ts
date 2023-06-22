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

  public async signMessage(
    request: {
      publicKey: PublicKey;
      message: Uint8Array;
    },
    confirmOptions?: SecureEvent<"SECURE_SVM_SIGN_MESSAGE">["confirmOptions"]
  ): Promise<Uint8Array> {
    const svmResponse = await this.secureSvmClient.signMessage(
      {
        publicKey: request.publicKey.toBase58(),
        message: encode(request.message),
      },
      confirmOptions
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
    confirmOptions?: SecureEvent<"SECURE_SVM_SIGN_MESSAGE">["confirmOptions"]
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
      confirmOptions
    );

    if (!signature.response?.signature) {
      throw new Error(signature.error);
    }
    tx.addSignature(publicKey, decode(signature.response.signature));

    return tx;
  }

  public async send<T extends Transaction | VersionedTransaction>(
    request: {
      publicKey: PublicKey;
      tx: T;
      customConnection?: Connection;
      signers?: Signer[];
      options?: SendOptions | ConfirmOptions;
    },
    confirmOptions?: SecureEvent<"SECURE_SVM_SIGN_MESSAGE">["confirmOptions"]
  ): Promise<string> {
    const tx = request.tx;
    const signers = request.signers;
    const publicKey = request.publicKey;
    const options = request.options;
    const connection = request.customConnection ?? this.connection;
    console.log("PCA NEW REQUEST", request.tx);

    const signedTx = await this.signTransaction(
      {
        tx,
        signers,
        publicKey,
        customConnection: request.customConnection,
      },
      confirmOptions
    );
    const serializedTransaction = signedTx.serialize();
    console.log("PCA NEW SERIALIZED", serializedTransaction);
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
    confirmOptions?: SecureEvent<"SECURE_SVM_SIGN_MESSAGE">["confirmOptions"]
  ): Promise<string> {
    return this.send(
      {
        ...request,
        options: {
          ...request.options,
          commitment: "confirmed",
        },
      },
      confirmOptions
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
