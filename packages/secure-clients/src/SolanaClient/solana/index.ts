import {
  createTransferInstruction as createCCSTransferInstruction,
  findMintManagerId,
  findMintMetadataId,
  MintManager,
} from "@cardinal/creator-standard";
import { emptyWallet, withSend } from "@cardinal/token-manager";
import { type BackgroundClient, IS_MOBILE } from "@coral-xyz/common";
import { TOKEN_ACCOUNT_RENT_EXEMPTION_LAMPORTS } from "@coral-xyz/common";
import type { MintState } from "@magiceden-oss/open_creator_protocol";
import {
  CMT_PROGRAM,
  computeBudgetIx,
  createInitAccountInstruction as ocpCreateInitAccountInstruction,
  createTransferInstruction as ocpCreateTransferInstruction,
  findFreezeAuthorityPk,
  findMintStatePk,
} from "@magiceden-oss/open_creator_protocol";
import {
  createBurnInstruction as createCompressedBurnInstruction,
  createTransferInstruction as createCompressedTransferInstruction,
} from "@metaplex-foundation/mpl-bubblegum";
import type {
  TransferInstructionAccounts,
  TransferInstructionArgs,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  createTransferInstruction as createTokenMetadataTransferInstruction,
  Metadata,
  TokenRecord,
  TokenState,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  ConcurrentMerkleTreeAccount,
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
} from "@solana/spl-account-compression";
import {
  createAssociatedTokenAccountInstruction,
  createCloseAccountInstruction,
  createInitializeAccountInstruction,
  createSyncNativeInstruction,
  createTransferInstruction,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import type { TokenInfo } from "@solana/spl-token-registry";
import type {
  AccountMeta,
  Commitment,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  Transaction,
} from "@solana/web3.js";
import BN from "bn.js";
import { formatUnits } from "ethers6";

import type { SolanaClient } from "../SolanaClient";

import * as assertOwner from "./programs/assert-owner";
import type { TokenInterface } from "./programs/token";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  associatedTokenAddress,
  BUBBLEGUM_PROGRAM_ID,
  masterEditionAddress,
  metadataAddress,
  TOKEN_AUTH_RULES_ID,
  tokenRecordAddress,
} from "./programs/token";
import { xnftClient } from "./programs/xnft";
import { SolanaProvider } from "./provider";
import type { TokenRegistry } from "./token-registry";

// export * from "../common/solana/explorer";
// export * from "../common/solana/cluster";
export * from "./background-connection";
export * from "./confirmTransaction";
export * from "./programs";
export * from "./provider";
export * from "./rpc-helpers";
export * from "./send-helpers";
export * from "./token-registry";
export * from "./transaction-helpers";
export * from "./types";

export type SolanaContext = {
  walletPublicKey: PublicKey;
  tokenInterface: TokenInterface;
  connection: Connection;
  commitment: Commitment;
  solanaClient: SolanaClient | null;
  backgroundClient?: BackgroundClient;
  registry?: Map<string, TokenInfo>;
  blockhash?: string;
};

type ToUsername = {
  username?: string;
  walletName?: string;
  image?: string;
};

//
// API for performing Solana actions from within the wallet. Beware! Invoking
// these methods will automatically execute within the wallet without an
// approval screen.
//
export class Solana {
  public static async burnAndCloseNft(
    ctx: SolanaContext,
    req: BurnNftRequest
  ): Promise<string> {
    const { solDestination, mint, programId } = req;
    const { walletPublicKey, tokenInterface, connection, blockhash } = ctx;

    const source =
      req.source ?? associatedTokenAddress(mint, walletPublicKey, programId);

    const tx = new Transaction();
    tx.add(
      await tokenInterface
        .withProgramId(programId)
        .methods.burn(new BN(req.amount ?? 1))
        .accounts({
          account: source,
          mint,
          authority: walletPublicKey,
        })
        .instruction(),
      await tokenInterface
        .withProgramId(programId)
        .methods.closeAccount()
        .accounts({
          account: source,
          destination: solDestination,
          owner: walletPublicKey,
        })
        .instruction()
    );

    tx.feePayer = walletPublicKey;
    tx.recentBlockhash =
      blockhash ?? (await connection.getLatestBlockhash()).blockhash;
    const signedTx = await SolanaProvider.signTransaction(ctx, tx, {
      type: "BURN_NFT",
      assetId: req.assetId,
      tokenMint: new PublicKey(mint).toBase58(),
      amount: formatUnits(req.amount ?? 1, 0),
    });
    const rawTx = signedTx.serialize();

    return await connection.sendRawTransaction(rawTx, {
      skipPreflight: false,
    });
  }

