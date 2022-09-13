import { atomFamily, selectorFamily } from "recoil";
import { ethers, BigNumber } from "ethers";
import { TokenInfo } from "@solana/spl-token-registry";
import { bootstrap } from "../bootstrap";
import { TokenData } from "../../types";
import { priceData } from "../prices";
import { ethereumTokenMetadata } from "./token-metadata";
import { ethereumConnectionUrl } from "./preferences";
import { ethereumPublicKey } from "../wallet";

export const ethereumTokenBalance = selectorFamily<TokenData | null, string>({
  key: "ethereumTokenBalance",
  get:
    (contractAddress: string) =>
    ({ get }) => {
      const ethTokenMetadata = get(ethereumTokenMetadata);
      const ethTokenBalances: Map<String, BigNumber> = get(
        ethereumTokenBalances({
          connectionUrl: get(ethereumConnectionUrl)!,
          publicKey: get(ethereumPublicKey)!,
        })
      );

      const tokenMetadata =
        ethTokenMetadata!.get(contractAddress) ?? ({} as TokenInfo);
      const { symbol: ticker, logoURI: logo, name, decimals } = tokenMetadata;

      const nativeBalance = ethTokenBalances.get(contractAddress)
        ? BigNumber.from(ethTokenBalances.get(contractAddress))
        : BigNumber.from(0);
      const displayBalance = ethers.utils.formatUnits(nativeBalance, decimals);

      const price = get(priceData(contractAddress)) as any;
      const usdBalance =
        price && price.usd ? price.usd * parseFloat(displayBalance) : 0;
      const oldUsdBalance =
        usdBalance === 0 ? 0 : usdBalance / (1 + price.usd_24h_change);
      const recentUsdBalanceChange =
        (usdBalance - oldUsdBalance) / oldUsdBalance;
      const recentPercentChange =
        price && price.usd_24h_change
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
        const data = get(bootstrap);
        return data.ethTokenBalances;
      },
  }),
});
