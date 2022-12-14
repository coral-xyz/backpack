import type {
  RawMintString,
  SolanaTokenAccountWithKeyString,
  SplNftMetadataString,
  TokenMetadataString,
} from "@coral-xyz/common";
import {
  fetchSplMetadataUri,
  SOL_NATIVE_MINT,
  TOKEN_METADATA_PROGRAM_ID,
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

/**
 * Batches requests to fetch all the Solana tokens and associated metadata.
 * All other solana token selectors derive from this.
 */
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
        splTokenMints: Map<string, RawMintString | null>;
        nfts: {
          nftTokens: Array<SolanaTokenAccountWithKeyString>;
          nftTokenMetadata: Array<TokenMetadataString | null>;
        };
        fts: {
          fungibleTokens: Array<SolanaTokenAccountWithKeyString>;
          fungibleTokenMetadata: Array<TokenMetadataString | null>;
        };
      }> => {
        const { connection } = get(anchorContext);
        //
        // Fetch token data.
        //
        try {
          const { mintsMap, fts, nfts } =
            await connection.customSplTokenAccounts(new PublicKey(publicKey));

          return {
            splTokenMints: new Map(mintsMap),
            nfts,
            fts,
          };
        } catch (error) {
          console.error("could not fetch solana token data", error);
          return {
            splTokenMints: new Map(),
            nfts: {
              nftTokens: [],
              nftTokenMetadata: [],
            },
            fts: {
              fungibleTokens: [],
              fungibleTokenMetadata: [],
            },
          };
        }
      },
  }),
});

export const solanaFungibleTokenAccounts = selectorFamily<
  Map<string, SolanaTokenAccountWithKeyString>,
  {
    connectionUrl: string;
    publicKey: string;
  }
>({
  key: "solanaFungibleTokenAccounts",
  get:
    ({ connectionUrl, publicKey }) =>
    ({ get }) => {
      const { fts } = get(customSplTokenAccounts({ connectionUrl, publicKey }));
      return new Map(fts.fungibleTokens.map((t) => [t.key, t]));
    },
});

export const solanaNftTokenAccounts = selectorFamily<
  Map<string, SolanaTokenAccountWithKeyString>,
  {
    connectionUrl: string;
    publicKey: string;
  }
>({
  key: "solanaNftTokenAccounts",
  get:
    ({ connectionUrl, publicKey }) =>
    ({ get }) => {
      const { nfts } = get(
        customSplTokenAccounts({ connectionUrl, publicKey })
      );
      return new Map(nfts.nftTokens.map((t) => [t.key, t]));
    },
});

export const solanaNftUriData = selectorFamily<
  Map<string, SplNftMetadataString>,
  {
    connectionUrl: string;
    publicKey: string;
  }
>({
  key: "solanaNftUriData",
  get:
    ({
      connectionUrl,
      publicKey,
    }: {
      connectionUrl: string;
      publicKey: string;
    }) =>
    async ({ get }) => {
      const { nfts } = get(
        customSplTokenAccounts({ connectionUrl, publicKey })
      );
      const { nftTokens, nftTokenMetadata } = nfts;
      const nftMetadata = await fetchSplMetadataUri(
        nftTokens,
        nftTokenMetadata
      );
      return nftMetadata;
    },
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
        const _fungibleTokenAccounts = get(
          solanaFungibleTokenAccounts({ connectionUrl, publicKey })
        );
        const _nftTokenAccounts = get(
          solanaNftTokenAccounts({ connectionUrl, publicKey })
        );
        const resp = _fungibleTokenAccounts.get(tokenAddress);
        if (resp) {
          return resp;
        }
        return _nftTokenAccounts.get(tokenAddress);
      },
  }),
});

/**
 * List of all stored token accounts within tokenAccountsMap.
 */
