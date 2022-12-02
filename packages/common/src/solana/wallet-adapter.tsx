import type { SendTransactionOptions } from "@solana/wallet-adapter-base";
import type {
  Connection,
  PublicKey,
  Signer,
  Transaction,
  TransactionSignature,
} from "@solana/web3.js";

import type { SolanaContext } from ".";
import { SolanaProvider } from "./provider";

// Exposes a variant of the `@solana/wallet-adapter` interface (for jupiter).
export class SolanaWalletAdapter {
  constructor(readonly publicKey: PublicKey) {}

  // @override
  async sendTransaction(
    tx: Transaction,
    connection: Connection,
    options?: SendTransactionOptions
  ): Promise<TransactionSignature> {
    if (options?.signers) {
      options?.signers.forEach((s: Signer) => {
        tx.partialSign(s);
      });
    }
    const ctx = {
      walletPublicKey: this.publicKey,
      connection,
    } as SolanaContext;
    return await SolanaProvider.signAndSendTransaction(ctx, tx);
  }

  // @override
  async signTransaction(tx: Transaction): Promise<Transaction> {
    const ctx = { walletPublicKey: this.publicKey } as SolanaContext;
    return await SolanaProvider.signTransaction(ctx, tx);
  }

  // @override
  async signAllTransactions(txs: Transaction[]): Promise<Transaction[]> {
    const ctx = { walletPublicKey: this.publicKey } as SolanaContext;
    return await SolanaProvider.signAllTransactions(ctx, txs);
  }
}
