import { isVersionedTransaction } from "@coral-xyz/common";
import { SVMClient, UserClient } from "@coral-xyz/secure-background/clients";
import type {
  SecureEvent,
  TransportSender,
} from "@coral-xyz/secure-background/types";
import type {
  Connection,
  PublicKey,
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

  public async signMessage(
    request: {
      publicKey: PublicKey;
      message: Uint8Array;
    },
    confirmOptions?: SecureEvent<"SECURE_SVM_SIGN_MESSAGE">["confirmOptions"]
  ): Promise<Uint8Array | null> {
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

  public async signTransaction<T extends Transaction | VersionedTransaction>(
    request: {
      publicKey: PublicKey;
      tx: T;
    },
    confirmOptions?: SecureEvent<"SECURE_SVM_SIGN_MESSAGE">["confirmOptions"]
  ): Promise<T> {
    const tx = request.tx;
    const publicKey = request.publicKey;

    const versioned = isVersionedTransaction(tx);
    if (!versioned) {
      if (!tx.feePayer) {
        tx.feePayer = publicKey;
      }
      if (!tx.recentBlockhash) {
        const { blockhash } = await this.connection.getLatestBlockhash();
        tx.recentBlockhash = blockhash;
      }
    }
    const txStr = encode(tx.serialize({ requireAllSignatures: false }));

    // const signature = await this.secureSvmClient.signTransaction({
    //   publicKey: publicKey.toBase58(),
    //   tx: txStr,
    // }, confirmOptions);

    // tx.addSignature(publicKey, decode(signature));

    return tx;
  }
}