  public static async burnCompressedNft(
    solanaCtx: SolanaContext,
    req: BurnCompressedNftRequest
  ): Promise<string> {
    const { blockhash } = solanaCtx;
    const tree =
      req.tree ??
      (await ConcurrentMerkleTreeAccount.fromAccountAddress(
        solanaCtx.connection,
        req.merkleTree,
        { commitment: solanaCtx.commitment }
      ));

    const treeAuthority = tree.getAuthority();
    const canopyDepth = tree.getCanopyDepth();

    const proofMeta: AccountMeta[] = req.proof
      .slice(0, req.proof.length - (canopyDepth ? canopyDepth : 0))
      .map((node: string) => ({
        pubkey: new PublicKey(node),
        isSigner: false,
        isWritable: false,
      }));

    const ix = createCompressedBurnInstruction(
      {
        anchorRemainingAccounts: proofMeta,
        compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
        leafDelegate: req.leafDelegate ?? solanaCtx.walletPublicKey,
        leafOwner: solanaCtx.walletPublicKey,
        logWrapper: SPL_NOOP_PROGRAM_ID,
        merkleTree: req.merkleTree,
        treeAuthority,
      },
      {
        creatorHash: [...new PublicKey(req.creatorHash.trim()).toBytes()],
        dataHash: [...new PublicKey(req.dataHash.trim()).toBytes()],
        index: req.leafId,
        nonce: req.leafId,
        root: [...new PublicKey(req.root.trim()).toBytes()],
      },
      BUBBLEGUM_PROGRAM_ID
    );

    const transaction: Transaction = new Transaction();
    transaction.add(computeBudgetIx, ix);

    transaction.feePayer = solanaCtx.walletPublicKey;
    transaction.recentBlockhash =
      blockhash ??
      (await solanaCtx.connection.getLatestBlockhash(solanaCtx.commitment))
        .blockhash;

    const signedTx = await SolanaProvider.signTransaction(
      solanaCtx,
      transaction,
      {
        type: "BURN_NFT",
        assetId: req.assetId,
        tokenMint: req.mint.toBase58(),
        amount: formatUnits(1, 0),
      }
    );

    const rawTx = signedTx.serialize();
    return await solanaCtx.connection.sendRawTransaction(rawTx, {
      skipPreflight: true,
      preflightCommitment: solanaCtx.commitment,
    });
  }

