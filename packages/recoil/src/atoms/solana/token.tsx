import { atomFamily, selector, selectorFamily } from "recoil";
import { ethers, BigNumber } from "ethers";
import { TokenInfo } from "@solana/spl-token-registry";
import { priceData } from "../prices";
import { splTokenRegistry } from "./token-registry";
import { TokenData, TokenNativeData } from "../../types";
import { anchorContext } from "./wallet";
import { solanaPublicKey } from "../wallet";
import { solanaConnectionUrl } from "./preferences";
import { PublicKey } from "@solana/web3.js";
import {
  SOL_NATIVE_MINT,
  TokenMetadata,
  WSOL_MINT,
  TOKEN_METADATA_PROGRAM_ID,
} from "@coral-xyz/common";
import type {
  SolanaTokenAccountWithKeyString,
  SplNftMetadataString,
  TokenMetadataString,
} from "@coral-xyz/common";

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
      async ({
        get,
      }): Promise<{
        splTokenAccounts: Map<String, SolanaTokenAccountWithKeyString>;
        splTokenMetadata: (TokenMetadataString | null)[];
        splNftMetadata: Map<string, SplNftMetadataString>;
      }> => {
        const { connection } = get(anchorContext);
        //
        // Fetch token data.
        //
        try {
          const { tokenAccountsMap, tokenMetadata, nftMetadata } =
            await connection.customSplTokenAccounts(new PublicKey(publicKey));
          const splTokenAccounts = new Map(tokenAccountsMap);
          return {
            splTokenAccounts,
            splTokenMetadata: tokenMetadata,
            splNftMetadata: new Map(nftMetadata),
          };
        } catch (error) {
          console.error("could not fetch solana token data", error);
          return {
            splTokenAccounts: new Map(),
            splTokenMetadata: [],
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
  SolanaTokenAccountWithKeyString | undefined,
  { tokenAddress: string }
>({
  key: "solanaTokenAccountsMap",
  default: selectorFamily({
    key: "solanaTokenAccountsMapDefault",
    get:
      ({ tokenAddress }: { tokenAddress: string }) =>
      ({ get }) => {
        const connectionUrl = get(solanaConnectionUrl)!;
        const publicKey = get(solanaPublicKey)!;
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
  get: ({ get }) => {
    const connectionUrl = get(solanaConnectionUrl)!;
    const publicKey = get(solanaPublicKey)!;
    const { splTokenAccounts } = get(
      customSplTokenAccounts({ connectionUrl, publicKey })
    );
    return Array.from(splTokenAccounts.keys()) as string[];
  },
});

export const solanaTokenNativeBalance = selectorFamily<
  TokenNativeData | null,
  string
>({
  key: "solanaTokenNativeBalance",
  get:
    (tokenAddress: string) =>
    ({ get }: any) => {
      const tokenAccount = get(solanaTokenAccountsMap({ tokenAddress }));
      if (!tokenAccount) return null;

      const connectionUrl = get(solanaConnectionUrl)!;
      const publicKey = get(solanaPublicKey)!;
      const { splTokenMetadata } = get(
        customSplTokenAccounts({ connectionUrl, publicKey })
      );
      const metadataAddress = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          new PublicKey(tokenAccount.mint).toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      )[0];
      const nativeBalance = BigNumber.from(tokenAccount.amount.toString());
      const tokenMetadata: TokenMetadata | null = splTokenMetadata.find(
        (m: TokenMetadataString) =>
          metadataAddress.equals(new PublicKey(m.publicKey))
      );

      const tokenRegistry = get(splTokenRegistry)!;
      const tokenRegMetadata =
        tokenRegistry.get(tokenAccount.mint.toString()) ?? ({} as TokenInfo);

      if (tokenMetadata && Object.keys(tokenRegMetadata).length == 0) {
        const displayBalance = ethers.utils.formatUnits(
          nativeBalance,
          tokenMetadata.decimals
        );
        const { symbol: onChainSymbol, name: onChainName } =
          tokenMetadata.account.data;
        const priceMint =
          tokenAccount.mint.toString() === WSOL_MINT
            ? SOL_NATIVE_MINT
            : tokenAccount.mint.toString();

        return {
          name: tokenMetadata.uriMetadata?.name || onChainName,
          decimals: tokenMetadata.decimals!,
          nativeBalance,
          displayBalance,
          ticker: tokenMetadata.uriMetadata?.symbol || onChainSymbol,
          logo: tokenMetadata.uriMetadata?.image || "",
          address: tokenAddress,
          mint: tokenAccount.mint.toString(),
          priceMint,
        };
      }

      const {
        symbol: ticker,
        logoURI: logo,
        name,
        decimals,
      } = tokenRegMetadata;
      const displayBalance = ethers.utils.formatUnits(nativeBalance, decimals);
      const priceMint =
        tokenAccount.mint.toString() === WSOL_MINT
          ? SOL_NATIVE_MINT
          : tokenAccount.mint.toString();
      return {
        name,
        decimals,
        nativeBalance,
        displayBalance,
        ticker,
        logo,
        address: tokenAddress,
        mint: tokenAccount.mint.toString(),
        priceMint,
      };
    },
});

export const solanaTokenBalance = selectorFamily<TokenData | null, string>({
  key: "solanaTokenBalance",
  get:
    (tokenAddress: string) =>
    ({ get }: any) => {
      const nativeTokenBalance = get(solanaTokenNativeBalance(tokenAddress));
      if (!nativeTokenBalance) {
        return null;
      }

      const price = get(priceData(nativeTokenBalance.priceMint)) as any;

      const usdBalance =
        (price?.usd ?? 0) * parseFloat(nativeTokenBalance.displayBalance);
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
        ...nativeTokenBalance,
        usdBalance,
        recentPercentChange,
        recentUsdBalanceChange,
        priceData: price,
      };
    },
});
