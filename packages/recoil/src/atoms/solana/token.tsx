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

export const fungibleTokenAccounts = selectorFamily<
  Map<string, SolanaTokenAccountWithKeyString>,
  {
    connectionUrl: string;
    publicKey: string;
  }
>({
  key: "fungibleTokenAccounts",
  get:
    ({ connectionUrl, publicKey }) =>
    ({ get }) => {
      const { fts } = get(customSplTokenAccounts({ connectionUrl, publicKey }));
      return new Map(fts.fungibleTokens.map((t) => [t.key, t]));
    },
});

export const splTokenMetadata = selectorFamily<
  Array<TokenMetadataString | null>,
  {
    connectionUrl: string;
    publicKey: string;
  }
>({
  key: "splTokenMetadata",
  get:
    ({ connectionUrl, publicKey }) =>
    ({ get }) => {
      const { nfts, fts } = get(
        customSplTokenAccounts({ connectionUrl, publicKey })
      );
      const splTokenMetadata = fts.fungibleTokenMetadata.concat(
        nfts.nftTokenMetadata
      );
      return splTokenMetadata;
    },
});

export const splNftMetadata = selectorFamily<
  Map<string, SplNftMetadataString>,
  {
    connectionUrl: string;
    publicKey: string;
  }
>({
  key: "splNftMetadata",
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
          fungibleTokenAccounts({ connectionUrl, publicKey })
        );
        return _fungibleTokenAccounts.get(tokenAddress);
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
    const _fungibleTokenAccounts = get(
      fungibleTokenAccounts({ connectionUrl, publicKey })
    );
    return Array.from(_fungibleTokenAccounts.keys()) as string[];
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
      const tokenMint = get(solanaTokenMint({ tokenAddress }));
      const tokenMetadata = get(solanaTokenMetadata({ tokenAddress }));
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
      const _splTokenMetadata = get(
        splTokenMetadata({ connectionUrl, publicKey })
      );
      const metadataAddress = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          new PublicKey(tokenAccount.mint).toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      )[0];
      const tokenMetadata = _splTokenMetadata
        .filter((m) => m !== null)
        .find((m: TokenMetadataString) =>
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