  public static async transferToken(
    ctx: SolanaContext,
    req: TransferTokenRequest,
    toUsername?: ToUsername,
    tokenRegistry?: TokenRegistry
  ): Promise<string> {
    const {
      walletPublicKey,
      tokenInterface,
      commitment,
      connection,
      blockhash,
    } = ctx;
    const { mint, programId, destination, amount } = req;

    const decimals = (() => {
      if (req.decimals !== undefined) {
        return req.decimals;
      }
      if (tokenRegistry === undefined) {
        throw new Error("token registry not provided");
      }
      const tokenInfo = tokenRegistry.get(mint.toString());
      if (!tokenInfo) {
        throw new Error("no token info found");
      }
      const decimals = tokenInfo.decimals;
      return decimals;
    })();

    const nativeAmount = new BN(amount);

    const destinationAta = associatedTokenAddress(mint, destination, programId);
    const sourceAta = associatedTokenAddress(mint, walletPublicKey, programId);

    // Mobile uses `Connection` here instead of the usual `BackgroundConnection`,
    // `BackgroundConnection` can't be removed altogether because some of its
    // methods are used by mobile, such as `customSplTokenAccounts(publicKey)`
    const conn = IS_MOBILE
      ? new Connection(connection.rpcEndpoint, connection.commitment)
      : connection;

    const [destinationAccount, destinationAtaAccount] =
      await conn.getMultipleAccountsInfo(
        [destination, destinationAta],
        commitment
      );

    //
    // Require the account to either be a system program account or a brand new
    // account.
    //
    if (
      destinationAccount &&
      !destinationAccount.owner.equals(SystemProgram.programId)
    ) {
      throw new Error("invalid account");
    }

    // Instructions to execute prior to the transfer.
    const preInstructions: Array<TransactionInstruction> = [];
    if (!destinationAtaAccount) {
      preInstructions.push(
        assertOwner.assertOwnerInstruction({
          account: destination,
          owner: SystemProgram.programId,
        })
      );
      preInstructions.push(
        createAssociatedTokenAccountInstruction(
          walletPublicKey,
          destinationAta,
          destination,
          mint,
          programId
        )
      );
    }

    const tx = await tokenInterface
      .withProgramId(programId)
      .methods.transferChecked(nativeAmount, decimals)
      .accounts({
        source: sourceAta,
        mint,
        destination: destinationAta,
        authority: walletPublicKey,
      })
      .preInstructions(preInstructions)
      .transaction();

    tx.feePayer = walletPublicKey;
    tx.recentBlockhash =
      blockhash ?? (await connection.getLatestBlockhash(commitment)).blockhash;

    const signedTx = await SolanaProvider.signTransaction(ctx, tx, {
      type: "SEND_TOKEN",
      assetId: req.assetId,
      tokenMint: mint.toBase58(),
      amount: formatUnits(amount, decimals),
      to: {
        address: destination.toBase58(),
        username: toUsername?.username,
      },
    });

    const rawTx = signedTx.serialize();

    return await connection.sendRawTransaction(rawTx, {
      skipPreflight: false,
    });
  }

  // see github.com/cardinal-labs/cardinal-creator-standard
  public static async transferCreatorStandardToken(
    ctx: SolanaContext,
    req: TransferTokenRequest,
    toUsername?: ToUsername
  ): Promise<string> {
    const { walletPublicKey, connection, commitment, blockhash } = ctx;
    const { mint, programId, destination } = req;

    const destinationAta = associatedTokenAddress(mint, destination, programId);
    const sourceAta = associatedTokenAddress(mint, walletPublicKey, programId);

    const [destinationAccount, destinationAtaAccount] =
      await connection.getMultipleAccountsInfo(
        [destination, destinationAta],
        commitment
      );

    //
    // Require the account to either be a system program account or a brand new
    // account.
    //
    if (
      destinationAccount &&
      !destinationAccount.owner.equals(SystemProgram.programId)
    ) {
      throw new Error("invalid account");
    }

    // Instructions to execute prior to the transfer.
    const transaction = new Transaction();
    const mintManagerId = findMintManagerId(mint);
    const mintMetadataId = findMintMetadataId(mint);
    const mintManagerData = await MintManager.fromAccountAddress(
      ctx.connection,
      mintManagerId
    );

    if (!destinationAtaAccount) {
      transaction.add(
        assertOwner.assertOwnerInstruction({
          account: destination,
          owner: SystemProgram.programId,
        }),
        createAssociatedTokenAccountInstruction(
          walletPublicKey,
          destinationAta,
          destination,
          mint,
          programId
        )
      );
    }

    transaction.add(
      createCCSTransferInstruction({
        mintManager: mintManagerId,
        mint: mintManagerData.mint,
        mintMetadata: mintMetadataId,
        ruleset: mintManagerData.ruleset,
        from: sourceAta,
        to: destinationAta,
        authority: walletPublicKey,
        instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
      })
    );

    transaction.feePayer = walletPublicKey;
    transaction.recentBlockhash =
      blockhash ?? (await connection.getLatestBlockhash(commitment)).blockhash;

    const signedTx = await SolanaProvider.signTransaction(ctx, transaction, {
      type: "SEND_NFT",
      assetId: req.assetId,
      tokenMint: mint.toBase58(),
      amount: formatUnits(1, 0),
      to: {
        address: new PublicKey(destination).toBase58(),
        username: toUsername?.username,
      },
    });
    const rawTx = signedTx.serialize();

    return await connection.sendRawTransaction(rawTx, {
      skipPreflight: false,
      preflightCommitment: commitment,
    });
  }

