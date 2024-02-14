import type { Wallet as AnchorWallet } from "@coral-xyz/anchor";
import { AnchorProvider } from "@coral-xyz/anchor";
import { Blockchain } from "@coral-xyz/common";
import {
  getBlockchainConfig,
  SVMClient,
  UserClient,
} from "@coral-xyz/secure-background/clients";
import type {
  BlockchainConfig,
  SecureEvent,
  TransportSender,
} from "@coral-xyz/secure-background/types";
import type { MintState } from "@magiceden-oss/open_creator_protocol";
import { ConcurrentMerkleTreeAccount } from "@solana/spl-account-compression";
import type {
  Commitment,
  ConnectionConfig,
  ParsedAccountData,
} from "@solana/web3.js";
import { Keypair, PublicKey } from "@solana/web3.js";

import type { BackpackAssetId, BackpackEntity } from "../BlockchainClientBase";
import { BlockchainClientBase } from "../BlockchainClientBase";

import {
  isCardinalWrappedTokenFetch,
  isOpenCreatorProtocol,
  isProgrammableNftToken,
} from "./utils/send-helpers";
import type { SolanaAsset } from "./utils/SolanaAssetUtils";
import { getAssetProof, getSolanaAssetById } from "./utils/SolanaAssetUtils";
import { BackpackSolanaConnection } from "./BackpackSolanaConnection";
import { BackpackSolanaWallet } from "./BackpackSolanaWallet";
import type { SolanaContext } from "./solanaLegacy";
import { SOL_NATIVE_MINT, Solana, TokenInterface } from "./solanaLegacy";
import { SolanaStakeClient } from "./SolanaStakeClient";

type PrefetchedAsset = SolanaAsset & {
  parsedAta?: {
    programId: string;
    amount: number;
  };
  parsedMint?: {
    mintAuthority: string;
    freezeAuthority: string;
    decimals: number;
  };
  merkleTree?: ConcurrentMerkleTreeAccount;
  isCardinalWrappedToken?: boolean;
  isProgrammableNftToken?: boolean;
  isCreatorStandardToken?: boolean;
  openCreatorProtocolMintState?: MintState | null;
};

export class SolanaClient extends BlockchainClientBase<Blockchain.SOLANA> {
  // Do NOT delete this.
  public static config: BlockchainConfig = getBlockchainConfig(
    Blockchain.SOLANA
  );

  private secureSvmClient: SVMClient;
  private secureUserClient: UserClient;
  private tokenInterface: TokenInterface;
  public connection: BackpackSolanaConnection;
  public wallet: BackpackSolanaWallet;
  public Stake = new SolanaStakeClient(this.buildCtx.bind(this));

  private recentBlockhash?: {
    blockhash: string;
    ts: number;
  };

  constructor(
    client: TransportSender,
    rpcUrl: string,
    commitmentOrConfig?: Commitment | ConnectionConfig
  ) {
    super();
    this.secureSvmClient = new SVMClient(client);
    this.secureUserClient = new UserClient(client);
    this.connection = new BackpackSolanaConnection(rpcUrl, commitmentOrConfig);
    this.wallet = new BackpackSolanaWallet(
      this.secureSvmClient,
      this.connection
    );
    // Do NOT delete this.
    this.config = getBlockchainConfig(Blockchain.SOLANA);

    const dummyWallet = Keypair.generate() as unknown as AnchorWallet;

    const anchorProvider = new AnchorProvider(this.connection, dummyWallet, {
      skipPreflight: false,
      commitment: this.connection.commitment,
      preflightCommitment: this.connection.commitment,
    });
    this.tokenInterface = new TokenInterface(anchorProvider);
  }

