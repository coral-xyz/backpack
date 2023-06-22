import { RESTDataSource } from "@apollo/datasource-rest";
import { LRUCache } from "lru-cache";

type CoinGeckoIndexerOptions = {
  apiKey: string;
};

const IN_MEM_PRICE_DATA_CACHE = new LRUCache<string, CoinGeckoPriceData>({
  allowStale: false,
  max: 1000,
  ttl: 1000 * 60, // 1 minute TTL
  ttlAutopurge: true,
});

/**
 * Custom GraphQL REST data source class abstraction for CoinGecko.
 * @export
 * @class CoinGecko
 * @extends {RESTDataSource}
 */
export class CoinGeckoIndexer extends RESTDataSource {
  // readonly #apiKey: string;

  override baseURL = "https://price-indexer.backpack.workers.dev";

  constructor(_opts: CoinGeckoIndexerOptions) {
    super();
    // this.#apiKey = opts.apiKey;
  }

  /**
   * Fetches the market price data for the argued asset IDs.
   * @param {string[]} ids
   * @returns {Promise<CoinGeckoGetPricesResponse>}
   * @memberof CoinGecko
   */
  async getPrices(ids: string[]): Promise<CoinGeckoGetPricesResponse> {
    const data: CoinGeckoPriceData[] = [];

    const notInCache: string[] = [];
    for (const i of ids) {
      if (IN_MEM_PRICE_DATA_CACHE.has(i)) {
        data.push(IN_MEM_PRICE_DATA_CACHE.get(i)!);
      } else {
        notInCache.push(i);
      }
    }

    if (notInCache.length > 0) {
      const resp: CoinGeckoPriceData[] = await this.get("/", {
        params: {
          ids: notInCache.join(","),
        },
      });

      data.push(...resp);
    }

    return data.reduce<CoinGeckoGetPricesResponse>((acc, curr) => {
      IN_MEM_PRICE_DATA_CACHE.set(curr.id, curr);
      acc[curr.id] = curr;
      return acc;
    }, {});
  }
}

////////////////////////////////////////////
//                Types                   //
////////////////////////////////////////////

export type CoinGeckoGetPricesResponse = Record<string, CoinGeckoPriceData>;

export type CoinGeckoPriceData = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_filuted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: any | null;
  last_updated: string;
  sparkline_in_7d: {
    price: number[];
  };
  price_change_percentage_24h_in_currency: number;
};