  public static async transferOpenCreatorProtocol(
    solanaCtx: SolanaContext,
    req: TransferTokenRequest,
    mintState: MintState,
    toUsername?: ToUsername
  ): Promise<string> {
    const { walletPublicKey, connection, commitment, blockhash } = solanaCtx;
    const { mint, destination, programId } = req;

    const sourceAta = associatedTokenAddress(mint, walletPublicKey, programId);
    const destinationAta = associatedTokenAddress(mint, destination, programId);

    const destinationAtaAccount = await connection.getAccountInfo(
      destinationAta
    );

    const transaction: Transaction = new Transaction();
    transaction.add(computeBudgetIx);

    if (!destinationAtaAccount) {
      transaction.add(
        ocpCreateInitAccountInstruction({
          policy: mintState.policy,
          freezeAuthority: findFreezeAuthorityPk(mintState.policy),
          mint,
          metadata: await metadataAddress(mint),
          mintState: findMintStatePk(mint),
          from: destination,
          fromAccount: destinationAta,
          cmtProgram: CMT_PROGRAM,
          instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
          payer: walletPublicKey,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        })
      );
    }

    transaction.add(
      ocpCreateTransferInstruction({
        policy: mintState.policy,
        freezeAuthority: findFreezeAuthorityPk(mintState.policy),
        mint,
        metadata: await metadataAddress(mint),
        mintState: findMintStatePk(mint),
        from: walletPublicKey,
        fromAccount: sourceAta,
        cmtProgram: CMT_PROGRAM,
        instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
        to: destination,
        toAccount: destinationAta,
      })
    );

    transaction.feePayer = walletPublicKey;
    transaction.recentBlockhash =
      blockhash ?? (await connection.getLatestBlockhash(commitment)).blockhash;

    const signedTx = await SolanaProvider.signTransaction(
      solanaCtx,
      transaction,
      {
        type: "SEND_NFT",
        assetId: req.assetId,
        tokenMint: mint.toBase58(),
        amount: formatUnits(1, 0),
        to: {
          address: new PublicKey(destination).toBase58(),
          username: toUsername?.username,
        },
      }
    );
    const rawTx = signedTx.serialize();

    return await connection.sendRawTransaction(rawTx, {
      skipPreflight: true,
      preflightCommitment: commitment,
    });
  }

  public static async transferCardinalManagedToken(
    ctx: SolanaContext,
    req: TransferTokenRequest,
    toUsername?: ToUsername
  ): Promise<string> {
    const { walletPublicKey, connection, commitment, blockhash } = ctx;
    const { mint, destination, programId } = req;

    const sourceAta = associatedTokenAddress(mint, walletPublicKey, programId);
    const tx = await withSend(
      new Transaction(),
      connection,
      emptyWallet(walletPublicKey),
      mint,
      sourceAta,
      destination
    );

    tx.feePayer = walletPublicKey;
    tx.recentBlockhash =
      blockhash ?? (await connection.getLatestBlockhash(commitment)).blockhash;

    const signedTx = await SolanaProvider.signTransaction(ctx, tx, {
      type: "SEND_NFT",
      assetId: req.assetId,
      tokenMint: mint.toBase58(),
      amount: formatUnits(1, 0),
      to: {
        address: new PublicKey(destination).toBase58(),
        username: toUsername?.username,
      },
    });
    const rawTx = signedTx.serialize();

    return await connection.sendRawTransaction(rawTx, {
      skipPreflight: false,
      preflightCommitment: commitment,
    });
  }

