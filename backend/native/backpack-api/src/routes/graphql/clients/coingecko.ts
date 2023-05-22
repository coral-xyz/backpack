import { RESTDataSource } from "@apollo/datasource-rest";

type CoinGeckoOptions = {
  apiKey: string;
};

/**
 * Custom GraphQL REST data source class abstraction for CoinGecko.
 * @export
 * @class CoinGecko
 * @extends {RESTDataSource}
 */
export class CoinGecko extends RESTDataSource {
  readonly #apiKey: string;

  override baseURL = "https://pro-api.coingecko.com";

  constructor(opts: CoinGeckoOptions) {
    super();
    this.#apiKey = opts.apiKey;
  }

  /**
   * Fetches the market price data for the argued asset IDs.
   * @template I
   * @param {I[]} ids
   * @returns {Promise<CoinGeckoGetPricesResponse<I>>}
   * @memberof CoinGecko
   */
  async getPrices(ids: string[]): Promise<CoinGeckoGetPricesResponse> {
    const resp: CoinGeckoPriceData[] = await this.get("/api/v3/coins/markets", {
      headers: {
        "x-cg-pro-api-key": this.#apiKey,
      },
      params: {
        ids: ids.join(","),
        page: "1",
        price_change_percentage: "24h",
        sparkline: "true",
        vs_currency: "usd",
      },
    });

    return resp.reduce<CoinGeckoGetPricesResponse>((acc, curr) => {
      acc[curr.id] = curr;
      return acc;
    }, {});
  }

  /**
   * Return the node ID for Coingecko market data.
   * @param {string} currency
   * @returns {string}
   * @memberof CoinGecko
   */
  id(currency: string): string {
    return `coingecko_market_data:${currency}`;
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
