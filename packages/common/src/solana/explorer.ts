import * as path from "path";

export const SolanaExplorer = {
  SOLANA_EXPLORER: "https://explorer.solana.com/",
  SOLSCAN: "https://solscan.io/",
  SOLANA_BEACH: "https://solanabeach.io/",

  DEFAULT: "https://solscan.io/",
};

export function explorerUrl(base: string, tx: string): string {
  switch (base) {
    case SolanaExplorer.SOLANA_EXPLORER:
      return path.join(SolanaExplorer.SOLANA_EXPLORER, `tx/${tx}`);
    case SolanaExplorer.SOLSCAN:
      return path.join(SolanaExplorer.SOLSCAN, `tx/${tx}`);
    case SolanaExplorer.SOLANA_BEACH:
      return path.join(SolanaExplorer.SOLANA_BEACH, `transaction/${tx}`);
    default:
      throw new Error("unknown explorer base");
  }
}