  public static async transferCompressedNft(
    solanaCtx: SolanaContext,
    req: TransferCompressedNftRequest,
    toUsername?: ToUsername
  ): Promise<string> {
    const { blockhash } = solanaCtx;
    const tree =
      req.tree ??
      (await ConcurrentMerkleTreeAccount.fromAccountAddress(
        solanaCtx.connection,
        req.merkleTree,
        { commitment: solanaCtx.commitment }
      ));

    const treeAuthority = tree.getAuthority();
    const canopyDepth = tree.getCanopyDepth();

    const proofMeta: AccountMeta[] = req.proof
      .slice(0, req.proof.length - (canopyDepth ? canopyDepth : 0))
      .map((node: string) => ({
        pubkey: new PublicKey(node),
        isSigner: false,
        isWritable: false,
      }));

    const ix = createCompressedTransferInstruction(
      {
        anchorRemainingAccounts: proofMeta,
        compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
        leafDelegate: req.leafDelegate ?? solanaCtx.walletPublicKey,
        leafOwner: solanaCtx.walletPublicKey,
        logWrapper: SPL_NOOP_PROGRAM_ID,
        merkleTree: req.merkleTree,
        newLeafOwner: req.recipient,
        treeAuthority,
      },
      {
        creatorHash: [...new PublicKey(req.creatorHash.trim()).toBytes()],
        dataHash: [...new PublicKey(req.dataHash.trim()).toBytes()],
        index: req.leafId,
        nonce: req.leafId,
        root: [...new PublicKey(req.root.trim()).toBytes()],
      },
      BUBBLEGUM_PROGRAM_ID
    );

    const transaction: Transaction = new Transaction();
    transaction.add(computeBudgetIx, ix);

    transaction.feePayer = solanaCtx.walletPublicKey;
    transaction.recentBlockhash =
      blockhash ??
      (await solanaCtx.connection.getLatestBlockhash(solanaCtx.commitment))
        .blockhash;

    const signedTx = await SolanaProvider.signTransaction(
      solanaCtx,
      transaction,
      {
        type: "SEND_NFT",
        assetId: req.assetId,
        tokenMint: req.mint.toBase58(),
        amount: formatUnits(1, 0),
        to: {
          address: req.recipient.toBase58(),
          username: toUsername?.username,
        },
      }
    );

    const rawTx = signedTx.serialize();
    return await solanaCtx.connection.sendRawTransaction(rawTx, {
      skipPreflight: true,
      preflightCommitment: solanaCtx.commitment,
    });
  }

