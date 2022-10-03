import { selector, selectorFamily } from "recoil";
import { Blockchain } from "@coral-xyz/common";
import { solanaTokenBalance, solanaTokenAccountKeys } from "./solana/token";
import { ethereumTokenBalance } from "./ethereum/token";
import { ethereumTokenMetadata } from "./ethereum/token-metadata";
import { TokenData } from "../types";

/**
 * Return token balances sorted by usd notional balances.
 */
export const blockchainBalancesSorted = selectorFamily<
  Array<TokenData>,
  Blockchain
>({
  key: "blockchainBalancesSorted",
  get:
    (blockchain: Blockchain) =>
    ({ get }) => {
      const tokenAddresses = get(blockchainTokenAddresses(blockchain));
      const tokenData = tokenAddresses
        .map(
          (address) =>
            get(
              blockchainTokenData({
                address,
                blockchain,
              })
            )!
        )
        .filter(Boolean);
      return tokenData.sort((a, b) => b.usdBalance - a.usdBalance);
    },
});

/**
 * Returns token balance and pricing data for a given token address and blockchain.
 */
export const blockchainTokenData = selectorFamily<
  TokenData | null,
  { address: string; blockchain: Blockchain }
>({
  key: "blockchainTokenData",
  get:
    ({ address, blockchain }: { address: string; blockchain: Blockchain }) =>
    ({ get }) => {
      switch (blockchain) {
        case Blockchain.SOLANA:
          return get(solanaTokenBalance(address));
        case Blockchain.ETHEREUM:
          return get(ethereumTokenBalance(address));
        default:
          throw new Error(`unsupported blockchain: ${blockchain}`);
      }
    },
});

/**
 * Selects a blockchain token list based on a network string.
 */
export const blockchainTokenAddresses = selectorFamily({
  key: "blockchainTokenAddresses",
  get:
    (blockchain: Blockchain) =>
    ({ get }) => {
      switch (blockchain) {
        case Blockchain.SOLANA:
          return get(solanaTokenAccountKeys);
        case Blockchain.ETHEREUM:
          const ethTokenMetadata = get(ethereumTokenMetadata)();
          return ethTokenMetadata
            ? [...ethTokenMetadata.values()].map((t) => t.address)
            : [];
        default:
          throw new Error(`unsupported blockchain: ${blockchain}`);
      }
    },
});

/**
 * Total asset balance in USD, change in USD, and percent change for a given blockchain.
 */
export const blockchainTotalBalance = selectorFamily({
  key: "blockchainTotalBalance",
  get:
    (blockchain: Blockchain) =>
    ({ get }) => {
      const tokens = get(blockchainBalancesSorted(blockchain)).filter(
        (t) => t.usdBalance && t.recentUsdBalanceChange
      );
      const totalBalance = tokens
        .map((t) => t.usdBalance)
        .reduce((a, b) => a + b, 0);
      const totalChange = tokens
        .map((t) => t.recentUsdBalanceChange)
        .reduce((a, b) => a + b, 0);
      const oldBalance = totalBalance - totalChange;
      const percentChange = (totalChange / oldBalance) * 100;
      return {
        totalBalance: parseFloat(totalBalance.toFixed(2)),
        totalChange: parseFloat(totalChange.toFixed(2)),
        percentChange: parseFloat(percentChange.toFixed(2)),
      };
    },
});

/**
 * Total asset balance in USD, change in USD, and percent change for all blockchains.
 */
export const totalBalance = selector({
  key: "totalBalance",
  get: ({ get }) => {
    const solana = get(blockchainTotalBalance(Blockchain.SOLANA));
    const ethereum = get(blockchainTotalBalance(Blockchain.ETHEREUM));
    const totalBalance = solana.totalBalance + ethereum.totalBalance;
    const totalChange = solana.totalChange + ethereum.totalChange;
    const oldBalance = totalBalance - totalChange;
    const percentChange = (totalChange / oldBalance) * 100;
    return {
      totalBalance: parseFloat(totalBalance.toFixed(2)),
      totalChange: parseFloat(totalChange.toFixed(2)),
      percentChange: parseFloat(percentChange.toFixed(2)),
    };
  },
});
