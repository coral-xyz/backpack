import {
  ETH_NATIVE_MINT,
  fetchEthereumTokenBalances,
  toDisplayBalance,
} from "@coral-xyz/common";
import type { TokenInfo } from "@solana/spl-token-registry";
import { BigNumber, ethers } from "ethers";
import { atomFamily, selectorFamily } from "recoil";

import type { TokenDataWithBalance, TokenDataWithPrice } from "../../types";
import { ethereumPrice, pricesForErc20Addresses } from "../prices";

import { ethereumConnectionUrl } from "./preferences";
import { ethersContext } from "./provider";
import { ethereumTokenMetadata } from "./token-metadata";

// Map of ETH native balance and all ERC20 balances
// We use a dummy address for the ETH balance (zero address) so it can be
// treated like an ERC20 in state.
export const ethereumBalances = atomFamily<
  Map<string, BigNumber>,
  { connectionUrl: string; publicKey: string }
>({
  key: "ethereumBalances",
  default: selectorFamily({
    key: "ethereumBalancesDefault",
    get:
      ({
        connectionUrl,
        publicKey,
      }: {
        connectionUrl: string;
        publicKey: string;
      }) =>
      ({ get }: any) => {
        const balanceMap = get(erc20Balances({ publicKey }));
        // Add ETH balance at dummy address
        balanceMap.set(ETH_NATIVE_MINT, get(ethBalance({ publicKey })));
        return balanceMap;
      },
  }),
});

// Native ETH balance
export const ethBalance = atomFamily<BigNumber, { publicKey: string }>({
  key: "ethBalance",
  default: selectorFamily({
    key: "ethereumBalanceDefault",
    get:
      ({ publicKey }) =>
      ({ get }: any) => {
        const provider = get(ethersContext).provider;
        return provider.getBalance(publicKey);
      },
  }),
});

// ERC20 Token Balances
export const erc20Balances = selectorFamily<
  Map<string, any>,
  { publicKey: string }
>({
  key: "erc20Balances",
  get:
    ({ publicKey }) =>
    async ({ get }: any) => {
      const provider = get(ethersContext).provider;
      return await fetchEthereumTokenBalances(provider, publicKey);
    },
});

export const ethereumTokenNativeBalance = selectorFamily<
  TokenDataWithBalance | null,
  { publicKey: string; tokenAddress: string }
>({
  key: "ethereumTokenNativeBalance",
  get:
    ({ publicKey, tokenAddress }) =>
    ({ get }) => {
      const contractAddress = tokenAddress;
      const connectionUrl = get(ethereumConnectionUrl);
      const ethTokenMetadata = get(ethereumTokenMetadata)();
      const ethTokenBalances: Map<String, BigNumber> = get(
        ethereumBalances({ connectionUrl, publicKey })
      );

      const tokenMetadata =
        ethTokenMetadata!.get(contractAddress) ?? ({} as TokenInfo);
      const { symbol: ticker, logoURI: logo, name, decimals } = tokenMetadata;

      const nativeBalance = ethTokenBalances.get(contractAddress)
        ? BigNumber.from(ethTokenBalances.get(contractAddress))
        : BigNumber.from(0);
      const displayBalance = toDisplayBalance(nativeBalance, decimals);

      return {
        name,
        decimals,
        nativeBalance,
        displayBalance,
        ticker,
        logo,
        address: contractAddress,
      };
    },
});

export const ethereumTokenBalance = selectorFamily<
  TokenDataWithPrice | null,
  { publicKey: string; tokenAddress: string }
>({
  key: "ethereumTokenBalance",
  get:
    ({ publicKey, tokenAddress }) =>
    ({ get }) => {
      const contractAddress = tokenAddress;
      const nativeTokenBalance = get(
        ethereumTokenNativeBalance({ publicKey, tokenAddress })
      );
      if (!nativeTokenBalance) {
        return null;
      }

      const price =
        contractAddress === ETH_NATIVE_MINT
          ? get(ethereumPrice)
          : (get(pricesForErc20Addresses({ publicKey })).get(
              contractAddress
            ) as any);

      const usdBalance =
        (price?.usd ?? 0) *
        parseFloat(
          ethers.utils.formatUnits(
            nativeTokenBalance.nativeBalance,
            nativeTokenBalance.decimals
          )
        );

      const recentPercentChange = parseFloat(
        (price?.usd_24h_change ?? 0).toFixed(2)
      );

      const oldUsdBalance =
        usdBalance === 0
          ? 0
          : usdBalance - usdBalance * (recentPercentChange / 100);

      const recentUsdBalanceChange = usdBalance - oldUsdBalance;

      return {
        ...nativeTokenBalance,
        usdBalance,
        recentPercentChange,
        recentUsdBalanceChange,
        priceData: price,
      };
    },
});
