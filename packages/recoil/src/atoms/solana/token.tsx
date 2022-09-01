import { atomFamily, selectorFamily } from "recoil";
import { ethers, BigNumber } from "ethers";
import { TokenInfo } from "@solana/spl-token-registry";
import { SOL_NATIVE_MINT, WSOL_MINT } from "@coral-xyz/common";
import { bootstrap } from "../bootstrap";
import { priceData } from "../prices";
import { splTokenRegistry } from "./token-registry";
import { SolanaTokenAccountWithKey, TokenData } from "../../types";
import { solanaConnectionUrl } from "./preferences";

export const solanaTokenBalance = selectorFamily<TokenData | null, string>({
  key: "solanaTokenBalance",
  get:
    (address: string) =>
    ({ get }: any) => {
      const tokenAccount = get(
        solanaTokenAccountsMap({
          connectionUrl: get(solanaConnectionUrl)!,
          tokenAddress: address,
        })
      );
      if (!tokenAccount) {
        return null;
      }
      //
      // Token registry metadata.
      //
      const tokenRegistry = get(splTokenRegistry)!;
      const tokenMetadata =
        tokenRegistry.get(tokenAccount.mint.toString()) ?? ({} as TokenInfo);
      const { symbol: ticker, logoURI: logo, name, decimals } = tokenMetadata;

      //
      // Price data.
      //

      // Use native SOL price for wSOL
      const priceMint =
        tokenAccount.mint.toString() === WSOL_MINT
          ? SOL_NATIVE_MINT
          : tokenAccount.mint.toString();
      const price = get(priceData(priceMint)) as any;
      // Convert from BN.js to ethers BigNumber
      // https://github.com/ethers-io/ethers.js/issues/595
      const nativeBalance = BigNumber.from(tokenAccount.amount.toString());
      const displayBalance = ethers.utils.formatUnits(nativeBalance, decimals);
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
        address,
        mint: tokenAccount.mint.toString(),
        usdBalance,
        recentPercentChange,
        recentUsdBalanceChange,
        priceData: price,
      } as TokenData;
    },
});

/**
 * List of all stored token accounts within tokenAccountsMap.
 */
export const solanaTokenAccountKeys = atomFamily<
  Array<string>,
  { connectionUrl: string; publicKey: string | null }
>({
  key: "solanaTokenAccountKeys",
  default: selectorFamily({
    key: "solanaTokenAccountKeysDefault",
    get:
      ({
        connectionUrl,
        publicKey,
      }: {
        connectionUrl: string;
        publicKey: string;
      }) =>
      ({ get }: any) => {
        const data = get(bootstrap);
        return Array.from(data.splTokenAccounts.keys()) as string[];
      },
  }),
});

/**
 * Store the info from the SPL Token Account owned by the connected wallet.
 */
export const solanaTokenAccountsMap = atomFamily<
  SolanaTokenAccountWithKey | null,
  { connectionUrl: string; tokenAddress: string }
>({
  key: "solanaTokenAccountsMap",
  default: selectorFamily({
    key: "solanaTokenAccountsMapDefault",
    get:
      ({
        connectionUrl,
        tokenAddress,
      }: {
        connectionUrl: string;
        tokenAddress: string;
      }) =>
      ({ get }: any) => {
        const data = get(bootstrap);
        return data.splTokenAccounts.get(tokenAddress);
      },
  }),
});
