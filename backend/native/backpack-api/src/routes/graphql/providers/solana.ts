import { getATAAddressesSync } from "@saberhq/token-utils";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { ethers } from "ethers";

import type { CoinGeckoPriceData } from "../clients/coingecko";
import {
  type HeliusGetAssetsByOwnerResponse,
  IN_MEM_COLLECTION_DATA_CACHE,
} from "../clients/helius";
import type { TensorActingListingsResponse } from "../clients/tensor";
import type { ApiContext } from "../context";
import { NodeBuilder } from "../nodes";
import { SolanaTokenList } from "../tokens";
import {
  type BalanceFiltersInput,
  type Balances,
  type Collection,
  type Listing,
  type Nft,
  type NftAttribute,
  type NftConnection,
  type NftFiltersInput,
  ProviderId,
  type TokenBalance,
  type Transaction,
  type TransactionConnection,
  type TransactionFiltersInput,
} from "../types";
import { calculateBalanceAggregate, createConnection } from "../utils";

import type { BlockchainDataProvider } from ".";

/**
 * Solana blockchain implementation for the common API.
 * @export
 * @class Solana
 * @implements {BlockchainDataProvider}
 */
export class Solana implements BlockchainDataProvider {
  readonly #ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.#ctx = ctx;
  }

  /**
   * Chain ID enum variant.
   * @returns {ProviderId}
   * @memberof Solana
   */
  id(): ProviderId {
    return ProviderId.Solana;
  }

  /**
   * Native coin decimals.
   * @returns {number}
   * @memberof Solana
   */
  decimals(): number {
    return 9;
  }

  /**
   * Default native address.
   * @returns {string}
   * @memberof Solana
   */
  defaultAddress(): string {
    return SystemProgram.programId.toBase58();
  }

  /**
   * Logo URL of the native coin.
   * @returns {string}
   * @memberof Solana
   */
  logo(): string {
    return SolanaTokenList[this.defaultAddress()].logo!;
  }

  /**
   * Symbol of the native token.
   * @returns {string}
   * @memberof Solana
   */
  symbol(): string {
    return "SOL";
  }

  /**
   * Fetch and aggregate the native and token balances and
   * prices for the argued wallet address.
   * @param {string} address
   * @param {BalanceFiltersInput} [filters]
   * @returns {Promise<Balances>}
   * @memberof Solana
   */
  async getBalancesForAddress(
    address: string,
    filters?: BalanceFiltersInput
  ): Promise<Balances> {
    // Get the address balances and filter out the NFTs and empty ATAs
    const balances = await this.#ctx.dataSources.helius.getBalances(address);
    const nonEmptyOrNftTokens = balances.tokens.filter(
      (t) => t.amount > 0 && !(t.amount === 1 && t.decimals === 0)
    );

    // Get the list of SPL mints and fetch their Coingecko IDs from the
    // in-memory Jupiter token list
    const nonNftMints = nonEmptyOrNftTokens.map((t) => t.mint);
    const meta = nonNftMints.reduce<Map<string, string>>((acc, curr) => {
      const entry = SolanaTokenList[curr];
      if (entry && entry.coingeckoId) {
        acc.set(curr, entry.coingeckoId);
      }
      return acc;
    }, new Map());

    // Query market data for SOL and each of the found SPL token IDs
    const ids = [...meta.values()];
    const prices = await this.#ctx.dataSources.coinGecko.getPrices([
      "solana",
      ...ids,
    ]);

    // Build the token balance node for the native balance of the wallet
    const nativeDisplayAmount = ethers.utils.formatUnits(
      balances.nativeBalance,
      this.decimals()
    );

    const nativeTokenNode = NodeBuilder.tokenBalance(
      this.id(),
      {
        address,
        amount: balances.nativeBalance.toString(),
        decimals: this.decimals(),
        displayAmount: nativeDisplayAmount,
        marketData: NodeBuilder.marketData("solana", {
          lastUpdatedAt: prices.solana.last_updated,
          percentChange: prices.solana.price_change_percentage_24h,
          price: prices.solana.current_price,
          sparkline: prices.solana.sparkline_in_7d.price,
          usdChange: prices.solana.price_change_24h,
          value: parseFloat(nativeDisplayAmount) * prices.solana.current_price,
          valueChange:
            parseFloat(nativeDisplayAmount) * prices.solana.price_change_24h,
        }),
        token: this.defaultAddress(),
        tokenListEntry: NodeBuilder.tokenListEntry(
          SolanaTokenList[this.defaultAddress()]
        ),
      },
      true
    );

    // Map each SPL token into their `TokenBalance` return type object
    const splTokenNodes = nonEmptyOrNftTokens.reduce<TokenBalance[]>(
      (acc, curr) => {
        const id = meta.get(curr.mint);
        const p: CoinGeckoPriceData | null = prices[id ?? ""] ?? null;

        const displayAmount = ethers.utils.formatUnits(
          curr.amount,
          curr.decimals
        );

        const marketData =
          p && id
            ? NodeBuilder.marketData(id, {
                lastUpdatedAt: p.last_updated,
                percentChange: p.price_change_percentage_24h,
                price: p.current_price,
                sparkline: p.sparkline_in_7d.price,
                usdChange: p.price_change_24h,
                value: parseFloat(displayAmount) * p.current_price,
                valueChange: parseFloat(displayAmount) * p.price_change_24h,
              })
            : undefined;

        const tokenListEntry = SolanaTokenList[curr.mint]
          ? NodeBuilder.tokenListEntry(SolanaTokenList[curr.mint])
          : undefined;

        if (filters?.marketListedTokensOnly && !marketData) {
          return acc;
        }

        return [
          ...acc,
          NodeBuilder.tokenBalance(
            this.id(),
            {
              address: curr.tokenAccount,
              amount: curr.amount.toString(),
              decimals: curr.decimals,
              displayAmount,
              marketData,
              token: curr.mint,
              tokenListEntry,
            },
            false
          ),
        ];
      },
      []
    );

    // Combine and sort the native and SPL token nodes by total market value decreasing
    const tokenNodes = [nativeTokenNode, ...splTokenNodes].sort(
      (a, b) => (b.marketData?.value ?? 0) - (a.marketData?.value ?? 0)
    );

    return NodeBuilder.balances(address, this.id(), {
      aggregate: calculateBalanceAggregate(address, tokenNodes),
      tokens: createConnection(tokenNodes, false, false),
    });
  }

  /**
   * Get a list of NFT data for tokens owned by the argued address.
   * @param {string} address
   * @param {NftFiltersInput} [filters]
   * @returns {Promise<NftConnection>}
   * @memberof Solana
   */
  async getNftsForAddress(
    address: string,
    filters?: NftFiltersInput
  ): Promise<NftConnection> {
    // Get the list of digital assets (NFTs) owned by the argued address from Helius DAS API.
    const response = await this.#ctx.dataSources.helius.rpc.getAssetsByOwner(
      address
    );

    // Optionally filter for only argued NFT mints if provided
    let { items } = response.result;
    if (filters?.addresses) {
      items = items.filter((i) => filters.addresses?.includes(i.id));
    }

    if (items.length === 0) {
      return createConnection([], false, false);
    }

    // Get active listings for the argued wallet address and assign empty
    // listing data array if the request fails
    let listings: TensorActingListingsResponse;
    try {
      listings = await this.#ctx.dataSources.tensor.getActiveListingsForWallet(
        address
      );
    } catch (err) {
      console.error(err);
      listings = { data: { userActiveListings: { txs: [] } } };
    }

    // Create a map of collection address to name and image for reference
    const collectionMap = await _getCollectionMetadatas(this.#ctx, items);

    // Create a map of associated token account addresses
    const atas = getATAAddressesSync({
      mints: items.reduce<Record<string, PublicKey>>((acc, curr) => {
        acc[curr.id] = new PublicKey(curr.id);
        return acc;
      }, {}),
      owner: new PublicKey(address),
    });

    // Map all NFT metadatas into their return type with possible collection data
    const nodes: Nft[] = items.map((item) => {
      const collection = this._parseCollectionMetadata(
        collectionMap,
        item.grouping.find((g) => g.group_key === "collection")?.group_value
      );

      const attributes: NftAttribute[] | undefined =
        item.content.metadata?.attributes?.map((x) => ({
          trait: x.trait_type,
          value: x.value,
        }));

      let listing: Listing | undefined = undefined;
      const tensorListing = listings.data.userActiveListings.txs.find(
        (t) => t.tx.mintOnchainId === item.id
      );

      if (tensorListing) {
        listing = NodeBuilder.tensorListing(item.id, {
          amount: ethers.utils.formatUnits(
            tensorListing.tx.grossAmount,
            this.decimals()
          ),
          source: tensorListing.tx.source,
          url: this.#ctx.dataSources.tensor.getListingUrl(item.id),
        });
      }

      return NodeBuilder.nft(this.id(), {
        address: item.id,
        attributes,
        collection,
        compressed: item.compression?.compressed ?? false,
        description: item.content?.metadata?.description || undefined,
        image: item.content?.files?.at(0)?.uri || undefined,
        listing,
        metadataUri: item.content?.json_uri || undefined,
        name: item.content?.metadata?.name || undefined,
        owner: address,
        token: atas.accounts[item.id].address.toBase58(),
      });
    });

    return createConnection(nodes, false, false);
  }

  /**
   * Get the transaction history with parameters for the argued address.
   * @param {string} address
   * @param {TransactionFiltersInput} [filters]
   * @returns {Promise<TransactionConnection>}
   * @memberof Ethereum
   */
  async getTransactionsForAddress(
    address: string,
    filters?: TransactionFiltersInput
  ): Promise<TransactionConnection> {
    const resp = await this.#ctx.dataSources.helius.getTransactionHistory(
      address,
      filters?.before ?? undefined,
      filters?.after ?? undefined,
      filters?.token ?? undefined
    );

    const nodes: Transaction[] = resp.map((r) => {
      const transactionError: string | undefined = r.transactionError
        ? typeof r.transactionError === "string"
          ? r.transactionError
          : (r.transactionError as any).error
        : undefined;

      const nfts =
        r.events?.nft?.nfts && r.events.nft?.nfts.length > 0
          ? r.events.nft.nfts.map((n) => n.mint)
          : undefined;

      return NodeBuilder.transaction(this.id(), {
        description: r.description,
        block: r.slot,
        error: transactionError,
        fee: `${ethers.utils.formatUnits(
          r.fee,
          this.decimals()
        )} ${this.symbol()}`,
        feePayer: r.feePayer,
        hash: r.signature,
        nfts,
        raw: r,
        source: r.source,
        timestamp: new Date(r.timestamp * 1000).toISOString(),
        type: r.type,
      });
    });

    return createConnection(nodes, false, false); // FIXME: next and previous page
  }

  /**
   * Parse a potential collection data object from the on-chain metadata for an NFT.
   * @private
   * @param {Map<string, { name?: string; image?: string }>} collectionMap
   * @param {string} [groupingKey]
   * @returns {(Collection | undefined)}
   * @memberof Solana
   */
  private _parseCollectionMetadata(
    collectionMap: Map<string, { name?: string; image?: string }>,
    groupingKey?: string
  ): Collection | undefined {
    const mapValue = groupingKey ? collectionMap.get(groupingKey) : undefined;
    return mapValue
      ? NodeBuilder.nftCollection(this.id(), {
          address: groupingKey!,
          image: mapValue?.image,
          name: mapValue?.name,
          verified: true,
        })
      : undefined;
  }
}

