import { selectorFamily } from "recoil";
import { Blockchain } from "@coral-xyz/common";
import { solanaTokenBalance, solanaTokenAccountKeys } from "./solana/token";
import { solanaConnectionUrl } from "./solana";
import { ethereumTokenBalance } from "./ethereum/token";
import { ethereumTokenMetadata } from "./ethereum/token-metadata";
import { activeWallet } from "./wallet";
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
          throw new Error("invariant violation");
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
          return get(
            solanaTokenAccountKeys({
              connectionUrl: get(solanaConnectionUrl)!,
              publicKey: get(activeWallet),
            })
          );
        case Blockchain.ETHEREUM:
          const ethTokenMetadata = get(ethereumTokenMetadata);
          return [...ethTokenMetadata.values()].map((t) => t.address);
        default:
          throw new Error("invariant violation");
      }
    },
});

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
      const percentChange = totalChange / oldBalance;
      return {
        totalBalance: parseFloat(totalBalance.toFixed(2)),
        totalChange: parseFloat(totalChange.toFixed(2)),
        percentChange: parseFloat(percentChange.toFixed(2)),
      };
    },
});
