import { BitcoinToken } from "@coral-xyz/common";
import { ethers } from "ethers";

import { MAGIC_EDEN_API_KEY } from "../../../config";
import { BlockchainInfo, MagicEden } from "../clients";
import type {
  MagicEdenGetOrdinalCollectionResponse,
  MagicEdenGetOrdinalsByOwnerResponse,
} from "../clients/magiceden";
import type { ApiContext } from "../context";
import { NodeBuilder } from "../nodes";
import type {
  BalanceFiltersInput,
  Balances,
  Collection,
  Nft,
  NftConnection,
  NftFiltersInput,
  TokenBalance,
  Transaction,
  TransactionConnection,
  TransactionFiltersInput,
} from "../types";
import { ProviderId } from "../types";
import { calculateBalanceAggregate, createConnection } from "../utils";

import type { BlockchainDataProvider } from ".";
import { createMarketDataNode } from "./util";

export type BitcoinProviderSettings = {
  context?: ApiContext;
};

/**
 * Bitcoin blockchain implementation for the common API.
 * @export
 * @class Bitcoin
 * @implements {BlockchainDataProvider}
 */
export class Bitcoin implements BlockchainDataProvider {
  readonly #ctx?: ApiContext;
  readonly #sdk: { btc: BlockchainInfo; ord: MagicEden };

