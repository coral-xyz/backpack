import { CoinGecko, type CoinGeckoPriceData } from "./clients/coingecko";
import { Helius } from "./clients/helius";
import {
  ChainId,
  type QueryResolvers,
  type TokenBalance,
  type WalletBalances,
} from "./types";

export const queryResolver: QueryResolvers = {
  async balances(_, { chainId, address }): Promise<WalletBalances | null> {
    switch (chainId) {
      case ChainId.Ethereum: {
        return null;
      }

      case ChainId.Solana: {
        const balances = await Helius.getBalances(address);
        const nonNftMints = balances.tokens.reduce<string[]>((acc, curr) => {
          if (curr.amount === 1 && curr.decimals === 0) return acc;
          return [...acc, curr.mint];
        }, []);

        const legacy = await Helius.getLegacyMetadata(nonNftMints);
        const ids = [...legacy.values()].map((v) => v.id);
        const prices = await CoinGecko.getPrices(["solana", ...ids]);

        const nativeData: TokenBalance = {
          address,
          amount: balances.nativeBalance,
          decimals: 9,
          displayAmount: (balances.nativeBalance / 10 ** 9).toString(),
          marketData: {
            id: "solana",
            change: prices.solana.usd_24h_change,
            lastUpdatedAt: prices.solana.last_updated_at,
            logo: "", // FIXME:
            price: prices.solana.usd,
            value: (balances.nativeBalance / 10 ** 9) * prices.solana.usd,
          },
          mint: "11111111111111111111111111111111",
        };

        const splTokenData = balances.tokens.map((t): TokenBalance => {
          const meta = legacy.get(t.mint);
          const p: CoinGeckoPriceData | null = prices[meta?.id ?? ""] ?? null;
          return {
            address: t.tokenAccount,
            amount: t.amount,
            decimals: t.decimals,
            displayAmount: (t.amount / 10 ** t.decimals).toString(),
            marketData:
              p && meta
                ? {
                    id: meta.id,
                    change: p.usd_24h_change,
                    lastUpdatedAt: p.last_updated_at,
                    logo: meta.logo,
                    price: p.usd,
                    value: (t.amount / 10 ** t.decimals) * p.usd,
                  }
                : null,
            mint: t.mint,
          };
        });

        const splTokenValueSum = splTokenData.reduce(
          (acc, curr) => (curr.marketData ? acc + curr.marketData.value : acc),
          0
        );

        return {
          aggregateValue: nativeData.marketData!.value + splTokenValueSum,
          native: nativeData,
          tokens: splTokenData,
        };
      }
    }
  },
};