  private async buildCtx(authority: string): Promise<SolanaContext> {
    return {
      walletPublicKey: new PublicKey(authority),
      tokenInterface: this.tokenInterface,
      commitment: this.connection.commitment ?? "confirmed",
      connection: this.connection,
      solanaClient: this,
      blockhash: await this.getBlockhash(),
    };
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

  private prefetchedAssets: {
    [assetId: string]: Promise<PrefetchedAsset>;
  } = {};

  public prefetchAsset(assetId: string) {
    void this.getBlockhash();
    this.prefetchedAssets[assetId] = Promise.resolve().then(
      async (): Promise<PrefetchedAsset> => {
        const asset: PrefetchedAsset = await getSolanaAssetById(assetId);
        if (!asset.mint || asset.mint === SOL_NATIVE_MINT.toString()) {
          return asset;
        }

        const parseAta = async (publicKey: string) => {
          const accountInfo = await this.connection.getParsedAccountInfo(
            new PublicKey(publicKey)
          );
          if (accountInfo.value === null) {
            throw new Error("Asset associated token account not found");
          }
          const data = accountInfo.value.data;
          if ((data as ParsedAccountData).parsed === null) {
            throw new Error(
              "Asset associated token account data was not parsed"
            );
          }
          const amountInt = parseInt(
            (data as ParsedAccountData).parsed.info.tokenAmount.amount
          );
          return {
            programId: accountInfo.value.owner.toBase58(),
            amount: amountInt,
          };
        };

        const parseMint = async () => {
          if (
            asset.__typename === "TokenBalance" ||
            (asset.__typename === "Nft" && !asset.compressed)
          ) {
            const accountInfo = await this.connection.getParsedAccountInfo(
              new PublicKey(asset.mint)
            );
            if (accountInfo.value === null) {
              throw new Error("Asset account not found");
            }
            const data = (accountInfo.value.data as ParsedAccountData)?.parsed;
            if (data === null) {
              throw new Error("Asset account data was not parsed");
            }
            return {
              mintAuthority: data.info.mintAuthority,
              freezeAuthority: data.info.freezeAuthority,
              decimals: data.info.decimals,
            };
          }
          return undefined;
        };

        const getMerkleTree = async (): Promise<
          ConcurrentMerkleTreeAccount | undefined
        > => {
          if (
            asset.__typename === "Nft" &&
            asset.compressed &&
            asset.compressionData?.tree
          ) {
            return ConcurrentMerkleTreeAccount.fromAccountAddress(
              this.connection,
              new PublicKey(asset.compressionData.tree),
              { commitment: this.connection.commitment ?? "confirmed" }
            );
          }
          return undefined;
        };

        const [
          proofData,
          parsedAta,
          parsedMint,
          merkleTree,
          isCardinalWrappedTokenFlag,
          isProgrammableNftTokenFlag,
          openCreatorProtocolMintState,
        ] = await Promise.all([
          getAssetProof(asset.mint),
          parseAta(
            asset.__typename === "Nft"
              ? asset.nonFungibleAta
              : asset.fungibleAta
          ).catch(() => undefined),
          parseMint().catch(() => undefined),
          getMerkleTree().catch(() => undefined),
          isCardinalWrappedTokenFetch(
            this.connection,
            new PublicKey(asset.mint)
          ).catch(() => false),
          isProgrammableNftToken(this.connection, asset.mint).catch(
            () => false
          ),
          isOpenCreatorProtocol(
            this.connection,
            new PublicKey(asset.mint)
          ).catch(() => null),
          // isCreatorStandardToken(
          //   new PublicKey(asset.mint)
          //   mintData
          // ).catch(() => false);
        ]);

        return {
          ...asset,
          ...(asset.__typename === "Nft" ? { proofData } : {}),
          parsedAta,
          parsedMint,
          merkleTree,
          isCardinalWrappedToken: isCardinalWrappedTokenFlag,
          isProgrammableNftToken: isProgrammableNftTokenFlag,
          isCreatorStandardToken: false,
          openCreatorProtocolMintState,
        };
      }
    );
  }

  private getAssetById(assetId: string): Promise<PrefetchedAsset> {
    if (!this.prefetchedAssets[assetId]) {
      this.prefetchAsset(assetId);
    }
    return this.prefetchedAssets[assetId];
  }

  public async transferAsset(req: {
    assetId: BackpackAssetId;
    from: BackpackEntity;
    to: BackpackEntity;
    amount: string;
  }): Promise<string> {
    const { from, to, amount, assetId } = req;
    const asset = await this.getAssetById(assetId);
    const solanaCtx = await this.buildCtx(from.publicKey);

    let txSig: string;

    try {
      if (!asset.mint || asset.__typename === "TokenBalance") {
        if (!asset.mint || asset.mint === SOL_NATIVE_MINT.toString()) {
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
          if (!asset.parsedAta || !asset.parsedMint) {
            throw new Error("Account data not available");
          }
          txSig = await Solana.transferToken(
            solanaCtx,
            {
              assetId,
              destination: new PublicKey(to.publicKey),
              mint: new PublicKey(asset.mint),
              programId: new PublicKey(asset.parsedAta.programId),
              amount: Number(amount),
              decimals: asset.parsedMint.decimals,
            },
            to
          );
        }
      } else if (asset.compressed && asset.compressionData) {
        if (!asset.proofData) {
          throw new Error("No Proof data found.");
        }
        txSig = await Solana.transferCompressedNft(
          solanaCtx,
          {
            assetId,
            mint: new PublicKey(asset.mint),
            creatorHash: asset.compressionData.creatorHash,
            dataHash: asset.compressionData.dataHash,
            leafId: asset.compressionData.leaf,
            merkleTree: new PublicKey(asset.compressionData.tree),
            proof: asset.proofData.proof,
            recipient: new PublicKey(to.publicKey),
            root: asset.proofData.root,
          },
          to
        );
      } else if (asset.isProgrammableNftToken) {
        if (!asset.parsedMint || !asset.parsedAta) {
          throw new Error("Account data not available");
        }
        txSig = await Solana.transferProgrammableNft(
          solanaCtx,
          {
            assetId,
            destination: new PublicKey(to.publicKey),
            mint: new PublicKey(asset.mint!),
            programId: new PublicKey(asset.parsedAta.programId),
            amount: Number(amount),
            decimals: asset.parsedMint.decimals,
            source: new PublicKey(asset.nonFungibleAta),
          },
          to
        );
      } else if (asset.openCreatorProtocolMintState) {
        if (!asset.parsedAta || !asset.parsedMint) {
          throw new Error("Account data not available");
        }
        txSig = await Solana.transferOpenCreatorProtocol(
          solanaCtx,
          {
            assetId,
            destination: new PublicKey(to.publicKey),
            amount: Number(amount),
            decimals: asset.parsedMint.decimals,
            mint: new PublicKey(asset.mint),
            programId: new PublicKey(asset.parsedAta.programId),
          },
          asset.openCreatorProtocolMintState,
          to
        );
      } else if (asset.isCreatorStandardToken) {
        if (!asset.parsedMint || !asset.parsedAta) {
          throw new Error("Account data not available");
        }
        txSig = await Solana.transferCreatorStandardToken(
          solanaCtx,
          {
            assetId,
            destination: new PublicKey(to.publicKey),
            mint: new PublicKey(asset.mint),
            programId: new PublicKey(asset.parsedAta.programId),
            amount: Number(amount),
            decimals: asset.parsedMint.decimals,
          },
          to
        );
      } else if (asset.isCardinalWrappedToken) {
        if (!asset.parsedMint || !asset.parsedAta) {
          throw new Error("Account data not available");
        }
        txSig = await Solana.transferCardinalManagedToken(
          solanaCtx,
          {
            assetId,
            destination: new PublicKey(to.publicKey),
            mint: new PublicKey(asset.mint),
            programId: new PublicKey(asset.parsedAta.programId),
            amount: Number(amount),
            decimals: asset.parsedMint.decimals,
          },
          to
        );
      } else {
        if (!asset.parsedMint || !asset.parsedAta) {
          throw new Error("Account data not available");
        }
        txSig = await Solana.transferToken(
          solanaCtx,
          {
            assetId,
            destination: new PublicKey(to.publicKey),
            mint: new PublicKey(asset.mint!),
            programId: new PublicKey(asset.parsedAta.programId),
            amount: Number(amount),
            decimals: asset.parsedMint.decimals,
          },
          to
        );
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
    },
    _uiOptions?: SecureEvent["uiOptions"]
  ): Promise<string> {
    const { from, assetId, amount } = req;

    const solanaCtx = await this.buildCtx(from.publicKey);

    const gqlAssetId = assetId;
    const nft = await this.getAssetById(gqlAssetId);

    if (nft.__typename !== "Nft") {
      throw new Error("Can't burn Fungible token");
    }

    if (nft.compressed && nft.compressionData && nft.proofData) {
      const proofData = nft.proofData;

      return await Solana.burnCompressedNft(solanaCtx, {
        assetId: gqlAssetId,
        mint: new PublicKey(nft.mint),
        creatorHash: nft.compressionData.creatorHash,
        dataHash: nft.compressionData.dataHash,
        leafId: nft.compressionData.leaf,
        merkleTree: new PublicKey(nft.compressionData.tree),
        proof: proofData.proof,
        root: proofData.root,
        tree: nft.merkleTree,
      });
    }

    if (!nft.parsedAta) {
      throw new Error("Could not parse ATA");
    }

    return await Solana.burnAndCloseNft(solanaCtx, {
      assetId: gqlAssetId,
      solDestination: solanaCtx.walletPublicKey,
      mint: new PublicKey(nft.mint),
      programId: new PublicKey(nft.parsedAta.programId),
      source: nft.nonFungibleAta
        ? new PublicKey(nft.nonFungibleAta)
        : undefined,
      amount: nft.parsedAta.amount,
    });
  }

  public confirmTransaction(tx: string): Promise<true> {
    return this.wallet.confirmTransaction(tx, "confirmed").then(() => true);
  }
}