  constructor({ context }: BitcoinProviderSettings) {
    this.#ctx = context;
    this.#sdk = {
      btc: new BlockchainInfo({}),
      ord: new MagicEden({ apiKey: MAGIC_EDEN_API_KEY }),
    };
  }

  /**
   * Chain ID enum variant.
   * @returns {ProviderId}
   * @memberof Bitcoin
   */
  id(): ProviderId {
    return ProviderId.Bitcoin;
  }

  /**
   * Native coin decimals.
   * @returns {number}
   * @memberof Bitcoin
   */
  decimals(): number {
    return 8;
  }

  /**
   * Default native address.
   * @returns {string}
   * @memberof Bitcoin
   */
  defaultAddress(): string {
    return BitcoinToken.address;
  }

  /**
   * Logo of the native coin.
   * @returns {string}
   * @memberof Bitcoin
   */
  logo(): string {
    return BitcoinToken.logo!;
  }

  /**
   * The display name of the data provider.
   * @returns {string}
   * @memberof Bitcoin
   */
  name(): string {
    return BitcoinToken.name;
  }

  /**
   * Fetch and aggregate the native and prices for the argued wallet address.
   * @param {string} address
   * @param {BalanceFiltersInput} [_filters]
   * @returns {Promise<Balances>}
   * @memberof Bitcoin
   */
  async getBalancesForAddress(
    address: string,
    _filters?: BalanceFiltersInput
  ): Promise<Balances> {
    if (!this.#ctx) {
      throw new Error("API context object not available");
    }

    const balance = await this.#sdk.btc.getBalance(address);
    const prices = await this.#ctx.dataSources.coinGecko.getPrices(["bitcoin"]);
    const displayAmount = ethers.utils.formatUnits(
      balance.final_balance,
      this.decimals()
    );

    const nodes: TokenBalance[] = [
      NodeBuilder.tokenBalance(
        this.id(),
        {
          address,
          amount: balance.final_balance.toString(),
          decimals: this.decimals(),
          displayAmount,
          marketData: createMarketDataNode(
            displayAmount,
            "bitcoin",
            prices.bitcoin
          ),
          token: this.defaultAddress(),
          tokenListEntry: NodeBuilder.tokenListEntry({
            address: BitcoinToken.address,
            coingeckoId: "bitcoin",
            logo: BitcoinToken.logo,
            name: BitcoinToken.name,
            symbol: BitcoinToken.symbol,
          }),
        },
        true
      ),
    ];

    return NodeBuilder.balances(address, this.id(), {
      aggregate: calculateBalanceAggregate(address, nodes),
      tokens: createConnection(nodes, false, false),
    });
  }

  /**
   * Get a list of NFT data for tokens owned by the argued address.
   * @param {string} address
   * @param {NftFiltersInput} [_filters]
   * @returns {Promise<NftConnection>}
   * @memberof Bitcoin
   */
  async getNftsForAddress(
    address: string,
    _filters?: NftFiltersInput | undefined
  ): Promise<NftConnection> {
    if (!this.#ctx) {
      throw new Error("API context object not available");
    }

    const ordinals = await this.#sdk.ord.getOrdinalsByOwner(address);
    const collectionSymbols = ordinals.tokens.reduce<Set<string>>(
      (acc, curr) => {
        const s = _parseCollectionSymbol(curr);
        if (s) {
          acc.add(s);
        }
        return acc;
      },
      new Set()
    );

    const collections = await this.#sdk.ord.getOrdinalCollections(
      collectionSymbols
    );

    const nodes: Nft[] = ordinals.tokens.map((ord) =>
      NodeBuilder.nft(this.id(), {
        address: ord.id,
        attributes: ord.meta?.attributes?.map((attr) => ({
          trait: attr.trait_type,
          value: attr.value,
        })),
        collection: _getCollectionData(
          this.id(),
          collections,
          _parseCollectionSymbol(ord)
        ),
        compressed: false,
        image: ord.contentType.startsWith("image") ? ord.contentURI : undefined,
        listing: ord.listed
          ? NodeBuilder.nftListing(this.id(), "", {
              amount: ethers.utils.formatUnits(
                ord.listedPrice,
                this.decimals()
              ),
              source: ord.listedAt,
              url: this.#sdk.ord.getOrdinalListingUrl(ord.id),
            })
          : undefined,
        name: ord.meta?.name,
        owner: address,
        token: ord.inscriptionNumber.toString(),
      })
    );

    return createConnection(nodes, false, false);
  }

  /**
   * Get the transaction history with parameters for the argued address.
   * @param {string} address
   * @param {TransactionFiltersInput} [filters]
   * @returns {Promise<TransactionConnection>}
   * @memberof Bitcoin
   */
  async getTransactionsForAddress(
    address: string,
    filters?: TransactionFiltersInput
  ): Promise<TransactionConnection> {
    if (!this.#ctx) {
      throw new Error("API context object not available");
    }

    const resp = await this.#sdk.btc.getRawAddressData(
      address,
      filters?.offset ?? undefined
    );

    const nodes: Transaction[] = resp.txs.map((t) =>
      NodeBuilder.transaction(this.id(), {
        block: t.block_index,
        fee: `${ethers.utils.formatUnits(t.fee, this.decimals())} BTC`,
        hash: t.hash,
        raw: t,
        timestamp: new Date(t.time).toISOString(),
        type: "standard",
      })
    );

    const hasNext = resp.n_tx > (filters?.offset ?? 0) + 50;
    const hasPrevious = filters?.offset ? filters.offset > 0 : false;
    return createConnection(nodes, hasNext, hasPrevious);
  }
}

/**
 * Try to find and build the NFT collection node from the argued symbol.
 * @param {ProviderId} providerId
 * @param {MagicEdenGetOrdinalCollectionResponse} collections
 * @param {string} [symbol]
 * @returns {(Collection | undefined)}
 */
function _getCollectionData(
  providerId: ProviderId,
  collections: MagicEdenGetOrdinalCollectionResponse,
  symbol?: string
): Collection | undefined {
  if (!symbol) {
    return undefined;
  }
  const collectionData = symbol ? collections[symbol] : undefined;
  return collectionData
    ? NodeBuilder.nftCollection(providerId, {
        address: collectionData.symbol,
        image: collectionData.imageURI,
        name: collectionData.name,
        verified: false,
      })
    : undefined;
}

/**
 * Attempt to find and return the symbol for the ordinal collection
 * @param {MagicEdenGetOrdinalsByOwnerResponse['tokens'][number]} ordinal
 * @returns {(string | undefined)}
 */
function _parseCollectionSymbol(
  ordinal: MagicEdenGetOrdinalsByOwnerResponse["tokens"][number]
): string | undefined {
  return ordinal.collectionSymbol || ordinal.collection?.symbol || undefined;
}
