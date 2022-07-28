export const SolanaExplorer = {
  SOLANA_EXPLORER: "https://explorer.solana.com",
  SOLSCAN: "https://solscan.io",
  SOLANA_BEACH: "https://solanabeach.io",
  SOLANA_FM: "https://solana.fm",

  DEFAULT: "https://solscan.io",
};

export function explorerUrl(base: string, tx: string): string {
  switch (base) {
    case SolanaExplorer.SOLANA_EXPLORER:
      return join(SolanaExplorer.SOLANA_EXPLORER, `tx/${tx}`);
    case SolanaExplorer.SOLSCAN:
      return join(SolanaExplorer.SOLSCAN, `tx/${tx}`);
    case SolanaExplorer.SOLANA_BEACH:
      return join(SolanaExplorer.SOLANA_BEACH, `transaction/${tx}`);
    case SolanaExplorer.SOLANA_FM:
      return join(SolanaExplorer.SOLANA_FM, `tx/${tx}`);
    default:
      throw new Error("unknown explorer base");
  }
}

const join = (...args: Array<string>) => args.join("/");