  public static async transferProgrammableNft(
    solanaCtx: SolanaContext,
    req: TransferTokenRequest,
    toUsername?: ToUsername
  ): Promise<string> {
    const { walletPublicKey, connection, commitment, blockhash } = solanaCtx;
    const { amount, mint, programId, destination: destinationOwner } = req;

    const source =
      req.source ?? associatedTokenAddress(mint, walletPublicKey, programId);
    const destinationAta = associatedTokenAddress(
      mint,
      destinationOwner,
      programId
    );

    const ownerTokenRecord = await tokenRecordAddress(mint, source);

    // we need to check whether the token is lock or listed
    //
    // Note (Armani): do we? If the token is listed or locked we should
    //                show that information in the UI and not allow
    //                the user to try and send a tx. If the user does
    //                The program should just throw and the tx will fail.
    //                No need for us to slow down this code path with this
    //                check. TODO: remove this `tokenRecord` block.

    const tokenRecord = await TokenRecord.fromAccountAddress(
      connection,
      ownerTokenRecord
    );
    if (tokenRecord.state == TokenState.Locked) {
      throw new Error("token account is locked");
    } else if (tokenRecord.state == TokenState.Listed) {
      throw new Error("token is listed");
    }

    // we need the metadata object to retrieve the programmable config

    const metadata = await Metadata.fromAccountAddress(
      connection,
      await metadataAddress(mint)
    );

    let authorizationRules: PublicKey | undefined;

    if (metadata.programmableConfig) {
      authorizationRules = metadata.programmableConfig.ruleSet ?? undefined;
    }

    const transferAcccounts: TransferInstructionAccounts = {
      authority: walletPublicKey,
      tokenOwner: walletPublicKey,
      token: source,
      metadata: await metadataAddress(mint),
      mint,
      edition: await masterEditionAddress(mint),
      destinationOwner,
      destination: destinationAta,
      payer: walletPublicKey,
      splTokenProgram: TOKEN_PROGRAM_ID,
      splAtaProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
      authorizationRules,
      authorizationRulesProgram: TOKEN_AUTH_RULES_ID,
      ownerTokenRecord,
      destinationTokenRecord: await tokenRecordAddress(mint, destinationAta),
    };

    const transferArgs: TransferInstructionArgs = {
      transferArgs: {
        __kind: "V1",
        amount,
        authorizationData: null,
      },
    };

    const transferIx = createTokenMetadataTransferInstruction(
      transferAcccounts,
      transferArgs
    );

    const transaction = new Transaction();
    transaction.add(computeBudgetIx, transferIx);

    transaction.feePayer = walletPublicKey;
    transaction.recentBlockhash =
      blockhash ?? (await connection.getLatestBlockhash(commitment)).blockhash;

    const signedTx = await SolanaProvider.signTransaction(
      solanaCtx,
      transaction,
      {
        type: "SEND_NFT",
        assetId: req.assetId,
        tokenMint: mint.toBase58(),
        amount: formatUnits(1, 0),
        to: {
          address: new PublicKey(destinationOwner).toBase58(),
          username: toUsername?.username,
        },
      }
    );
    const rawTx = signedTx.serialize();

    return await connection.sendRawTransaction(rawTx, {
      skipPreflight: true,
      preflightCommitment: commitment,
    });
  }

