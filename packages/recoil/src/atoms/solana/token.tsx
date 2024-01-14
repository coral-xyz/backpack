import { Blockchain, toDisplayBalance } from "@coral-xyz/common";
import type {
  RawMintWithProgramIdString,
  SolanaTokenAccountWithKeyAndProgramIdString,
  SplNftMetadataString,
  TokenMetadataString,
} from "@coral-xyz/secure-clients/legacyCommon";
import {
  SOL_NATIVE_MINT,
  WSOL_MINT,
} from "@coral-xyz/secure-clients/legacyCommon";
import type { TokenInfo } from "@solana/spl-token-registry";
import { PublicKey } from "@solana/web3.js";
import { BigNumber, ethers } from "ethers";
import { atomFamily, selectorFamily } from "recoil";

import type { TokenDataWithBalance, TokenDataWithPrice } from "../../types";
import { blockchainConnectionUrl } from "../preferences";
import { solanaPricesForIds } from "../prices";

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
        publicKey: string;
        splTokenMints: Map<string, RawMintWithProgramIdString | null>;
        nfts: {
          nftTokens: Array<SolanaTokenAccountWithKeyAndProgramIdString>;
          nftTokenMetadata: Array<TokenMetadataString | null>;
        };
        fts: {
          fungibleTokens: Array<SolanaTokenAccountWithKeyAndProgramIdString>;
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
            publicKey,
            splTokenMints: new Map(mintsMap),
            nfts,
            fts,
          };
        } catch (error) {
          console.error("could not fetch solana token data", error);
          return {
            publicKey,
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

/**
 * Loads all the token accounts for fungible tokens for the given public key.
 */
export const solanaFungibleTokenAccounts = selectorFamily<
  Map<string, SolanaTokenAccountWithKeyAndProgramIdString>,
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

/**
 * Loads all the token accounts for non fungible tokens for the given public
 * key.
 */
export const solanaNftTokenAccounts = selectorFamily<
  Map<string, SolanaTokenAccountWithKeyAndProgramIdString>,
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

/**
 * Loads NFT metadata from token URIs for all the NFT accounts on the given
 * public key.
 */
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
      const { connection } = get(anchorContext);
      const { nfts } = get(
        customSplTokenAccounts({ connectionUrl, publicKey })
      );
      const { nftTokens, nftTokenMetadata } = nfts;
      const nftMetadata = await connection.customSplMetadataUri(
        nftTokens,
        nftTokenMetadata
      );
      return new Map(nftMetadata);
    },
});

/**
 * Loads token metadata from token URIs for all the token accounts on the given
 * public key.
 */
export const solanaFungibleTokenUriData = selectorFamily<
  Map<string, SplNftMetadataString>,
  {
    connectionUrl: string;
    publicKey: string;
  }
>({
  key: "solanaFungibleTokenUriData",
  get:
    ({
      connectionUrl,
      publicKey,
    }: {
      connectionUrl: string;
      publicKey: string;
    }) =>
    async ({ get }) => {
      const { connection } = get(anchorContext);
      const { fts } = get(customSplTokenAccounts({ connectionUrl, publicKey }));
      const { fungibleTokens, fungibleTokenMetadata } = fts;
      const metadata = await connection.customSplMetadataUri(
        fungibleTokens,
        fungibleTokenMetadata
      );
      return new Map(metadata);
    },
});

/**
 * Store the info from the SPL Token Account owned by the connected wallet.
 */
export const solanaTokenAccountsMap = selectorFamily<
  SolanaTokenAccountWithKeyAndProgramIdString | undefined,
  {
    tokenAddress: string;
    publicKey: string;
  }