export const solanaFungibleTokenAccountKeys = selector<Array<string>>({
  key: "solanaFungibleTokenAccountKeys",
  get: ({ get }) => {
    const connectionUrl = get(solanaConnectionUrl)!;
    const publicKey = get(solanaPublicKey)!;
    const { fts } = get(customSplTokenAccounts({ connectionUrl, publicKey }));
    return fts.fungibleTokens.map((f) => f.key);
  },
});

export const solanaFungibleTokenNativeBalance = selectorFamily<
  TokenNativeData | null,
  string
>({
  key: "solanaFungibleTokenNativeBalance",
  get:
    (tokenAddress: string) =>
    ({ get }: any) => {
      const tokenAccount = get(solanaTokenAccountsMap({ tokenAddress }));
      if (!tokenAccount) {
        return null;
      }
      const tokenMint = get(solanaTokenMint({ tokenAddress }));
      const tokenMetadata = get(solanaFungibleTokenMetadata({ tokenAddress }));
      const tokenRegistry = get(splTokenRegistry)!;
      const tokenRegistryItem = tokenRegistry.get(tokenAccount.mint.toString());

      //
      // Extract token metadata and fall back to the registry list if needed.
      //
      let {
        symbol: ticker,
        logoURI: logo,
        name,
        decimals,
      } = tokenMint &&
      tokenMetadata &&
      tokenMetadata.account &&
      tokenMetadata.account.data
        ? {
            symbol: tokenMetadata.account.data.symbol.replace(/\0/g, ""),
            logoURI: tokenMetadata.account.data.uri.replace(/\0/g, ""),
            name: tokenMetadata.account.data.name.replace(/\0/g, ""),
            decimals: tokenMint.decimals,
          }
        : tokenRegistryItem ?? ({} as TokenInfo);
      if (tokenRegistryItem) {
        if (ticker === "") {
          ticker = tokenRegistryItem.symbol;
        }
        if (logo === "") {
          logo = tokenRegistryItem.logoURI;
        }
        if (name === "") {
          name = tokenRegistryItem.name;
        }
      }

      //
      // Calculate balances.
      //
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

/**
 * Returns all mints--fungible and non-fungible.
 */
const solanaTokenMint = selectorFamily<
  RawMintString | null,
  { tokenAddress: string }
>({
  key: "solanaTokenMint",
  get:
    ({ tokenAddress }) =>
    ({ get }) => {
      const tokenAccount = get(solanaTokenAccountsMap({ tokenAddress }));
      if (!tokenAccount) {
        return null;
      }
      const connectionUrl = get(solanaConnectionUrl)!;
      const publicKey = get(solanaPublicKey)!;
      const { splTokenMints } = get(
        customSplTokenAccounts({ connectionUrl, publicKey })
      );
      return splTokenMints.get(tokenAccount.mint.toString()) ?? null;
    },
});

const solanaFungibleTokenMetadata = selectorFamily<
  TokenMetadataString | null,
  { tokenAddress: string }
>({
  key: "solanaFungibleTokenMetadata",
  get:
    ({ tokenAddress }) =>
    ({ get }) => {
      const tokenAccount = get(solanaTokenAccountsMap({ tokenAddress }));
      if (!tokenAccount) {
        return null;
      }
      const connectionUrl = get(solanaConnectionUrl)!;
      const publicKey = get(solanaPublicKey)!;
      const { fts } = get(customSplTokenAccounts({ connectionUrl, publicKey }));
      return (
        fts.fungibleTokenMetadata
          .filter((m) => m !== null)
          .find(
            (m: TokenMetadataString) =>
              m.account.mint === tokenAccount.mint.toString()
          ) ?? null
      );
    },
});

export const solanaFungibleTokenBalance = selectorFamily<
  TokenData | null,
  string
>({
  key: "solanaTokenBalance",
  get:
    (tokenAddress: string) =>
    ({ get }: any) => {
      const nativeTokenBalance = get(
        solanaFungibleTokenNativeBalance(tokenAddress)
      );
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
