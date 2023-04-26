import { SystemProgram } from "@solana/web3.js";

import type { CoinGeckoPriceData } from "../clients/coingecko";
import type { HeliusGetTokenMetadataResponse } from "../clients/helius";
import type { ApiContext } from "../context";
import {
  ChainId,
  type Collection,
  type Nft,
  type TokenBalance,
  type WalletBalances,
} from "../types";

import { type Blockchain, toBalance } from ".";

export class Solana implements Blockchain {
  readonly #ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.#ctx = ctx;
  }

  /**
   * Fetch and aggregate the native and token balances and
   * prices for the argued wallet address.
   * @param {string} address
   * @returns {(Promise<WalletBalances | null>)}
   * @memberof Solana
   */
  async getBalancesForAddress(address: string): Promise<WalletBalances | null> {
    // Get the address balances and filter out the NFTs and empty ATAs
    const balances = await this.#ctx.dataSources.helius.getBalances(address);
    const nonEmptyOrNftTokens = balances.tokens.filter(
      (t) => t.amount > 0 && !(t.amount === 1 && t.decimals === 0)
    );

    // Get the list of SPL mints and fetch their Coingecko IDs from the
    // Helius legacy token metadata
    const nonNftMints = nonEmptyOrNftTokens.map((t) => t.mint);
    const legacy = await this.#ctx.dataSources.helius.getLegacyMetadata(
      nonNftMints
    );

    // Query market data for SOL and each of the found SPL token IDs
    const ids = [...legacy.values()].map((v) => v.id);
    const prices = await this.#ctx.dataSources.coinGecko.getPrices([
      "solana",
      ...ids,
    ]);

    const nativeData: TokenBalance = {
      address,
      amount: balances.nativeBalance.toString(),
      decimals: this.nativeDecimals(),
      displayAmount: toBalance(
        balances.nativeBalance,
        this.nativeDecimals()
      ).toString(),
      marketData: {
        id: "solana",
        change: prices.solana.usd_24h_change,
        lastUpdatedAt: prices.solana.last_updated_at,
        logo: "", // FIXME:
        price: prices.solana.usd,
        value:
          toBalance(balances.nativeBalance, this.nativeDecimals()) *
          prices.solana.usd,
      },
      mint: SystemProgram.programId.toBase58(),
    };

    // Map each SPL token into their `TokenBalance` return type object
    const splTokenData = nonEmptyOrNftTokens.map((t): TokenBalance => {
      const meta = legacy.get(t.mint);
      const p: CoinGeckoPriceData | null = prices[meta?.id ?? ""] ?? null;
      return {
        address: t.tokenAccount,
        amount: t.amount.toString(),
        decimals: t.decimals,
        displayAmount: toBalance(t.amount, t.decimals).toString(),
        marketData:
          p && meta
            ? {
                id: meta.id,
                change: p.usd_24h_change,
                lastUpdatedAt: p.last_updated_at,
                logo: meta.logo,
                price: p.usd,
                value: toBalance(t.amount, t.decimals) * p.usd,
              }
            : null,
        mint: t.mint,
      };
    });

    // Calculate SPL token price value sum
    const splTokenValueSum = splTokenData.reduce(
      (acc, curr) => (curr.marketData ? acc + curr.marketData.value : acc),
      0
    );

    return {
      aggregateValue: nativeData.marketData!.value + splTokenValueSum,
      native: nativeData,
      tokens: splTokenData,
    };
  }

  /**
   * Get a list of NFT data for tokens owned by the argued address.
   * @param {string} address
   * @returns {(Promise<Nft[] | null>)}
   * @memberof Solana
   */
  async getNftsForAddress(address: string): Promise<Nft[] | null> {
    // Get the held SPL tokens for the address and reduce to only NFT mint addresses
    const assets = await this.#ctx.dataSources.helius.getBalances(address);
    const nftMints = assets.tokens.reduce<string[]>(
      (acc, curr) =>
        curr.amount === 1 && curr.decimals === 0 ? [...acc, curr.mint] : acc,
      []
    );

    if (nftMints.length === 0) {
      return [];
    }

    // Fetch the token metadata for each NFT mint address from Helius
    const metadatas = await this.#ctx.dataSources.helius.getTokenMetadata(
      nftMints,
      true
    );

    // Create a set of unique NFT collection addresses and fetch
    // their metadata from Helius
    const uniqueCollections = new Set<string>();
    for (const m of metadatas) {
      const c = m.onChainMetadata?.metadata.collection ?? undefined;
      if (c && !uniqueCollections.has(c.key)) {
        uniqueCollections.add(c.key);
      }
    }

    const collectionMetadatas =
      await this.#ctx.dataSources.helius.getTokenMetadata(
        [...uniqueCollections.values()],
        true
      );

    // Create a map of collection address to name and image for reference
    const collectionMap = new Map<string, { name?: string; image?: string }>();
    for (const c of collectionMetadatas) {
      const onChain = c.onChainMetadata?.metadata.data ?? undefined;
      const offChain = c.offChainMetadata?.metadata ?? undefined;

      if (onChain || offChain) {
        collectionMap.set(c.account, {
          name: onChain?.name,
          image: offChain?.image,
        });
      }
    }

    // Map all NFT metadatas into their return type with possible collection data
    return metadatas.map((m) => {
      const collection = this._parseCollectionMetadata(
        collectionMap,
        m.onChainMetadata
      );

      return {
        id: m.account,
        collection,
        image: m.offChainMetadata?.metadata.image,
        name: m.onChainMetadata?.metadata.data.name ?? "",
      };
    });
  }

  /**
   * Chain ID enum variant.
   * @returns {ChainId}
   * @memberof Solana
   */
  id(): ChainId {
    return ChainId.Solana;
  }

  /**
   * Native coin decimals.
   * @returns {number}
   * @memberof Solana
   */
  nativeDecimals(): number {
    return 9;
  }

  /**
   * Parse a potential collection data object from the on-chain metadata for an NFT.
   * @private
   * @param {Map<string, { name?: string; image?: string }>} collectionMap
   * @param {HeliusGetTokenMetadataResponse[number]["onChainMetadata"]} [onChainMetadata]
   * @returns {(Collection | undefined)}
   * @memberof Solana
   */
  private _parseCollectionMetadata(
    collectionMap: Map<string, { name?: string; image?: string }>,
    onChainMetadata?: HeliusGetTokenMetadataResponse[number]["onChainMetadata"]
  ): Collection | undefined {
    const hasCollection =
      (onChainMetadata?.metadata.collection ?? undefined) !== undefined;

    const mapValue = hasCollection
      ? collectionMap.get(onChainMetadata!.metadata.collection!.key)
      : undefined;

    return hasCollection
      ? {
          address: onChainMetadata!.metadata.collection!.key,
          image: mapValue?.image,
          name: mapValue?.name,
          verified: onChainMetadata!.metadata.collection!.verified,
        }
      : undefined;
  }
}
