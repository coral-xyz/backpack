import { selector, selectorFamily } from "recoil";
import { Blockchain } from "@coral-xyz/common";
import {
  solanaTokenBalance,
  solanaTokenAccountKeys,
  solanaTokenNativeBalance,
} from "./solana/token";
import {
  ethereumTokenNativeBalance,
  ethereumTokenBalance,
} from "./ethereum/token";
import { ethereumTokenMetadata } from "./ethereum/token-metadata";
import { TokenData, TokenNativeData } from "../types";
import { enabledBlockchains } from "./blockchain";

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
 * Return native token balances (without their price information)
 */
export const blockchainNativeBalances = selectorFamily<
  Array<TokenNativeData>,
  Blockchain
>({
  key: "blockchainNativeBalances",
  get:
    (blockchain: Blockchain) =>
    ({ get }) => {
      const tokenAddresses = get(blockchainTokenAddresses(blockchain));
      return tokenAddresses
        .map(
          (address) =>
            get(
              blockchainTokenNativeData({
                address,
                blockchain,
              })
            )!
        )
        .filter(Boolean);
    },
});

/**
 * Returns token balances but not the price information for a given token address and blockchain.
 */
export const blockchainTokenNativeData = selectorFamily<
  TokenNativeData | null,
  { address: string; blockchain: Blockchain }
>({
  key: "blockchainTokenNativeData",
  get:
    ({ address, blockchain }: { address: string; blockchain: Blockchain }) =>
    ({ get }) => {
      switch (blockchain) {
        case Blockchain.SOLANA:
          return get(solanaTokenNativeBalance(address));
        case Blockchain.ETHEREUM:
          return get(ethereumTokenNativeBalance(address));
        default:
          throw new Error(`unsupported blockchain: ${blockchain}`);
      }
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
    const totals = get(enabledBlockchains).reduce(
      (
        acc: { totalBalance: number; totalChange: number },
        blockchain: Blockchain
      ) => {
        const total = get(blockchainTotalBalance(blockchain));
        return {
          totalBalance: acc.totalBalance + total.totalBalance,
          totalChange: acc.totalChange + total.totalChange,
        };
      },
      {
        totalBalance: 0.0,
        totalChange: 0.0,
      }
    );
    const oldBalance = totals.totalBalance - totals.totalChange;
    const percentChange = (totals.totalChange / oldBalance) * 100;
    return {
      totalBalance: parseFloat(totals.totalBalance.toFixed(2)),
      totalChange: parseFloat(totals.totalChange.toFixed(2)),
      percentChange: parseFloat(percentChange.toFixed(2)),
    };
  },
});
