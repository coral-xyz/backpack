import * as bs58 from "bs58";
import BN from "bn.js";
import {
  Commitment,
  Blockhash,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
} from "@solana/web3.js";
import { Token } from "@solana/spl-token";
import { TokenInfo } from "@solana/spl-token-registry";
import { Program, SplToken } from "@project-serum/anchor";
import * as anchor from "@project-serum/anchor";
import { associatedTokenAddress } from "./programs/token";
import * as assertOwner from "./programs/assert-owner";
import { UI_RPC_METHOD_SIGN_TRANSACTION } from "../../common";
import { getBackgroundClient } from "../../background/client";

// API for performing solana actions.
export class Solana {
  public static async transferToken(
    ctx: SolanaContext,
    req: TransferTokenRequest
  ): Promise<string> {
    const {
      walletPublicKey,
      registry,
      recentBlockhash,
      tokenClient,
      commitment,
    } = ctx;
    const { mint, destination, amount } = req;

    const tokenInfo = registry.get(mint.toString());
    if (!tokenInfo) {
      throw new Error("no token info found");
    }
    const decimals = tokenInfo.decimals;
    const nativeAmount = new BN(amount * 10 ** decimals);

    const destinationAta = associatedTokenAddress(mint, destination);
    const sourceAta = associatedTokenAddress(mint, walletPublicKey);

    const [destinationAccount, destinationAtaAccount] =
      await anchor.utils.rpc.getMultipleAccounts(
        tokenClient.provider.connection,
        [destination, destinationAta],
        commitment
      );

    //
    // Require the count to either be a system program account or a brand new
    // account.
    //
    if (
      destinationAccount &&
      !destinationAccount.account.owner.equals(SystemProgram.programId)
    ) {
      throw new Error("invalid account");
    }

    // Instructions to execute prior to the transfer.
    let preInstructions: Array<TransactionInstruction> = [];
    if (!destinationAtaAccount) {
      preInstructions.push(
        assertOwner.assertOwnerInstruction({
          account: destination,
          owner: SystemProgram.programId,
        })
      );
      preInstructions.push(
        Token.createAssociatedTokenAccountInstruction(
          anchor.utils.token.ASSOCIATED_PROGRAM_ID,
          anchor.utils.token.TOKEN_PROGRAM_ID,
          mint,
          destinationAta,
          destination,
          walletPublicKey
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
    tx.recentBlockhash = recentBlockhash;
    const signedTx = await Solana.signTransaction(ctx, tx);
    const rawTx = signedTx.serialize();

    return await tokenClient.provider.connection.sendRawTransaction(rawTx, {
      skipPreflight: false,
      preflightCommitment: commitment,
    });
  }

  public static async transferSol(
    ctx: SolanaContext,
    req: TransferSolRequest
  ): Promise<string> {
    const { walletPublicKey } = ctx;
    const tx = new Transaction();
    tx.add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(req.source),
        toPubkey: new PublicKey(req.destination),
        lamports: req.amount * 10 ** 9,
      })
    );
    tx.feePayer = walletPublicKey;
    tx.recentBlockhash = ctx.recentBlockhash;
    const signedTx = await Solana.signTransaction(ctx, tx);
    const rawTx = signedTx.serialize();

    return await ctx.tokenClient.provider.connection.sendRawTransaction(rawTx, {
      skipPreflight: false,
      preflightCommitment: ctx.commitment,
    });
  }

  private static async signTransaction(
    ctx: SolanaContext,
    tx: Transaction
  ): Promise<Transaction> {
    const { walletPublicKey } = ctx;
    const txSerialized = tx.serializeMessage();
    const message = bs58.encode(txSerialized);
    const background = getBackgroundClient();
    const respSignature = await background.request({
      method: UI_RPC_METHOD_SIGN_TRANSACTION,
      params: [message, walletPublicKey.toString()],
    });
    tx.addSignature(walletPublicKey, Buffer.from(bs58.decode(respSignature)));
    return tx;
  }
}

export type TransferTokenRequest = {
  // SOL address.
  destination: PublicKey;
  mint: PublicKey;
  amount: number;
};

export type TransferSolRequest = {
  // SOL address.
  source: string;
  // SOL address.
  destination: string;
  //
  amount: number;
};

export type SolanaContext = {
  walletPublicKey: PublicKey;
  recentBlockhash: Blockhash;
  tokenClient: Program<SplToken>;
  registry: Map<string, TokenInfo>;
  commitment: Commitment;
};
