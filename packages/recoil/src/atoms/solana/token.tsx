import { atomFamily, selector, selectorFamily } from "recoil";
import { ethers, BigNumber } from "ethers";
import { TokenInfo } from "@solana/spl-token-registry";
import { SOL_NATIVE_MINT, WSOL_MINT } from "@coral-xyz/common";
import { priceData } from "../prices";
import { splTokenRegistry } from "./token-registry";
import { SolanaTokenAccountWithKey, TokenData } from "../../types";
import { anchorContext } from "./wallet";
import { solanaPublicKey } from "../wallet";
import { solanaConnectionUrl } from "./preferences";

export const customSplTokenAccounts = atomFamily({
  key: "customSplTokenAccounts",
  default: selectorFamily({
    key: "customSplTokenAccountsDefault",
    get:
      ({
        connectionUrl,
        publicKey,
      }: {
        connectionUrl: string;
        publicKey: string;
      }) =>
      async ({ get }: any) => {
        const { provider } = get(anchorContext);
        //
        // Fetch token data.
        //
        try {
          const { tokenAccountsMap, tokenMetadata, nftMetadata } =
            await provider.connection.customSplTokenAccounts(publicKey);
          const splTokenAccounts = new Map<string, SolanaTokenAccountWithKey>(
            tokenAccountsMap
          );
          return {
            splTokenAccounts,
            splTokenMetadata: tokenMetadata,
            splNftMetadata: new Map(nftMetadata),
          };
        } catch (error) {
          console.error("could not fetch solana token data", error);
          return {
            splTokenAccounts: new Map(),
            splTokenMetadata: new Map(),
            splNftMetadata: new Map(),
          };
        }
      },
  }),
});

/**
 * Store the info from the SPL Token Account owned by the connected wallet.
 */
export const solanaTokenAccountsMap = atomFamily<
  SolanaTokenAccountWithKey | null,
  { tokenAddress: string }
>({
  key: "solanaTokenAccountsMap",
  default: selectorFamily({
    key: "solanaTokenAccountsMapDefault",
    get:
      ({ tokenAddress }: { tokenAddress: string }) =>
      ({ get }: any) => {
        const connectionUrl = get(solanaConnectionUrl);
        const publicKey = get(solanaPublicKey);
        const { splTokenAccounts } = get(
          customSplTokenAccounts({ connectionUrl, publicKey })
        );
        return splTokenAccounts.get(tokenAddress);
      },
  }),
});

/**
 * List of all stored token accounts within tokenAccountsMap.
 */
export const solanaTokenAccountKeys = selector({
  key: "solanaTokenAccountKeys",
  get: ({ get }: any) => {
    const connectionUrl = get(solanaConnectionUrl);
    const publicKey = get(solanaPublicKey);
    const { splTokenAccounts } = get(
      customSplTokenAccounts({ connectionUrl, publicKey })
    );
    return Array.from(splTokenAccounts.keys()) as string[];
  },
});

export const solanaTokenBalance = selectorFamily<TokenData | null, string>({
  key: "solanaTokenBalance",
  get:
    (tokenAddress: string) =>
    ({ get }: any) => {
      const tokenAccount = get(solanaTokenAccountsMap({ tokenAddress }));
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
        address: tokenAddress,
        mint: tokenAccount.mint.toString(),
        usdBalance,
        recentPercentChange,
        recentUsdBalanceChange,
        priceData: price,
      } as TokenData;
    },
});