/**
 * Build a map of collection addresses to their name and images if discovered.
 * @param {ApiContext} ctx
 * @param {Set<string>} items
 * @returns {Promise<Map<string, { name?: string; image?: string }>>}
 */
async function _getCollectionMetadatas(
  ctx: ApiContext,
  items: HeliusGetAssetsByOwnerResponse["result"]["items"]
): Promise<Map<string, { name?: string; image?: string }>> {
  // Create a set of unique NFT collection addresses and fetch
  // their metadata from Helius
  const uniqueCollections = new Set<string>();
  for (const item of items) {
    const c = item.grouping.find(
      (x) => x.group_key === "collection"
    )?.group_value;

    if (c && !uniqueCollections.has(c)) {
      uniqueCollections.add(c);
    }
  }

  // Map of collection addresses to details
  const collectionMap = new Map<string, { name?: string; image?: string }>();

  // Populate values from the in-memory collection data cache first...
  // Iterate through in the set and add to the data map if the cache contains
  // the collection key and then remove from the set if found
  for (const c of uniqueCollections) {
    if (IN_MEM_COLLECTION_DATA_CACHE.has(c)) {
      collectionMap.set(c, IN_MEM_COLLECTION_DATA_CACHE.get(c)!);
      uniqueCollections.delete(c);
    }
  }

  // Fetch metadata from API for any remaining un-cached addresses
  const remaining = [...uniqueCollections.values()];
  if (remaining.length > 0) {
    const collectionMetadatas = await ctx.dataSources.helius.getTokenMetadata(
      remaining,
      true
    );

    for (const c of collectionMetadatas) {
      const onChain = c.onChainMetadata?.metadata.data ?? undefined;
      const offChain = c.offChainMetadata?.metadata ?? undefined;

      // If discovered add to the local returned map and global cache
      if (onChain || offChain) {
        const data = {
          name: onChain?.name,
          image: offChain?.image,
        };

        collectionMap.set(c.account, data);
        IN_MEM_COLLECTION_DATA_CACHE.set(c.account, data);
      }
    }
  }

  return collectionMap;
}
