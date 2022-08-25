import { atomFamily, selectorFamily } from "recoil";
import { ethers, BigNumber } from "ethers";
import { TokenInfo } from "@solana/spl-token-registry";
import { ethereumBalances, Blockchain } from "@coral-xyz/common";
import { ethersContext } from "./provider";
import { bootstrap } from "../bootstrap";
import { TokenData } from "../../types";
import { priceData } from "../prices";
import { blockchainTokenAddresses } from "../balance";

export const ethereumTokenBalance = selectorFamily<TokenData | null, string>({
  key: "ethereumTokenBalance",
  get:
    (contractAddress: string) =>
    ({ get }) => {
      const data = get(bootstrap);

      const tokenMetadata =
        data.ethTokenMetadata.get(contractAddress) ?? ({} as TokenInfo);
      const { symbol: ticker, logoURI: logo, name, decimals } = tokenMetadata;

      const nativeBalance = data.ethTokenBalances.get(contractAddress)
        ? BigNumber.from(data.ethTokenBalances.get(contractAddress))
        : BigNumber.from(0);
      const displayBalance = ethers.utils.formatUnits(nativeBalance, decimals);

      const price = get(priceData(contractAddress)) as any;
      const usdBalance =
        price && price.usd ? price.usd * parseFloat(displayBalance) : 0;
      const oldUsdBalance =
        usdBalance === 0 ? 0 : usdBalance / (1 + price.usd_24h_change);
      const recentUsdBalanceChange =
        (usdBalance - oldUsdBalance) / oldUsdBalance;
      const recentPercentChange = price
        ? parseFloat(price.usd_24h_change.toFixed(2))
        : undefined;

      return {
        name,
        decimals,
        nativeBalance,
        displayBalance,
        ticker,
        logo,
        address: contractAddress,
        usdBalance,
        recentPercentChange,
        recentUsdBalanceChange,
      } as TokenData;
    },
});

export const ethereumTokenBalances = atomFamily<
  Map<string, BigNumber>,
  { connectionUrl: string; publicKey: string }
>({
  key: "ethereumTokenBalances",
  default: selectorFamily({
    key: "ethereumTokenBalancesDefault",
    get:
      ({
        connectionUrl,
        publicKey,
      }: {
        connectionUrl: string;
        publicKey: string;
      }) =>
      async ({ get }) => {
        const provider = get(ethersContext).provider;
        return ethereumBalances(provider, publicKey);
      },
  }),
});