  public static async transferSol(
    ctx: SolanaContext,
    req: TransferSolRequest,
    toUsername?: ToUsername
  ): Promise<string> {
    const { walletPublicKey, connection, commitment, blockhash } = ctx;
    const tx = new Transaction();
    tx.add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(req.source),
        toPubkey: new PublicKey(req.destination),
        lamports: req.amount,
      })
    );
    tx.feePayer = walletPublicKey;
    tx.recentBlockhash =
      blockhash ?? (await connection.getLatestBlockhash(commitment)).blockhash;
    const signedTx = await SolanaProvider.signTransaction(ctx, tx, {
      type: "SEND_TOKEN",
      assetId: "",
      tokenMint: "So11111111111111111111111111111111111111111",
      amount: formatUnits(req.amount, 9),
      to: {
        address: new PublicKey(req.destination).toBase58(),
        username: toUsername?.username,
      },
    });
    const rawTx = signedTx.serialize();

    return await ctx.connection.sendRawTransaction(rawTx, {
      skipPreflight: false,
      preflightCommitment: ctx.commitment,
    });
  }

  // public static async wrapSol(
  //   ctx: SolanaContext,
  //   req: WrapSolRequest
  // ): Promise<string> {
  //   const { destination, amount } = req;
  //   const rawTx = await generateWrapSolTx(ctx, destination, amount);
  //   return await ctx.connection.sendRawTransaction(
  //     rawTx,
  //     {
  //       skipPreflight: false,
  //       preflightCommitment: ctx.commitment,
  //     }
  //   );
  // }

  // public static async unwrapSol(
  //   ctx: SolanaContext,
  //   req: UnwrapSolRequest
  // ): Promise<string> {
  //   const { destination, amount } = req;
  //   const rawTx = await generateUnwrapSolTx(ctx, destination, amount);
  //   return await ctx.connection.sendRawTransaction(
  //     rawTx,
  //     {
  //       skipPreflight: false,
  //       preflightCommitment: ctx.commitment,
  //     }
  //   );
  // }

  public static async uninstallXnft(
    ctx: SolanaContext,
    req: DeleteInstallRequest
  ): Promise<string> {
    const { blockhash } = ctx;
    const client = xnftClient(ctx.tokenInterface.provider);
    const { install } = req;
    const receiver = ctx.walletPublicKey;
    const authority = ctx.walletPublicKey;
    const tx = await client.methods
      .deleteInstall()
      .accounts({
        install,
        receiver,
        authority,
      })
      .transaction();
    tx.feePayer = ctx.walletPublicKey;
    tx.recentBlockhash =
      blockhash ??
      (await ctx.connection.getLatestBlockhash(ctx.commitment)).blockhash;
    const signedTx = await SolanaProvider.signTransaction(ctx, tx, {
      type: "UNINSTALL_XNFT",
      assetId: req.assetId,
      tokenMint: new PublicKey(req.mint).toBase58(),
      iconUrl: req.iconUrl,
    });
    const rawTx = signedTx.serialize();
    return await ctx.connection.sendRawTransaction(rawTx, {
      skipPreflight: false,
      preflightCommitment: ctx.commitment,
    });
  }
}

//
// Helper method that will generate a transaction to wrap SOL, creating the
// associated token account if necessary.
//
export const generateWrapSolTx = async (
  ctx: SolanaContext,
  destination: PublicKey,
  lamports: number
) => {
  const { walletPublicKey, connection, commitment, blockhash } = ctx;
  const destinationAta = associatedTokenAddress(
    NATIVE_MINT,
    destination,
    TOKEN_PROGRAM_ID
  );

  const [destinationAccount, destinationAtaAccount] =
    await connection.getMultipleAccountsInfo(
      [destination, destinationAta],
      commitment
    );

  //
  // Require the account to either be a system program account or a brand new
  // account.
  //
  if (
    destinationAccount &&
    !destinationAccount.owner.equals(SystemProgram.programId)
  ) {
    throw new Error("invalid account");
  }

  const tx = new Transaction();
  if (!destinationAtaAccount) {
    tx.instructions.push(
      createAssociatedTokenAccountInstruction(
        walletPublicKey,
        destinationAta,
        destination,
        NATIVE_MINT,
        TOKEN_PROGRAM_ID
      )
    );
  }
  tx.instructions.push(
    SystemProgram.transfer({
      fromPubkey: walletPublicKey,
      toPubkey: new PublicKey(destinationAta),
      lamports,
    })
  );
  tx.instructions.push(
    createSyncNativeInstruction(new PublicKey(destinationAta))
  );
  tx.feePayer = walletPublicKey;
  tx.recentBlockhash =
    blockhash ?? (await connection.getLatestBlockhash(commitment)).blockhash;
  return tx.serialize({ requireAllSignatures: false });
};

