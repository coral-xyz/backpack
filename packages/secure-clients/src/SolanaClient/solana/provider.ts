import { getLogger } from "@coral-xyz/common";
import type { SecureEvent } from "@coral-xyz/secure-background/types";
import type {
  PublicKey,
  Transaction,
  TransactionSignature,
  VersionedTransaction,
} from "@solana/web3.js";

import type { SolanaClient } from "../SolanaClient";

import type { SolanaContext } from ".";

// Provider api used by the app UI. Spiritually the same as the injected
// provider with a slightly different API. Eventually it would be nice to
// combine the two.
export class SolanaProvider {
  public static async signTransaction(
    ctx: {
      walletPublicKey: PublicKey;
      solanaClient: SolanaClient | null;
    },
    tx: Transaction,
    uiOptions: SecureEvent<"SECURE_SVM_SIGN_TX">["uiOptions"]
  ): Promise<Transaction> {
    const { walletPublicKey, solanaClient } = ctx;
    const signedTx = await solanaClient!.wallet.signTransaction(
      {
        publicKey: walletPublicKey,
        tx,
      },
      uiOptions
    );
    return signedTx;
  }

  // public static async signAllTransactions(
  //   ctx: SolanaContext,
  //   txs: Transaction[]
  // ): Promise<Transaction[]> {
  //   const { walletPublicKey, solanaClient } = ctx;

  //   const signedTxs = await solanaClient!.signAllTransactions({
  //     publicKey: walletPublicKey,
  //     txs,
  //   });
  //   return signedTxs;
  // }

  public static async signAndSendTransaction(
    ctx: SolanaContext,
    tx: Transaction | VersionedTransaction,
    uiOptions?: SecureEvent<"SECURE_SVM_SIGN_TX">["uiOptions"]
  ): Promise<TransactionSignature> {
    const { walletPublicKey, solanaClient } = ctx;

    const sig = await solanaClient!.wallet.send(
      {
        publicKey: walletPublicKey,
        tx,
      },
      uiOptions
    );

    return sig;
  }
}
