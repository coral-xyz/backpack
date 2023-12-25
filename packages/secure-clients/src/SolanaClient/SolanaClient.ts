import type { Wallet as AnchorWallet } from "@coral-xyz/anchor";
import { AnchorProvider } from "@coral-xyz/anchor";
import { BACKEND_API_URL, Blockchain, isMobile } from "@coral-xyz/common";
import {
  getBlockchainConfig,
  safeClientResponse,
  SVMClient,
  UserClient,
} from "@coral-xyz/secure-background/clients";
import type {
  BlockchainConfig,
  SecureEvent,
  TransportSender,
} from "@coral-xyz/secure-background/types";
import type { ConcurrentMerkleTreeAccount } from "@solana/spl-account-compression";
import type {
  Commitment,
  ConfirmOptions,
  Connection,
  Finality,
  ParsedAccountData,
  SendOptions,
  Signer,
  SimulatedTransactionResponse,
  SimulateTransactionConfig,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import { Keypair, PublicKey } from "@solana/web3.js";
import { decode, encode } from "bs58";

import type { BackpackAssetId, BackpackEntity } from "../BlockchainClientBase";
import { BlockchainClientBase } from "../BlockchainClientBase";

import type { SolanaContext } from "./solana";
import {
  confirmTransaction,
  deserializeTransaction,
  getTokenRegistry,
  isCardinalWrappedToken,
  isCreatorStandardToken,
  isOpenCreatorProtocol,
  isProgrammableNftToken,
  isVersionedTransaction,
  SOL_NATIVE_MINT,
  Solana,
  TokenInterface,
} from "./solana";

export type SolanaAssetKind =
  | "cardinal-wrapped"
  | "compressed"
  | "programmable"
  | "token";

export type SolanaAssetData = CompressedData;
type CompressedData = {
  tree?: ConcurrentMerkleTreeAccount;
  assetProof?: GetAssetProofResponse;
};

export class SolanaClient extends BlockchainClientBase<Blockchain.SOLANA> {
  // Do NOT delete this.
  public static config: BlockchainConfig = getBlockchainConfig(
    Blockchain.SOLANA
  );

  private secureSvmClient: SVMClient;
  private secureUserClient: UserClient;
  public connection: Connection;
  public wallet: BackpackSolanaWallet;
  private anchorProvider: AnchorProvider;
  private tokenInterface: TokenInterface;
  private recentBlockhash?: {
    blockhash: string;
    ts: number;
  };

  constructor(client: TransportSender, connection: Connection) {
    super();
    this.secureSvmClient = new SVMClient(client);
    this.secureUserClient = new UserClient(client);
    this.connection = connection;
    this.wallet = new BackpackSolanaWallet(
      this.secureSvmClient,
      this.connection
    );
    // Do NOT delete this.
    this.config = getBlockchainConfig(Blockchain.SOLANA);

    const dummyWallet = Keypair.generate() as unknown as AnchorWallet;

    this.anchorProvider = new AnchorProvider(connection, dummyWallet, {
      skipPreflight: false,
      commitment: connection.commitment,
      preflightCommitment: connection.commitment,
    });
    this.tokenInterface = new TokenInterface(this.anchorProvider);
  }

  // Return cached blockhash if recent enough, otherwise request and cache blockhash
  public async getBlockhash(): Promise<string> {
    if (
      this.recentBlockhash &&
      this.recentBlockhash?.ts > Date.now() - 5 * 1000 // TODO: when should this stale out?
    ) {
      return this.recentBlockhash.blockhash;
    }

    const { blockhash } = await this.connection.getLatestBlockhash();
    this.recentBlockhash = {
      blockhash,
      ts: Date.now(),
    };

    return blockhash;
  }

  public async backpackGetAccounts() {
    return this.secureUserClient.getAllUsersWithAccounts();
  }

  public async previewPublicKeys(
    derivationPaths: string[],
    mnemonic?: true | string
  ): Promise<
    {
      blockchain: Blockchain;
      publicKey: string;
      derivationPath: string;
    }[]
  > {
    const response = await safeClientResponse(
      this.secureSvmClient.previewPublicKeys({
        blockchain: Blockchain.SOLANA,
        derivationPaths,
        mnemonic,
      })
    );
    return response.walletDescriptors;
  }

  public async transferAsset(
    req: {
      assetId: BackpackAssetId;
      from: BackpackEntity;
      to: BackpackEntity;
      amount: string;
      kind?: SolanaAssetKind;
      data?: SolanaAssetData;
    },
    uiOptions?: SecureEvent["uiOptions"]
  ): Promise<string> {
    const { token, mintInfo } = JSON.parse(req.assetId);
    const { from, to, amount } = req;

    const assetId = token.id;

    const solanaCtx: SolanaContext = {
      walletPublicKey: new PublicKey(from.publicKey),
      tokenInterface: this.tokenInterface,
      commitment: this.connection.commitment ?? "confirmed",
      connection: this.connection,
      solanaClient: this,
      registry: undefined,
      backgroundClient: undefined,
      blockhash: await this.getBlockhash(),
    };

    let txSig: string;

    ////////////////////////////////////////////////////////////////////////////
    //
    // Fast path.
    //
    // If the caller tells us the type of asset, then take the fast path.
    //
    ////////////////////////////////////////////////////////////////////////////
    try {
      switch (req.kind) {
        case "token": {
          if (token.mint === SOL_NATIVE_MINT.toString()) {
            txSig = await Solana.transferSol(
              solanaCtx,
              {
                source: new PublicKey(from.publicKey),
                destination: new PublicKey(to.publicKey),
                amount: Number(amount),
              },
              to
            );
          } else {
            txSig = await Solana.transferToken(
              solanaCtx,
              {
                assetId,
                destination: new PublicKey(to.publicKey),
                mint: new PublicKey(token.mint!),
                programId: new PublicKey(mintInfo.programId!),
                amount: Number(amount),
                decimals: token.decimals,
              },
              to,
              // Note: Not sure if the registry is currently needed on extension.
              //       Might be able to remove but keeping here to not regress.
              isMobile() ? undefined : await getTokenRegistry()
            );
          }
          break;
        }

        case "cardinal-wrapped": {
          txSig = await Solana.transferCardinalManagedToken(
            solanaCtx,
            {
              assetId,
              destination: new PublicKey(to.publicKey),
              mint: new PublicKey(token.mint!),
              programId: new PublicKey(mintInfo.programId!),
              amount: Number(amount),
              decimals: token.decimals,
            },
            to
          );
          break;
        }

        case "compressed": {
          if (!req.data?.assetProof || !req.data?.tree) {
            throw new Error(
              "asset merkle tree or proof not provided when using compression fast detection"
            );
          }

          const proof = req.data.assetProof.proof;
          const root = req.data.assetProof.root;
          const tree = req.data.tree;
          txSig = await Solana.transferCompressedNft(
            solanaCtx,
            {
              assetId,
              mint: new PublicKey(token.mint),
              creatorHash: token.compressionData.creatorHash,
              dataHash: token.compressionData.dataHash,
              leafId: token.compressionData.leaf,
              merkleTree: new PublicKey(token.compressionData.tree),
              recipient: new PublicKey(to.publicKey),
              root,
              proof,
              tree,
            },
            to
          );
          break;
        }

        case "programmable": {
          txSig = await Solana.transferProgrammableNft(
            solanaCtx,
            {
              assetId,
              destination: new PublicKey(to.publicKey),
              mint: new PublicKey(token.mint!),
              programId: new PublicKey(mintInfo.programId!),
              amount: Number(amount),
              decimals: token.decimals,
              source: new PublicKey(token.token),
            },
            to
          );
          break;
        }

        default: {
          ////////////////////////////////////////////////////////////////////////////
          //
          // Slow path. Infer asset type.
          //
          // We don't know the asset type, so we need to infer it.
          //
          ////////////////////////////////////////////////////////////////////////////
          const mintId = new PublicKey(token.mint?.toString() as string);
          if (token.mint === SOL_NATIVE_MINT.toString()) {
            txSig = await Solana.transferSol(
              solanaCtx,
              {
                source: new PublicKey(from.publicKey),
                destination: new PublicKey(to.publicKey),
                amount: Number(amount),
              },
              to
            );
          } else if (token.compressed && token.compressionData) {
            const proofData = await getAssetProof(token.mint);
            txSig = await Solana.transferCompressedNft(
              solanaCtx,
              {
                assetId,
                mint: new PublicKey(token.mint),
                creatorHash: token.compressionData.creatorHash,
                dataHash: token.compressionData.dataHash,
                leafId: token.compressionData.leaf,
                merkleTree: new PublicKey(token.compressionData.tree),
                proof: proofData.proof,
                recipient: new PublicKey(to.publicKey),
                root: proofData.root,
              },
              to
            );
          } else if (
            await isProgrammableNftToken(
              this.connection,
              token.mint?.toString() as string
            )
          ) {
            txSig = await Solana.transferProgrammableNft(
              solanaCtx,
              {
                assetId,
                destination: new PublicKey(to.publicKey),
                mint: new PublicKey(token.mint!),
                programId: new PublicKey(mintInfo.programId!),
                amount: Number(amount),
                decimals: token.decimals,
                source: new PublicKey(token.token),
              },
              to
            );
          }
          // Use an else here to avoid an extra request if we are transferring sol native mints.
          else {
            const ocpMintState = await isOpenCreatorProtocol(
              this.connection,
              mintId,
              mintInfo
            );
            if (ocpMintState !== null) {
              txSig = await Solana.transferOpenCreatorProtocol(
                solanaCtx,
                {
                  assetId,
                  destination: new PublicKey(to.publicKey),
                  amount: Number(amount),
                  mint: new PublicKey(token.mint!),
                  programId: new PublicKey(mintInfo.programId!),
                },
                ocpMintState,
                to
              );
            } else if (isCreatorStandardToken(mintId, mintInfo)) {
              txSig = await Solana.transferCreatorStandardToken(
                solanaCtx,
                {
                  assetId,
                  destination: new PublicKey(to.publicKey),
                  mint: new PublicKey(token.mint!),
                  programId: new PublicKey(mintInfo.programId!),
                  amount: Number(amount),
                  decimals: token.decimals,
                },
                to
              );
            } else if (
              await isCardinalWrappedToken(this.connection, mintId, mintInfo)
            ) {
              txSig = await Solana.transferCardinalManagedToken(
                solanaCtx,
                {
                  assetId,
                  destination: new PublicKey(to.publicKey),
                  mint: new PublicKey(token.mint!),
                  programId: new PublicKey(mintInfo.programId!),
                  amount: Number(amount),
                  decimals: token.decimals,
                },
                to
              );
            } else {
              txSig = await Solana.transferToken(
                solanaCtx,
                {
                  assetId,
                  destination: new PublicKey(to.publicKey),
                  mint: new PublicKey(token.mint!),
                  programId: new PublicKey(mintInfo.programId!),
                  amount: Number(amount),
                  decimals: token.decimals,
                },
                to,
                isMobile() ? undefined : await getTokenRegistry()
              );
            }
          }
        }
      }
    } catch (err: any) {
      throw err instanceof Error
        ? err
        : new Error(err.message ?? `Solana Send Asset Failed`);
    }

    return txSig;
  }

  public async burnAsset(
    req: {
      assetId: BackpackAssetId;
      from: BackpackEntity;
      amount?: string;
      data?: SolanaAssetData;
    },
    uiOptions?: SecureEvent["uiOptions"]
  ): Promise<string> {
    const { from, assetId, amount } = req;

    const solanaCtx: SolanaContext = {
      walletPublicKey: new PublicKey(from.publicKey),
      tokenInterface: this.tokenInterface,
      commitment: this.connection.commitment ?? "confirmed",
      connection: this.connection,
      solanaClient: this,
      registry: undefined,
      backgroundClient: undefined,
      blockhash: await this.getBlockhash(),
    };

    const gqlAssetId = assetId;
    const nft = await getAssetById(gqlAssetId);

    let amountInt = amount ? parseInt(amount) : 1;
    let programId: null | PublicKey = null;

    if (!nft.compressed && nft.token !== "") {
      const accountInfo = await solanaCtx.connection.getParsedAccountInfo(
        new PublicKey(nft.token)
      );
      if (accountInfo.value === null) {
        throw new Error("NFT account not found");
      }
      programId = accountInfo.value.owner;
      const data = accountInfo.value.data;
      if ((data as ParsedAccountData).parsed === null) {
        throw new Error("NFT account not a token account");
      }
      amountInt = parseInt(
        (data as ParsedAccountData).parsed.info.tokenAmount.amount
      );
    }

    const asset = {
      id: gqlAssetId,
      mint: nft.address,
      programId: programId?.toString() ?? "",
      source: nft.token,
      amount: amountInt.toString(),
      compressed: nft.compressed,
      compressionData: nft.compressionData,
    };

    if (asset.compressed && asset.compressionData) {
      const proofData =
        req.data?.assetProof ?? (await getAssetProof(nft.address));

      return await Solana.burnCompressedNft(solanaCtx, {
        assetId: gqlAssetId,
        mint: new PublicKey(nft.address),
        creatorHash: asset.compressionData.creatorHash,
        dataHash: asset.compressionData.dataHash,
        leafId: asset.compressionData.leaf,
        merkleTree: new PublicKey(asset.compressionData.tree),
        proof: proofData.proof,
        root: proofData.root,
        tree: req.data?.tree,
      });
    }

    return await Solana.burnAndCloseNft(solanaCtx, {
      assetId: gqlAssetId,
      solDestination: solanaCtx.walletPublicKey,
      mint: new PublicKey(asset.mint),
      programId: new PublicKey(asset.programId),
      source: asset.source ? new PublicKey(asset.source) : undefined,
      amount: parseInt(asset.amount),
    });
  }

  public confirmTransaction(tx: string): Promise<true> {
    return this.wallet.confirmTransaction(tx, "confirmed").then(() => true);
  }
}

class BackpackSolanaWallet {
  private secureSvmClient: SVMClient;
  private connection: Connection;

  constructor(svmClient: SVMClient, connection: Connection) {
    this.secureSvmClient = svmClient;
    this.connection = connection;
  }

  public async connect({ blockchain }: { blockchain: Blockchain }): Promise<{
    publicKey: string;
    connectionUrl: string;
  }> {
    const connected = await this.secureSvmClient.connect({ blockchain });

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
    },
    uiOptions?: SecureEvent<"SECURE_SVM_SIGN_TX">["uiOptions"]
  ): Promise<T> {
    const tx = request.tx;
    const publicKey = request.publicKey;
    const preparedTx = await this.prepareTransaction(request);
    const txStr = encode(preparedTx.serialize({ requireAllSignatures: false }));

    const signature = await this.secureSvmClient.signTransaction(
      {
        publicKey: publicKey.toBase58(),
        tx: txStr,
        uuid: request.uuid,
      },
      { uiOptions }
    );

    if (
      !signature.response?.signature ||
      !signature.response?.transactionEncoding
    ) {
      throw signature.error;
    }

    const finalTx = deserializeTransaction(
      signature.response.transactionEncoding
    );

    finalTx.addSignature(
      publicKey,
      decode(signature.response.signature) as Buffer
    );

    return finalTx as T;
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
    });

    if (!signatures.response?.signatures) {
      throw signatures.error;
    }

    const txs = signatures.response.signatures.map(
      ({ signature, transactionEncoding }, i) => {
        const tx = deserializeTransaction(transactionEncoding);
        tx.addSignature(publicKey, decode(signature) as Buffer);
        return tx;
      }
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
              addresses: [publicKey.toString()],
            },
          } as SimulateTransactionConfig)
        : undefined;

    const response = await (isVersionedTransaction(preparedTx)
      ? connection.simulateTransaction(preparedTx, signersOrConf)
      : this.connection.simulateTransaction(preparedTx, undefined, [
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

type GetAssetProofResponse = {
  id: string;
  proof: string[];
  root: string;
};

export async function getAssetProof(
  assetId: string
): Promise<GetAssetProofResponse> {
  const resp = await fetch(`${BACKEND_API_URL}/v2/graphql`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        query GetAssetProofForNft($assetId: String!) {
          assetProof(assetId: $assetId) {
            id
            proof
            root
          }
        }
      `,
      variables: {
        assetId,
      },
      operationName: "GetAssetProofForNft",
    }),
  });

  const json = await resp.json();
  return json.data.assetProof;
}

type GetAssetResponse = {
  address: string;
  token: string;
  compressed: boolean;
  compressionData: {
    creatorHash: string;
    dataHash: string;
    id: string;
    leaf: number;
    tree: string;
  };
};

async function getAssetById(assetId: string): Promise<GetAssetResponse> {
  const resp = await fetch(`${BACKEND_API_URL}/v2/graphql`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        query GetAssetForId($assetId: ID!) {
          node(id: $assetId) {
            ... on Nft {
              address
              token
              compressed
              compressionData {
                creatorHash
                dataHash
                id
                leaf
                tree
              }
            }
          }
        }
      `,
      variables: {
        assetId,
      },
      operationName: "GetAssetForId",
    }),
  });

  const json = await resp.json();
  return json.data.node;
}
