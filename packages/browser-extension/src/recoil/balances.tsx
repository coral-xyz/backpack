import { selector, selectorFamily } from "recoil";
import { blockchainKeys } from "./blockchains";
import { blockchainTokensSorted } from "./token";

export const total = selector({
  key: "total",
  get: ({ get }: any) => {
    const blockchains = get(blockchainKeys);
    const total = blockchains.map((b: string) => get(blockchainTotal(b)));
    // @ts-ignore
    const totalBalance = total
      .map((t: any) => t.totalBalance)
      .reduce((a: number, b: number) => a + b);
    // @ts-ignore
    const totalChange = total
      .map((t: any) => t.totalChange)
      .reduce((a: number, b: number) => a + b);
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
    (blockchain: string) =>
    ({ get }: any) => {
      const tokens = get(blockchainTokensSorted(blockchain)).filter(
        (t: any) => t.usdBalance && t.recentUsdBalanceChange
      );

      // @ts-ignore
      const totalBalance = tokens
        // @ts-ignore
        .map((t) => t.usdBalance)
        // @ts-ignore
        .reduce((a, b) => a + b, 0);
      // @ts-ignore
      const totalChange = tokens
        // @ts-ignore
        .map((t) => t.recentUsdBalanceChange)
        // @ts-ignore
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
