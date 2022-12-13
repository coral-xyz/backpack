import type {
  SolanaTokenAccountWithKeyString,
  SplNftMetadataString,
  TokenMetadataString,
} from "@coral-xyz/common";
import {
  SOL_NATIVE_MINT,
  TOKEN_METADATA_PROGRAM_ID,
  TokenMetadata,
  WSOL_MINT,
} from "@coral-xyz/common";
import type { TokenInfo } from "@solana/spl-token-registry";
import { PublicKey } from "@solana/web3.js";
import { BigNumber, ethers } from "ethers";
import { atomFamily, selector, selectorFamily } from "recoil";

import type { TokenData, TokenNativeData } from "../../types";
import { priceData } from "../prices";
import { solanaPublicKey } from "../wallet";

import { solanaConnectionUrl } from "./preferences";
import { splTokenRegistry } from "./token-registry";
import { anchorContext } from "./wallet";

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
      if (!tokenAccount) {
        return null;
      }

      const tokenMetadata = get(solanaTokenMetadata({ tokenAddress }));

      const tokenRegistry = get(splTokenRegistry)!;
      const {
        symbol: ticker,
        logoURI: logo,
        name,
        decimals,
      } = tokenRegistry.get(tokenAccount.mint.toString()) ?? ({} as TokenInfo);
      const nativeBalance = BigNumber.from(tokenAccount.amount.toString());
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

// The token metadata for a given token adddress.
const solanaTokenMetadata = selectorFamily<
  TokenMetadataString | null,
  { tokenAddress: string }
>({
  key: "solanaTokenMetadata",
  get:
    ({ tokenAddress }) =>
    ({ get }) => {
      const tokenAccount = get(solanaTokenAccountsMap({ tokenAddress }));
      if (!tokenAccount) {
        return null;
      }

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
      const tokenMetadata = splTokenMetadata.find((m: TokenMetadataString) =>
        metadataAddress.equals(new PublicKey(m.publicKey))
      );
      return tokenMetadata ?? null;
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
