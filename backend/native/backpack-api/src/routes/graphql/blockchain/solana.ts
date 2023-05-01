import { SystemProgram } from "@solana/web3.js";
import { ethers } from "ethers";

import type { CoinGeckoPriceData } from "../clients/coingecko";
import type { HeliusGetTokenMetadataResponse } from "../clients/helius";
import type { ApiContext } from "../context";
import {
  type Balances,
  ChainId,
  type Collection,
  type NftConnection,
  type TokenBalance,
  type TransactionConnection,
} from "../types";
import { createConnection } from "..";

import { type Blockchain, calculateUsdChange } from ".";

export class Solana implements Blockchain {
  readonly #ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.#ctx = ctx;
  }

  /**
   * Fetch and aggregate the native and token balances and
   * prices for the argued wallet address.
   * @param {string} address
   * @returns {(Promise<Balances | null>)}
   * @memberof Solana
   */
  async getBalancesForAddress(address: string): Promise<Balances | null> {
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
      id: `solana_native_address:${address}`,
      address,
      amount: balances.nativeBalance.toString(),
      decimals: this.nativeDecimals(),
      displayAmount: ethers.utils.formatUnits(
        balances.nativeBalance,
        this.nativeDecimals()
      ),
      marketData: {
        id: "coingecko_market_data:solana",
        percentChange: parseFloat(prices.solana.usd_24h_change.toFixed(2)),
        usdChange: calculateUsdChange(
          prices.solana.usd_24h_change,
          prices.solana.usd
        ),
        lastUpdatedAt: prices.solana.last_updated_at,
        logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png",
        price: prices.solana.usd,
        value:
          parseFloat(
            ethers.utils.formatUnits(
              balances.nativeBalance,
              this.nativeDecimals()
            )
          ) * prices.solana.usd,
      },
      mint: SystemProgram.programId.toBase58(),
    };

    // Map each SPL token into their `TokenBalance` return type object
    const splTokenNodes = nonEmptyOrNftTokens.map((t): TokenBalance => {
      const meta = legacy.get(t.mint);
      const p: CoinGeckoPriceData | null = prices[meta?.id ?? ""] ?? null;
      return {
        id: `solana_token_address:${t.tokenAccount}`,
        address: t.tokenAccount,
        amount: t.amount.toString(),
        decimals: t.decimals,
        displayAmount: ethers.utils.formatUnits(t.amount, t.decimals),
        marketData:
          p && meta
            ? {
                id: `coingecko_market_data:${meta.id}`,
                change: p.usd_24h_change,
                lastUpdatedAt: p.last_updated_at,
                logo: meta.logo,
                price: p.usd,
                value:
                  parseFloat(ethers.utils.formatUnits(t.amount, t.decimals)) *
                  p.usd,
              }
            : null,
        mint: t.mint,
      };
    });

    // Calculate SPL token price value sum
    const splTokenValueSum = splTokenNodes.reduce(
      (acc, curr) => (curr.marketData ? acc + curr.marketData.value : acc),
      0
    );

    return {
      aggregateValue: nativeData.marketData!.value + splTokenValueSum,
      native: nativeData,
      tokens: createConnection(splTokenNodes, false, false),
    };
  }

  /**
   * Get a list of NFT data for tokens owned by the argued address.
   * @param {string} address
   * @returns {(Promise<NftConnection | null>)}
   * @memberof Solana
   */
  async getNftsForAddress(address: string): Promise<NftConnection | null> {
    // Get the held SPL tokens for the address and reduce to only NFT mint addresses
    const assets = await this.#ctx.dataSources.helius.getBalances(address);
    const nftMints = assets.tokens.reduce<string[]>(
      (acc, curr) =>
        curr.amount === 1 && curr.decimals === 0 ? [...acc, curr.mint] : acc,
      []
    );

    if (nftMints.length === 0) {
      return null;
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
    const nodes = metadatas.map((m) => {
      const collection = this._parseCollectionMetadata(
        collectionMap,
        m.onChainMetadata
      );

      return {
        id: `solana_nft:${m.account}`,
        address: m.account,
        collection,
        image: m.offChainMetadata?.metadata.image,
        name: m.onChainMetadata?.metadata.data.name ?? "",
      };
    });

    return createConnection(nodes, false, false);
  }

  /**
   * Get the transaction history with parameters for the argued address.
   * @param {string} address
   * @param {string} [before]
   * @param {string} [after]
   * @returns {(Promise<TransactionConnection | null>)}
   * @memberof Ethereum
   */
  async getTransactionsForAddress(
    address: string,
    before?: string,
    after?: string
  ): Promise<TransactionConnection | null> {
    const resp = await this.#ctx.dataSources.helius.getTransactionHistory(
      address,
      before,
      after
    );

    const nodes = resp.map((r) => ({
      id: `solana_transaction:${r.signature}`,
      block: r.slot,
      fee: r.fee,
      feePayer: r.feePayer,
      hash: r.signature,
      source: r.source,
      timestamp: new Date(r.timestamp * 1000).toISOString(),
      type: r.type,
    }));

    return createConnection(nodes, false, false);
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
          id: `solana_nft_collection:${
            onChainMetadata!.metadata.collection!.key
          }`,
          address: onChainMetadata!.metadata.collection!.key,
          image: mapValue?.image,
          name: mapValue?.name,
          verified: onChainMetadata!.metadata.collection!.verified,
        }
      : undefined;
  }
}
