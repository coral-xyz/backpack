import { atom, atomFamily, selector, selectorFamily } from "recoil";
import { ethers, BigNumber } from "ethers";
import { TokenInfo } from "@solana/spl-token-registry";
import { fetchEthereumTokenBalances, ETH_NATIVE_MINT } from "@coral-xyz/common";
import { TokenData } from "../../types";
import { priceData } from "../prices";
import { ethereumPublicKey } from "../wallet";
import { ethersContext } from "./provider";
import { ethereumTokenMetadata } from "./token-metadata";
import { ethereumConnectionUrl } from "./preferences";

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
        const balanceMap = get(erc20Balances);
        // Add ETH balance at dummy address
        balanceMap.set(ETH_NATIVE_MINT, get(ethBalance));
        return balanceMap;
      },
  }),
});

// Native ETH balance
export const ethBalance = atom<BigNumber>({
  key: "ethereumBalance",
  default: selector({
    key: "ethereumBalanceDefault",
    get: ({ get }: any) => {
      const publicKey = get(ethereumPublicKey);
      if (!publicKey) return BigNumber.from(0);
      const provider = get(ethersContext).provider;
      return provider.getBalance(publicKey);
    },
  }),
});

// ERC20 Token Balances
export const erc20Balances = selector({
  key: "ethereumTokenBalances",
  get: async ({ get }: any) => {
    const publicKey = get(ethereumPublicKey);
    if (!publicKey) {
      return new Map();
    }
    const provider = get(ethersContext).provider;
    return await fetchEthereumTokenBalances(provider, publicKey);
  },
});

export const ethereumTokenBalance = selectorFamily<TokenData | null, string>({
  key: "ethereumTokenBalance",
  get:
    (contractAddress: string) =>
    ({ get }) => {
      const publicKey = get(ethereumPublicKey);
      const connectionUrl = get(ethereumConnectionUrl);
      const ethTokenMetadata = get(ethereumTokenMetadata)();
      const ethTokenBalances: Map<String, BigNumber> = get(
        ethereumBalances({ connectionUrl, publicKey: publicKey! })
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
        usdBalance === 0
          ? 0
          : usdBalance - usdBalance * (price.usd_24h_change / 100);
      const recentUsdBalanceChange = usdBalance - oldUsdBalance;
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
