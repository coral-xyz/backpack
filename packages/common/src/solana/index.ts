import {
  createTransferInstruction as createCCSTransferInstruction,
  findMintManagerId,
  findMintMetadataId,
  MintManager,
} from "@cardinal/creator-standard";
import { emptyWallet, withSend } from "@cardinal/token-manager";
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
  createTransferInstruction as createTransferLeafInstruction,
  PROGRAM_ID as BUBBLEGUM_PROGRAM_ID,
} from "@metaplex-foundation/mpl-bubblegum";
import type {
  TransferInstructionAccounts,
  TransferInstructionArgs} from "@metaplex-foundation/mpl-token-metadata";
import {
  createTransferInstruction as createTokenMetadataTransferInstruction,
  Metadata,
  TokenRecord,
  TokenState
} from "@metaplex-foundation/mpl-token-metadata";
import type { Program, SplToken } from "@project-serum/anchor";
import * as anchor from "@project-serum/anchor";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
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
  Commitment,
  Connection,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  Transaction,
} from "@solana/web3.js";
import BN from "bn.js";

import type { BackgroundClient } from "../";

import * as assertOwner from "./programs/assert-owner";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  associatedTokenAddress,
  masterEditionAddress,
  metadataAddress,
  TOKEN_AUTH_RULES_ID,
  tokenRecordAddress,
} from "./programs/token";
import { xnftClient } from "./programs/xnft";
import { SolanaProvider } from "./provider";

export * from "./background-connection";
export * from "./cluster";
export * from "./explorer";
export * from "./programs";
export * from "./provider";
export * from "./rpc-helpers";
export * from "./transaction-helpers";
export * from "./types";
export * from "./wallet-adapter";

