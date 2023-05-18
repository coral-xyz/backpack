import { getATAAddressesSync } from "@saberhq/token-utils";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { ethers } from "ethers";
import type { EnrichedTransaction } from "helius-sdk";

import type { CoinGeckoPriceData } from "../clients/coingecko";
import type { HeliusGetTokenMetadataResponse } from "../clients/helius";
import type { TensorActingListingsResponse } from "../clients/tensor";
import type { ApiContext } from "../context";
import {
  type Balances,
  ChainId,
  type Collection,
  type Listing,
  type MarketData,
  type Nft,
  type NftAttribute,
  type NftConnection,
  type NftFiltersInput,
  type TokenBalance,
  type Transaction,
  type TransactionConnection,
  type TransactionFiltersInput,
  type TransactionTransfer,
} from "../types";
import {
  calculateBalanceAggregate,
  calculateUsdChange,
  createConnection,
} from "../utils";

import type { Blockchain } from ".";

const SOLANA_DEFAULT_ADDRESS = SystemProgram.programId.toBase58();

/**
 * Solana blockchain implementation for the common API.
 * @export
 * @class Solana
 * @implements {Blockchain}
 */
export class Solana implements Blockchain {
  readonly #ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.#ctx = ctx;
  }

  /**
   * Fetch and aggregate the native and token balances and
   * prices for the argued wallet address.
   * @param {string} address
   * @returns {Promise<Balances>}
   * @memberof Solana
   */
  async getBalancesForAddress(address: string): Promise<Balances> {
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
      id: `${this.id()}_native_address:${address}`,
      address,
      amount: balances.nativeBalance.toString(),
      decimals: this.nativeDecimals(),
      displayAmount: ethers.utils.formatUnits(
        balances.nativeBalance,
        this.nativeDecimals()
      ),
      marketData: {
        id: this.#ctx.dataSources.coinGecko.id("solana"),
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
        valueChange:
          parseFloat(
            ethers.utils.formatUnits(
              balances.nativeBalance,
              this.nativeDecimals()
            )
          ) *
          calculateUsdChange(prices.solana.usd_24h_change, prices.solana.usd),
      },
      token: SOLANA_DEFAULT_ADDRESS,
    };

    // Map each SPL token into their `TokenBalance` return type object
    const splTokenNodes: TokenBalance[] = nonEmptyOrNftTokens.map((t) => {
      const meta = legacy.get(t.mint);
      const p: CoinGeckoPriceData | null = prices[meta?.id ?? ""] ?? null;

      const marketData: MarketData | null =
        p && meta
          ? {
              id: this.#ctx.dataSources.coinGecko.id(meta.id),
              percentChange: parseFloat(p.usd_24h_change.toFixed(2)),
              usdChange: calculateUsdChange(p.usd_24h_change, p.usd),
              lastUpdatedAt: p.last_updated_at,
              logo: meta.logo,
              price: p.usd,
              value:
                parseFloat(ethers.utils.formatUnits(t.amount, t.decimals)) *
                p.usd,
              valueChange:
                parseFloat(
                  ethers.utils.formatUnits(
                    balances.nativeBalance,
                    this.nativeDecimals()
                  )
                ) * calculateUsdChange(p.usd_24h_change, p.usd),
            }
          : null;

      return {
        id: `${this.id()}_token_address:${t.tokenAccount}`,
        address: t.tokenAccount,
        amount: t.amount.toString(),
        decimals: t.decimals,
        displayAmount: ethers.utils.formatUnits(t.amount, t.decimals),
        marketData,
        token: t.mint,
      };
    });

    return {
      id: `${this.id()}_balances:${address}`,
      aggregate: calculateBalanceAggregate(address, [
        nativeData,
        ...splTokenNodes,
      ]),
      native: nativeData,
      tokens: createConnection(splTokenNodes, false, false),
    };
  }

  /**
   * Get a list of NFT data for tokens owned by the argued address.
   * @param {string} address
   * @param {Partial<NftFiltersInput>} [filters]
   * @returns {Promise<NftConnection>}
   * @memberof Solana
   */
  async getNftsForAddress(
    address: string,
    filters?: Partial<NftFiltersInput>
  ): Promise<NftConnection> {
    // Get the held SPL tokens for the address and reduce to only NFT mint addresses
    const assets = await this.#ctx.dataSources.helius.getBalances(address);
    let nftMints = assets.tokens.reduce<string[]>(
      (acc, curr) =>
        curr.amount === 1 && curr.decimals === 0 ? [...acc, curr.mint] : acc,
      []
    );

    // Optionally filter for only argued NFT mints if provided
    if (filters?.addresses) {
      nftMints = nftMints.filter((n) => filters.addresses!.includes(n));
    }

    if (nftMints.length === 0) {
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

    // Create a map of associated token account addresses
    const atas = getATAAddressesSync({
      mints: metadatas.reduce<Record<string, PublicKey>>((acc, curr) => {
        acc[curr.account] = new PublicKey(curr.account);
        return acc;
      }, {}),
      owner: new PublicKey(address),
    });

    // Map all NFT metadatas into their return type with possible collection data
    const nodes: Nft[] = metadatas.map((m) => {
      const collection = this._parseCollectionMetadata(
        collectionMap,
        m.onChainMetadata
      );

      const attributes: NftAttribute[] | undefined =
        m.offChainMetadata?.metadata?.attributes?.map((a) => ({
          trait: a.trait_type || (a as any).traitType,
          value: a.value,
        }));

      let listing: Listing | undefined = undefined;
      const tensorListing = listings.data.userActiveListings.txs.find(
        (t) => t.tx.mintOnchainId === m.account
      );

      if (tensorListing) {
        listing = {
          id: this.#ctx.dataSources.tensor.id(m.account),
          amount: ethers.utils.formatUnits(
            tensorListing.tx.grossAmount,
            this.nativeDecimals()
          ),
          source: tensorListing.tx.source,
          url: this.#ctx.dataSources.tensor.getListingUrl(m.account),
        };
      }

      return {
        id: `${this.id()}_nft:${m.account}`,
        address: m.account,
        attributes,
        collection,
        description: m.offChainMetadata?.metadata.description || undefined,
        image: m.offChainMetadata?.metadata.image || undefined,
        listing,
        metadataUri:
          m.onChainMetadata?.metadata.data.uri ||
          m.offChainMetadata?.uri ||
          undefined,
        name:
          m.onChainMetadata?.metadata.data.name ||
          m.offChainMetadata?.metadata.name ||
          undefined,
        owner: address,
        token: atas.accounts[m.account].address.toBase58(),
      };
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

      return {
        id: `${this.id()}_transaction:${r.signature}`,
        description: r.description,
        block: r.slot,
        error: transactionError,
        fee: r.fee,
        feePayer: r.feePayer,
        hash: r.signature,
        raw: r,
        source: r.source,
        timestamp: new Date(r.timestamp * 1000).toISOString(),
        transfers: generateTokenTransfers(r),
        type: r.type,
      };
    });

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
          id: `${this.id()}_nft_collection:${
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

/**
 * Generate a semantic list of token transfers from the argued transaction.
 * @param {EnrichedTransaction} tx
 * @returns {TransactionTransfer[]}
 */
function generateTokenTransfers(
  tx: EnrichedTransaction
): TransactionTransfer[] {
  const transfers: TransactionTransfer[] = [];

  if (tx.nativeTransfers && tx.nativeTransfers.length > 0) {
    transfers.push(
      ...tx.nativeTransfers.map(
        (t): TransactionTransfer => ({
          amount: t.amount,
          from: t.fromUserAccount ?? SOLANA_DEFAULT_ADDRESS,
          to: t.toUserAccount ?? SOLANA_DEFAULT_ADDRESS,
          token: SOLANA_DEFAULT_ADDRESS,
          tokenName: "SOL",
        })
      )
    );
  }

  if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
    transfers.push(
      ...tx.tokenTransfers.map(
        (t): TransactionTransfer => ({
          amount: t.tokenAmount,
          from: t.fromUserAccount ?? SOLANA_DEFAULT_ADDRESS,
          to: t.toUserAccount ?? SOLANA_DEFAULT_ADDRESS,
          token: t.mint,
          tokenName: undefined, // FIXME: TODO:
        })
      )
    );
  }

  return transfers;
}
