import type { Transaction, TransactionSignature } from "@solana/web3.js";
import * as bs58 from "bs58";

import {
  UI_RPC_METHOD_SOLANA_SIGN_ALL_TRANSACTIONS,
  UI_RPC_METHOD_SOLANA_SIGN_AND_SEND_TRANSACTION,
  UI_RPC_METHOD_SOLANA_SIGN_TRANSACTION,
} from "../constants";

import type { SolanaContext } from ".";

// Provider api used by the app UI. Spiritually the same as the injected
// provider with a slightly different API. Eventually it would be nice to
// combine the two.
export class SolanaProvider {
  public static async signTransaction(
    ctx: SolanaContext,
    tx: Transaction
  ): Promise<Transaction> {
    const { walletPublicKey, backgroundClient } = ctx;
    const txStr = bs58.encode(tx.serialize({ requireAllSignatures: false }));
    const respSignature = await backgroundClient.request({
      method: UI_RPC_METHOD_SOLANA_SIGN_TRANSACTION,
      params: [txStr, walletPublicKey.toString()],
    });
    tx.addSignature(walletPublicKey, Buffer.from(bs58.decode(respSignature)));
    return tx;
  }

  public static async signAllTransactions(
    ctx: SolanaContext,
    txs: Transaction[]
  ): Promise<Transaction[]> {
    const { walletPublicKey } = ctx;
    // Serialize messages.
    const txStrs = txs.map((tx) => {
      return bs58.encode(tx.serialize({ requireAllSignatures: false }));
    });

    // Get signatures from the background script.
    const signatures: Array<string> = await ctx.backgroundClient.request({
      method: UI_RPC_METHOD_SOLANA_SIGN_ALL_TRANSACTIONS,
      params: [txStrs, walletPublicKey.toString()],
    });

    // Add the signatures to the transactions.
    txs.forEach((t, idx) => {
      t.addSignature(
        walletPublicKey,
        Buffer.from(bs58.decode(signatures[idx]))
      );
    });

    // Done.
    return txs;
  }

  public static async signAndSendTransaction(
    ctx: SolanaContext,
    tx: Transaction
  ): Promise<TransactionSignature> {
    const { walletPublicKey, connection, commitment, backgroundClient } = ctx;

    tx.feePayer = walletPublicKey;
    tx.recentBlockhash = (
      await connection.getLatestBlockhash(commitment)
    ).blockhash;
    const txSerialize = tx.serialize({
      requireAllSignatures: false,
    });
    const message = bs58.encode(txSerialize);

    const sig = await backgroundClient.request({
      method: UI_RPC_METHOD_SOLANA_SIGN_AND_SEND_TRANSACTION,
      params: [message, walletPublicKey!.toString()],
    });

    return sig;
  }
}