>({
  key: "solanaTokenAccountsMap",
  get:
    ({
      tokenAddress,
      publicKey,
    }: {
      tokenAddress: string;
      publicKey: string;
    }) =>
    ({ get }) => {
      const connectionUrl = get(blockchainConnectionUrl(Blockchain.SOLANA))!;
      const _fungibleTokenAccounts = get(
        solanaFungibleTokenAccounts({ connectionUrl, publicKey })
      );
      const _nftTokenAccounts = get(
        solanaNftTokenAccounts({ connectionUrl, publicKey })
      );
      return (
        _fungibleTokenAccounts.get(tokenAddress) ||
        _nftTokenAccounts.get(tokenAddress)
      );
    },
});

/**
 * List of all stored token accounts within tokenAccountsMap.
 */
export const solanaFungibleTokenAccountKeys = selectorFamily<
  Array<string>,
  string // SOL publicKey.
>({
  key: "solanaFungibleTokenAccountKeys",
  get:
    (publicKey: string) =>
    ({ get }) => {
      const connectionUrl = get(blockchainConnectionUrl(Blockchain.SOLANA))!;
      const { fts } = get(customSplTokenAccounts({ connectionUrl, publicKey }));
      return fts.fungibleTokens.map((f) => f.key);
    },
});

export const solanaFungibleTokenNativeBalance = selectorFamily<
  TokenDataWithBalance | null,
  { tokenAddress: string; publicKey: string }
>({
  key: "solanaFungibleTokenNativeBalance",
  get:
    ({ tokenAddress, publicKey }) =>
    ({ get }: any) => {
      const connectionUrl = get(blockchainConnectionUrl(Blockchain.SOLANA))!;
      const tokenAccount = get(
        solanaTokenAccountsMap({ tokenAddress, publicKey })
      );
      if (!tokenAccount) {
        return null;
      }
      const tokenMint = get(solanaTokenMint({ tokenAddress, publicKey }));
      const tokenMetadata = get(
        solanaFungibleTokenUriData({ publicKey, connectionUrl })
      ).get(tokenAddress);
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
      tokenMetadata.metadata &&
      tokenMetadata.metadata.data
        ? {
            symbol: tokenMetadata.metadata.data.symbol.replace(/\0/g, ""),
            logoURI:
              tokenMetadata.tokenMetaUriData.image ??
              tokenMetadata.metadata.data.uri.replace(/\0/g, ""),
            name: tokenMetadata.metadata.data.name.replace(/\0/g, ""),
            decimals: tokenMint.decimals,
          }
        : tokenRegistryItem ?? ({} as TokenInfo);

      decimals = tokenMint ? tokenMint.decimals : tokenRegistryItem.decimals;

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
      const displayBalance = toDisplayBalance(nativeBalance, decimals);
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
export const solanaTokenMint = selectorFamily<
  /*RawMintWithProgramIdString | null*/ any,
  { tokenAddress: string; publicKey: string }
>({
  key: "solanaTokenMint",
  get:
    ({ tokenAddress, publicKey }) =>
    ({ get }) => {
      const tokenAccount = get(
        solanaTokenAccountsMap({ tokenAddress, publicKey })
      );
      if (!tokenAccount) {
        return null;
      }
      const connectionUrl = get(blockchainConnectionUrl(Blockchain.SOLANA))!;
      const { splTokenMints } = get(
        customSplTokenAccounts({ connectionUrl, publicKey })
      );
      return splTokenMints.get(tokenAccount.mint.toString()) ?? null;
    },
});

export const solanaFungibleTokenBalance = selectorFamily<
  TokenDataWithPrice | null,
  { tokenAddress: string; publicKey: string }
>({
  key: "solanaTokenBalance",
  get:
    ({ tokenAddress, publicKey }) =>
    ({ get }: any) => {
      const nativeTokenBalance = get(
        solanaFungibleTokenNativeBalance({ tokenAddress, publicKey })
      );
      if (!nativeTokenBalance) {
        return null;
      }

      const price = get(solanaPricesForIds({ publicKey })).get(
        nativeTokenBalance.priceMint
      ) as any;

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
