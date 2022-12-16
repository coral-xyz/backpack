import { Blockchain } from "@coral-xyz/common";
import { selector, selectorFamily } from "recoil";

import type { TokenData, TokenNativeData } from "../types";

import {
  ethereumTokenBalance,
  ethereumTokenNativeBalance,
} from "./ethereum/token";
import { ethereumTokenMetadata } from "./ethereum/token-metadata";
import {
  solanaFungibleTokenAccountKeys,
  solanaFungibleTokenBalance,
  solanaFungibleTokenNativeBalance,
} from "./solana/token";
import { enabledBlockchains } from "./preferences";
import { ethereumPublicKey, solanaPublicKey } from "./wallet";

/**
 * Return token balances sorted by usd notional balances.
 */
export const blockchainBalancesSorted = selectorFamily<
  Array<TokenData>,
  { publicKey: string; blockchain: Blockchain }
>({
  key: "blockchainBalancesSorted",
  get:
    ({ publicKey, blockchain }) =>
    ({ get }) => {
      const tokenAddresses = get(
        blockchainTokenAddresses({ publicKey, blockchain })
      );
      const tokenData = tokenAddresses
        .map(
          (tokenAddress) =>
            get(
              blockchainTokenData({
                publicKey,
                tokenAddress,
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
  { blockchain: Blockchain; publicKey: string }
>({
  key: "blockchainNativeBalances",
  get:
    ({ blockchain, publicKey }) =>
    ({ get }) => {
      const tokenAddresses = get(
        blockchainTokenAddresses({ publicKey, blockchain })
      );
      return tokenAddresses
        .map(
          (tokenAddress) =>
            get(
              blockchainTokenNativeData({
                publicKey,
                tokenAddress,
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
  { publicKey: string; tokenAddress: string; blockchain: Blockchain }
>({
  key: "blockchainTokenNativeData",
  get:
    ({ publicKey, tokenAddress, blockchain }) =>
    ({ get }) => {
      switch (blockchain) {
        case Blockchain.SOLANA:
          return get(
            solanaFungibleTokenNativeBalance({ tokenAddress, publicKey })
          );
        case Blockchain.ETHEREUM:
          return get(ethereumTokenNativeBalance(tokenAddress));
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
  { publicKey: string; tokenAddress: string; blockchain: Blockchain }
>({
  key: "blockchainTokenData",
  get:
    ({ publicKey, tokenAddress, blockchain }) =>
    ({ get }) => {
      switch (blockchain) {
        case Blockchain.SOLANA:
          return get(solanaFungibleTokenBalance({ publicKey, tokenAddress }));
        case Blockchain.ETHEREUM:
          return get(ethereumTokenBalance(tokenAddress));
        default:
          throw new Error(`unsupported blockchain: ${blockchain}`);
      }
    },
});

/**
 * Selects a blockchain token list based on a network string.
 */
export const blockchainTokenAddresses = selectorFamily<
  any,
  { publicKey: string; blockchain: Blockchain }
>({
  key: "blockchainTokenAddresses",
  get:
    ({ publicKey, blockchain }) =>
    ({ get }) => {
      switch (blockchain) {
        case Blockchain.SOLANA:
          return get(solanaFungibleTokenAccountKeys(publicKey));
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
export const blockchainTotalBalance = selectorFamily<
  { totalBalance: number; totalChange: number; percentChange: number },
  { publicKey: string; blockchain: Blockchain }
>({
  key: "blockchainTotalBalance",
  get:
    ({ publicKey, blockchain }) =>
    ({ get }) => {
      const tokens = get(
        blockchainBalancesSorted({ publicKey, blockchain })
      ).filter((t) => t.usdBalance && t.recentUsdBalanceChange);
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
        let publicKey: string;
        if (blockchain === Blockchain.SOLANA) {
          publicKey = get(solanaPublicKey)!;
        } else {
          publicKey = get(ethereumPublicKey)!;
        }
        const total = get(blockchainTotalBalance({ publicKey, blockchain }));
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
