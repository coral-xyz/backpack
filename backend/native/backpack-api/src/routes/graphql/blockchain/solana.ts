import { SystemProgram } from "@solana/web3.js";

import { CoinGecko, type CoinGeckoPriceData } from "../clients/coingecko";
import { Helius } from "../clients/helius";
import { ChainId, type TokenBalance, type WalletBalances } from "../types";

import { type Blockchain, toBalance } from ".";

export class Solana implements Blockchain {
  constructor() {}

  async getBalancesForAddress(address: string): Promise<WalletBalances | null> {
    const balances = await Helius.getBalances(address);
    const nonEmptyOrNftTokens = balances.tokens.filter(
      (t) => t.amount > 0 && !(t.amount === 1 && t.decimals === 0)
    );

    const nonNftMints = nonEmptyOrNftTokens.map((t) => t.mint);
    const legacy = await Helius.getLegacyMetadata(nonNftMints);
    const ids = [...legacy.values()].map((v) => v.id);
    const prices = await CoinGecko.getPrices(["solana", ...ids]);

    const nativeData: TokenBalance = {
      address,
      amount: balances.nativeBalance,
      decimals: this.nativeDecimals(),
      displayAmount: toBalance(
        balances.nativeBalance,
        this.nativeDecimals()
      ).toString(),
      marketData: {
        id: "solana",
        change: prices.solana.usd_24h_change,
        lastUpdatedAt: prices.solana.last_updated_at,
        logo: "", // FIXME:
        price: prices.solana.usd,
        value:
          toBalance(balances.nativeBalance, this.nativeDecimals()) *
          prices.solana.usd,
      },
      mint: SystemProgram.programId.toBase58(),
    };

    const splTokenData = nonEmptyOrNftTokens.map((t): TokenBalance => {
      const meta = legacy.get(t.mint);
      const p: CoinGeckoPriceData | null = prices[meta?.id ?? ""] ?? null;
      return {
        address: t.tokenAccount,
        amount: t.amount,
        decimals: t.decimals,
        displayAmount: toBalance(t.amount, t.decimals).toString(),
        marketData:
          p && meta
            ? {
                id: meta.id,
                change: p.usd_24h_change,
                lastUpdatedAt: p.last_updated_at,
                logo: meta.logo,
                price: p.usd,
                value: toBalance(t.amount, t.decimals) * p.usd,
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

  id(): ChainId {
    return ChainId.Solana;
  }

  nativeDecimals(): number {
    return 9;
  }
}
