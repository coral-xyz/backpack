import { RESTDataSource } from "@apollo/datasource-rest";
import { LRUCache } from "lru-cache";

export const IN_MEM_ORD_COLLECTION_DATA_CACHE = new LRUCache<string, any>({
  allowStale: false,
  max: 1000,
  ttl: 1000 * 60 * 30, // 30 minute TTL
  ttlAutopurge: true,
});

type MagicEdenOptions = {
  apiKey: string;
};

/**
 * Custom GraphQL REST data source for the MagicEden API.
 * @export
 * @class MagicEden
 * @extends {RESTDataSource}
 */
export class MagicEden extends RESTDataSource {
  readonly #apiKey: string;

  override baseURL = "https://api-mainnet.magiceden.dev";

  constructor(opts: MagicEdenOptions) {
    super();
    this.#apiKey = opts.apiKey;
  }

  /**
   * Get the ordinals owned by the argued Bitcoin wallet address.
   * @param {string} address
   * @returns {Promise<MagicEdenGetOrdinalsByOwnerResponse>}
   * @memberof MagicEden
   */
  async getOrdinalsByOwner(
    address: string
  ): Promise<MagicEdenGetOrdinalsByOwnerResponse> {
    return this.get("/v2/ord/btc/tokens", {
      params: {
        ownerAddress: address,
        showAll: "true",
        sortBy: "inscriptionNumberDesc",
      },
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${this.#apiKey}`,
      },
    });
  }

  /**
   * Get the collection data for the argued ordinal collection symbols.
   * @param {Set<string>} symbols
   * @returns {Promise<MagicEdenGetOrdinalCollectionResponse>}
   * @memberof MagicEden
   */
  async getOrdinalCollections(
    symbols: Set<string>
  ): Promise<MagicEdenGetOrdinalCollectionResponse> {
    const syms = [...symbols.values()];
    const notInCache = syms.filter(
      (s) => !IN_MEM_ORD_COLLECTION_DATA_CACHE.has(s)
    );

    if (notInCache.length > 0) {
      const responses: MagicEdenGetOrdinalCollectionResponse[string][] =
        await Promise.all(
          notInCache.map((s) =>
            this.get(`/v2/ord/btc/collections/${s}`, {
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${this.#apiKey}`,
              },
            })
          )
        );

      for (const res of responses) {
        IN_MEM_ORD_COLLECTION_DATA_CACHE.set(res.symbol, res);
      }
    }

    return syms.reduce<MagicEdenGetOrdinalCollectionResponse>((acc, curr) => {
      const data = IN_MEM_ORD_COLLECTION_DATA_CACHE.get(curr);
      if (data) {
        acc[curr] = data;
      }
      return acc;
    }, {});
  }

  /**
   * Get the URL of a listed ordinal.
   * @param {string} inscription
   * @returns {string}
   */
  getOrdinalListingUrl(inscription: string): string {
    return `https://magiceden.io/ordinals/item-details/${inscription}`;
  }
}

////////////////////////////////////////////
//                Types                   //
////////////////////////////////////////////

export type MagicEdenGetOrdinalsByOwnerResponse = {
  total: number;
  tokens: Array<{
    id: string;
    chain: string;
    collection?: {
      chain: string;
      description?: string;
      imageURI?: string;
      inscriptionIcon?: string;
      name?: string;
      symbol?: string;
    };
    contentURI: string;
    contentType: string;
    contentBody: string;
    contentPreviewURI: string;
    sat: number;
    satName: string;
    satRarity: string;
    genesisTransaction: string;
    genesisTransactionBlockTime: string;
    genesisTransactionBlockHeight: number;
    genesisTransactionBlockHash: string;
    inscriptionNumber: number;
    meta?: {
      name?: string;
      attributes?: Array<{
        trait_type: string;
        value: string;
      }>;
    };
    owner: string;
    collectionSymbol?: string;
    location: string;
    locationBlockHeight: number;
    locationBlockTime: string;
    locationBlockHash: string;
    outputValue: number;
    output: string;
    mempoolTxId: string;
    mempoolTxTimestamp: string;
    listed: boolean;
    listedAt: string;
    listedPrice: number;
    listedMakerFeeBp: number;
    listedSellerReceiverAddress: string;
    listedForMint: boolean;
    brc20TransferAmt: number;
    brc20ListedUnitPrice: number;
    domain: string;
  }>;
};

export type MagicEdenGetOrdinalCollectionResponse = Record<
  string,
  {
    symbol: string;
    name: string;
    imageURI: string;
    chain: string;
    description: string;
    supply: number;
    twitterLink: string;
    discordLink: string;
    websiteLink: string;
    min_inscription_number: number;
    max_inscription_number: number;
    createdAt: string;
    inscriptionIcon?: string;
  }
>;
