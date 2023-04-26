import { RESTDataSource } from "@apollo/datasource-rest";

export class CoinGecko extends RESTDataSource {
  override baseURL = "https://api.coingecko.com";

  constructor() {
    super();
  }

  /**
   * Fetches the market price data for the argued asset IDs.
   * @template I
   * @param {I[]} ids
   * @returns {Promise<CoinGeckoGetPricesResponse<I>>}
   * @memberof CoinGecko
   */
  async getPrices<I extends string>(
    ids: I[]
  ): Promise<CoinGeckoGetPricesResponse<I>> {
    return this.get("/api/v3/simple/price", {
      params: {
        ids: ids.join(","),
        vs_currencies: "usd",
        include_24hr_change: "true",
        include_last_updated_at: "true",
      },
    });
  }
}

////////////////////////////////////////////
//                Types                   //
////////////////////////////////////////////

export type CoinGeckoGetPricesResponse<I extends string> = Record<
  I,
  CoinGeckoPriceData
>;

export type CoinGeckoPriceData = {
  usd: number;
  usd_24h_change: number;
  last_updated_at: number;
};
