import { selector, selectorFamily } from "recoil";
import { Blockchain } from "@coral-xyz/common";
import { blockchainKeys } from "./blockchains";
import { blockchainTokensSorted } from "./solana/token";

export const total = selector({
  key: "total",
  get: ({ get }) => {
    const blockchains = get(blockchainKeys);
    const total = blockchains.map((b) => get(blockchainTotal(b)));
    const totalBalance = total
      .map((t) => t.totalBalance)
      .reduce((a, b) => a + b);
    const totalChange = total.map((t) => t.totalChange).reduce((a, b) => a + b);
    const oldBalance = totalBalance - totalChange;
    const percentChange = totalChange / oldBalance;
    return {
      totalBalance: parseFloat(totalBalance.toFixed(2)),
      totalChange: parseFloat(totalChange.toFixed(2)),
      percentChange: parseFloat(percentChange.toFixed(2)),
    };
  },
});

export const blockchainTotal = selectorFamily({
  key: "blockchainTotal",
  get:
    (blockchain: Blockchain) =>
    ({ get }) => {
      const tokens = get(blockchainTokensSorted(blockchain)).filter(
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