//
// Helper method to generate a transaction that will unwrap the given amount
// of wSOL by creating a new account and transferring wSOL into it, then
// closing the account.
//
export const generateUnwrapSolTx = async (
  ctx: SolanaContext,
  destination: PublicKey,
  lamports: number
) => {
  const { blockhash } = ctx;
  const { walletPublicKey, connection, commitment } = ctx;
  // Unwrapping partial SOL amounts appears to not be possible in token program.
  // This unwrap works by closing the account, and then creating a new wSOL account
  // and transferring the difference between the previous amount and the requested
  // amount into the newly created account.
  const destinationAta = associatedTokenAddress(
    NATIVE_MINT,
    destination,
    TOKEN_PROGRAM_ID
  );
  const sourceAta = associatedTokenAddress(
    NATIVE_MINT,
    walletPublicKey,
    TOKEN_PROGRAM_ID
  );

  const [destinationAccount, destinationAtaAccount] =
    await connection.getMultipleAccountsInfo(
      [destination, destinationAta],
      commitment
    );

  if (!destinationAtaAccount) {
    throw new Error("expected wSOL account to exist");
  }

  //
  // Require the account to either be a system program account or a brand new
  // account.
  //
  if (
    destinationAccount &&
    !destinationAccount.owner.equals(SystemProgram.programId)
  ) {
    throw new Error("invalid account");
  }

  const tx = new Transaction();
  tx.feePayer = walletPublicKey;
  tx.recentBlockhash =
    blockhash ?? (await connection.getLatestBlockhash(commitment)).blockhash;

  // recreate the account with the new balance
  if (destinationAtaAccount.lamports === lamports) {
    tx.instructions.push(
      createCloseAccountInstruction(destinationAta, destination, destination)
    );
  } else {
    const newAccount = Keypair.generate();
    // Create a new account to transfer wSOL into and then close
    tx.instructions.push(
      SystemProgram.createAccount({
        fromPubkey: walletPublicKey,
        newAccountPubkey: newAccount.publicKey,
        lamports: TOKEN_ACCOUNT_RENT_EXEMPTION_LAMPORTS,
        space: 165,
        programId: TOKEN_PROGRAM_ID,
      })
    );
    // Init the new account with native mint
    tx.instructions.push(
      createInitializeAccountInstruction(
        newAccount.publicKey,
        NATIVE_MINT,
        destination
      )
    );
    // Transfer unwrap amount into the new account
    tx.instructions.push(
      createTransferInstruction(
        sourceAta,
        newAccount.publicKey,
        walletPublicKey,
        lamports
      )
    );
    // Close the new account
    tx.instructions.push(
      createCloseAccountInstruction(
        newAccount.publicKey,
        destination,
        destination
      )
    );
    tx.partialSign(newAccount);
  }
  return tx.serialize({ requireAllSignatures: false });
};

export type BurnCompressedNftRequest = {
  assetId: string;
  mint: PublicKey;
  creatorHash: string;
  dataHash: string;
  leafDelegate?: PublicKey;
  leafId: number;
  merkleTree: PublicKey;
  proof: string[];
  root: string;
  tree?: ConcurrentMerkleTreeAccount;
};

export type TransferCompressedNftRequest = {
  assetId: string;
  mint: PublicKey;
  creatorHash: string;
  dataHash: string;
  leafDelegate?: PublicKey;
  leafId: number;
  merkleTree: PublicKey;
  proof: string[];
  recipient: PublicKey;
  root: string;
  tree?: ConcurrentMerkleTreeAccount;
};

export type TransferTokenRequest = {
  // SOL address.
  assetId: string;
  destination: PublicKey;
  mint: PublicKey;
  programId: PublicKey;
  amount: number;
  decimals?: number;
  // Source token addess. If not provided, an ATA will
  // be derived from the wallet.
  source?: PublicKey;
};

export type TransferSolRequest = {
  // SOL address.
  source: PublicKey;
  // SOL address.
  destination: PublicKey;
  amount: number;
};

export type WrapSolRequest = {
  // SOL address.
  destination: PublicKey;
  amount: number;
};

export type UnwrapSolRequest = {
  // SOL address.
  destination: PublicKey;
  amount: number;
};

export type DeleteInstallRequest = {
  assetId: string;
  install: PublicKey;
  mint: PublicKey;
  iconUrl: string;
};

export type BurnNftRequest = {
  assetId: string;
  solDestination: PublicKey;
  mint: PublicKey;
  programId: PublicKey;
  amount?: number;
  // Source token addess. If not provided, an ATA will
  // be derived from the wallet.
  source?: PublicKey;
};