export type SolanaContext = {
  walletPublicKey: PublicKey;
  tokenClient: Program<SplToken>;
  connection: Connection;
  registry: Map<string, TokenInfo>;
  commitment: Commitment;
  backgroundClient: BackgroundClient;
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
    const { solDestination, mint } = req;
    const { walletPublicKey, tokenClient, commitment } = ctx;

    const provider = tokenClient.provider;
    const associatedToken = associatedTokenAddress(mint, walletPublicKey);

    const tx = new Transaction();
    tx.add(
      await tokenClient.methods
        .burn(new BN(req.amount ?? 1))
        .accounts({
          source: associatedToken,
          mint,
          authority: walletPublicKey,
        })
        .instruction()
    );
    tx.add(
      await tokenClient.methods
        .closeAccount()
        .accounts({
          account: associatedToken,
          destination: solDestination,
          authority: walletPublicKey,
        })
        .instruction()
    );
    tx.feePayer = walletPublicKey;
    tx.recentBlockhash = (
      await provider.connection.getLatestBlockhash(commitment)
    ).blockhash;
    const signedTx = await SolanaProvider.signTransaction(ctx, tx);
    const rawTx = signedTx.serialize();

    return await provider.connection.sendRawTransaction(rawTx, {
      skipPreflight: false,
      preflightCommitment: commitment,
    });
  }

  public static async transferToken(
    ctx: SolanaContext,
    req: TransferTokenRequest
  ): Promise<string> {
    const { walletPublicKey, registry, tokenClient, commitment } = ctx;
    const { mint, destination, amount } = req;

    const decimals = (() => {
      if (req.decimals !== undefined) {
        return req.decimals;
      }
      const tokenInfo = registry.get(mint.toString());
      if (!tokenInfo) {
        throw new Error("no token info found");
      }
      const decimals = tokenInfo.decimals;
      return decimals;
    })();

    const nativeAmount = new BN(amount);

    const destinationAta = associatedTokenAddress(mint, destination);
    const sourceAta = associatedTokenAddress(mint, walletPublicKey);

    const [destinationAccount, destinationAtaAccount] =
      await anchor.utils.rpc.getMultipleAccounts(
        tokenClient.provider.connection,
        [destination, destinationAta],
        commitment
      );

    //
    // Require the account to either be a system program account or a brand new
    // account.
    //
    if (
      destinationAccount &&
      !destinationAccount.account.owner.equals(SystemProgram.programId)
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
          mint
        )
      );
    }

    const tx = await tokenClient.methods
      .transferChecked(nativeAmount, decimals)
      .accounts({
        source: sourceAta,
        mint,
        destination: destinationAta,
        authority: walletPublicKey,
      })
      .preInstructions(preInstructions)
      .transaction();
    tx.feePayer = walletPublicKey;
    tx.recentBlockhash = (
      await tokenClient.provider.connection.getLatestBlockhash(commitment)
    ).blockhash;
    const signedTx = await SolanaProvider.signTransaction(ctx, tx);
    const rawTx = signedTx.serialize();

    return await tokenClient.provider.connection.sendRawTransaction(rawTx, {
      skipPreflight: false,
      preflightCommitment: commitment,
    });
  }

  // see github.com/cardinal-labs/cardinal-creator-standard
  public static async transferCreatorStandardToken(
    ctx: SolanaContext,
    req: TransferTokenRequest
  ): Promise<string> {
    const { walletPublicKey, tokenClient, commitment } = ctx;
    const { mint, destination } = req;

    const destinationAta = associatedTokenAddress(mint, destination);
    const sourceAta = associatedTokenAddress(mint, walletPublicKey);

    const [destinationAccount, destinationAtaAccount] =
      await anchor.utils.rpc.getMultipleAccounts(
        tokenClient.provider.connection,
        [destination, destinationAta],
        commitment
      );

    //
    // Require the account to either be a system program account or a brand new
    // account.
    //
    if (
      destinationAccount &&
      !destinationAccount.account.owner.equals(SystemProgram.programId)
    ) {
      throw new Error("invalid account");
    }

    // Instructions to execute prior to the transfer.
    const transaction: Transaction = new Transaction();

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
        })
      );
      transaction.add(
        createAssociatedTokenAccountInstruction(
          walletPublicKey,
          destinationAta,
          destination,
          mint
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
    transaction.recentBlockhash = (
      await tokenClient.provider.connection.getLatestBlockhash(commitment)
    ).blockhash;

    const signedTx = await SolanaProvider.signTransaction(ctx, transaction);
    const rawTx = signedTx.serialize();

    return await tokenClient.provider.connection.sendRawTransaction(rawTx, {
      skipPreflight: false,
      preflightCommitment: commitment,
    });
  }

  public static async transferCompressedNft(
    solanaCtx: SolanaContext,
    req: Omit<TransferTokenRequest, "amount"> & {
      compression: {
        ownership: {
          delegated: boolean;
          delegate: string;
          owner: string;
        };
        seq: number;
        tree: string;
        data_hash: string;
        creator_hash: string;
      };
    }
  ): Promise<string> {
    const { walletPublicKey, tokenClient, commitment } = solanaCtx;
    const { mint, destination, compression } = req;

    const transaction: Transaction = new Transaction();

    const [treeAuthority] = PublicKey.findProgramAddressSync(
      [bs58.decode(compression.tree)],
      BUBBLEGUM_PROGRAM_ID
    );

    const treeAccount = await ConcurrentMerkleTreeAccount.fromAccountAddress(
      solanaCtx.connection,
      new PublicKey(compression.tree)
    );
    const canopyHeight = treeAccount.getCanopyDepth();

    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "get_asset_proof",
        // TODO(jon): This should uniquely identify this operation
        id: "rpd-op-123",
        params: [mint.toBase58()],
      }),
    };

    // The Metaplex Read API is surfaced on the same connection URL as the typical Solana RPC
    // Hardcoding for now until testing is complete.
    const response = await fetch(
      "https://rpc-devnet.aws.metaplex.com/",
      options
    );
    const { result: assetProof, error } = await response.json();
    if (error) {
      // TODO(jon): Handle this a little better
      console.error(error);
      throw new Error("something went wrong");
    }

    const { root, proof, node_index, leaf, tree_id } = assetProof;
    const { ownership, seq } = compression;

    const transferInstruction = createTransferLeafInstruction(
      {
        treeAuthority,
        leafOwner: new PublicKey(ownership.owner),
        leafDelegate: ownership.delegated
          ? new PublicKey(ownership.delegate)
          : new PublicKey(ownership.owner),
        newLeafOwner: destination,
        merkleTree: new PublicKey(tree_id),
        logWrapper: SPL_NOOP_PROGRAM_ID,
        compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
        anchorRemainingAccounts: canopyHeight
          ? proof.slice(0, proof.length - canopyHeight)
          : proof,
      },
      {
        root: [...bs58.decode(root)],
        dataHash: [...bs58.decode(compression.data_hash.trim())],
        creatorHash: [...bs58.decode(compression.creator_hash.trim())],
        nonce: seq,
        index: node_index,
      }
    );

    transferInstruction.keys;

    transaction.feePayer = walletPublicKey;
    transaction.recentBlockhash = (
      await tokenClient.provider.connection.getLatestBlockhash(commitment)
    ).blockhash;

    const signedTx = await SolanaProvider.signTransaction(
      solanaCtx,
      transaction
    );
    const rawTx = signedTx.serialize();

    return await tokenClient.provider.connection.sendRawTransaction(rawTx, {
      skipPreflight: false,
      preflightCommitment: commitment,
    });
  }

  public static async transferOpenCreatorProtocol(
    solanaCtx: SolanaContext,
    req: TransferTokenRequest,
    mintState: MintState
  ): Promise<string> {
    const { walletPublicKey, tokenClient, commitment } = solanaCtx;
    const { mint, destination } = req;

    const sourceAta = associatedTokenAddress(mint, walletPublicKey);
    const destinationAta = associatedTokenAddress(mint, destination);

    const destinationAtaAccount =
      await tokenClient.provider.connection.getAccountInfo(destinationAta);

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
    transaction.recentBlockhash = (
      await tokenClient.provider.connection.getLatestBlockhash(commitment)
    ).blockhash;

    const signedTx = await SolanaProvider.signTransaction(
      solanaCtx,
      transaction
    );
    const rawTx = signedTx.serialize();

    return await tokenClient.provider.connection.sendRawTransaction(rawTx, {
      skipPreflight: true,
      preflightCommitment: commitment,
    });
  }

  public static async transferCardinalManagedToken(
    ctx: SolanaContext,
    req: TransferTokenRequest
  ): Promise<string> {
    const { walletPublicKey, tokenClient, commitment } = ctx;
    const { mint, destination } = req;

    const sourceAta = associatedTokenAddress(mint, walletPublicKey);

    const tx = await withSend(
      new Transaction(),
      tokenClient.provider.connection,
      emptyWallet(walletPublicKey),
      mint,
      sourceAta,
      destination
    );

    tx.feePayer = walletPublicKey;
    tx.recentBlockhash = (
      await tokenClient.provider.connection.getLatestBlockhash(commitment)
    ).blockhash;

    const signedTx = await SolanaProvider.signTransaction(ctx, tx);
    const rawTx = signedTx.serialize();

    return await tokenClient.provider.connection.sendRawTransaction(rawTx, {
      skipPreflight: false,
      preflightCommitment: commitment,
    });
  }

  public static async transferProgrammableNft(
    solanaCtx: SolanaContext,
    req: TransferTokenRequest
  ): Promise<string> {
    const { walletPublicKey, tokenClient, commitment } = solanaCtx;
    const { amount, mint, destination: destinationOwner } = req;

    const sourceAta = associatedTokenAddress(mint, walletPublicKey);
    const destinationAta = associatedTokenAddress(mint, destinationOwner);

    const ownerTokenRecord = await tokenRecordAddress(mint, sourceAta);

    // we need to check whether the token is lock or listed

    const tokenRecord = await TokenRecord.fromAccountAddress(
      tokenClient.provider.connection,
      ownerTokenRecord
    );

    if (tokenRecord.state == TokenState.Locked) {
      throw new Error("token account is locked");
    } else if (tokenRecord.state == TokenState.Listed) {
      throw new Error("token is listed");
    }

    // we need the metadata object to retrieve the programmable config

    const metadata = await Metadata.fromAccountAddress(
      tokenClient.provider.connection,
      await metadataAddress(mint)
    );

    let authorizationRules: PublicKey | undefined;

    if (metadata.programmableConfig) {
      authorizationRules = metadata.programmableConfig.ruleSet ?? undefined;
    }

    const transferAcccounts: TransferInstructionAccounts = {
      authority: walletPublicKey,
      tokenOwner: walletPublicKey,
      token: sourceAta,
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

    const transaction: Transaction = new Transaction();
    transaction.add(computeBudgetIx, transferIx);

    transaction.feePayer = walletPublicKey;
    transaction.recentBlockhash = (
      await tokenClient.provider.connection.getLatestBlockhash(commitment)
    ).blockhash;

    const signedTx = await SolanaProvider.signTransaction(
      solanaCtx,
      transaction
    );
    const rawTx = signedTx.serialize();

    return await tokenClient.provider.connection.sendRawTransaction(rawTx, {
      skipPreflight: true,
      preflightCommitment: commitment,
    });
  }

  public static async transferSol(
    ctx: SolanaContext,
    req: TransferSolRequest
  ): Promise<string> {
    const { walletPublicKey, tokenClient, commitment } = ctx;
    const tx = new Transaction();
    tx.add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(req.source),
        toPubkey: new PublicKey(req.destination),
        lamports: req.amount,
      })
    );
    tx.feePayer = walletPublicKey;
    tx.recentBlockhash = (
      await tokenClient.provider.connection.getLatestBlockhash(commitment)
    ).blockhash;
    const signedTx = await SolanaProvider.signTransaction(ctx, tx);
    const rawTx = signedTx.serialize();

    return await ctx.tokenClient.provider.connection.sendRawTransaction(rawTx, {
      skipPreflight: false,
      preflightCommitment: ctx.commitment,
    });
  }

  public static async wrapSol(
    ctx: SolanaContext,
    req: WrapSolRequest
  ): Promise<string> {
    const { destination, amount } = req;
    const rawTx = await generateWrapSolTx(ctx, destination, amount);
    return await ctx.tokenClient.provider.connection.sendRawTransaction(rawTx, {
      skipPreflight: false,
      preflightCommitment: ctx.commitment,
    });
  }

  public static async unwrapSol(
    ctx: SolanaContext,
    req: UnwrapSolRequest
  ): Promise<string> {
    const { destination, amount } = req;
    const rawTx = await generateUnwrapSolTx(ctx, destination, amount);
    return await ctx.tokenClient.provider.connection.sendRawTransaction(rawTx, {
      skipPreflight: false,
      preflightCommitment: ctx.commitment,
    });
  }

  public static async uninstallXnft(
    ctx: SolanaContext,
    req: DeleteInstallRequest
  ): Promise<string> {
    const client = xnftClient(ctx.tokenClient.provider);
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
    tx.recentBlockhash = (
      await ctx.connection.getLatestBlockhash(ctx.commitment)
    ).blockhash;
    const signedTx = await SolanaProvider.signTransaction(ctx, tx);
    const rawTx = signedTx.serialize();
    return await ctx.tokenClient.provider.connection.sendRawTransaction(rawTx, {
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
  const { walletPublicKey, tokenClient, commitment } = ctx;
  const destinationAta = associatedTokenAddress(NATIVE_MINT, destination);

  const [destinationAccount, destinationAtaAccount] =
    await anchor.utils.rpc.getMultipleAccounts(
      tokenClient.provider.connection,
      [destination, destinationAta],
      commitment
    );

  //
  // Require the account to either be a system program account or a brand new
  // account.
  //
  if (
    destinationAccount &&
    !destinationAccount.account.owner.equals(SystemProgram.programId)
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
        NATIVE_MINT
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
  tx.recentBlockhash = (
    await tokenClient.provider.connection.getLatestBlockhash(commitment)
  ).blockhash;
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
  const { walletPublicKey, tokenClient, commitment } = ctx;
  // Unwrapping partial SOL amounts appears to not be possible in token program.
  // This unwrap works by closing the account, and then creating a new wSOL account
  // and transferring the difference between the previous amount and the requested
  // amount into the newly created account.
  const destinationAta = associatedTokenAddress(NATIVE_MINT, destination);
  const sourceAta = associatedTokenAddress(NATIVE_MINT, walletPublicKey);

  const [destinationAccount, destinationAtaAccount] =
    await anchor.utils.rpc.getMultipleAccounts(
      tokenClient.provider.connection,
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
    !destinationAccount.account.owner.equals(SystemProgram.programId)
  ) {
    throw new Error("invalid account");
  }

  const tx = new Transaction();
  tx.feePayer = walletPublicKey;
  tx.recentBlockhash = (
    await tokenClient.provider.connection.getLatestBlockhash(commitment)
  ).blockhash;

  // recreate the account with the new balance
  if (destinationAtaAccount.account.lamports === lamports) {
    tx.instructions.push(
      createCloseAccountInstruction(destinationAta, destination, destination)
    );
  } else {
    const newAccount = Keypair.generate();
    const rentExemptionLamports = 2039280;
    // Create a new account to transfer wSOL into and then close
    tx.instructions.push(
      SystemProgram.createAccount({
        fromPubkey: walletPublicKey,
        newAccountPubkey: newAccount.publicKey,
        lamports: rentExemptionLamports,
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

export type TransferTokenRequest = {
  // SOL address.
  destination: PublicKey;
  mint: PublicKey;
  amount: number;
  decimals?: number;
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
  install: PublicKey;
};

export type BurnNftRequest = {
  solDestination: PublicKey;
  mint: PublicKey;
  amount?: number;
};
