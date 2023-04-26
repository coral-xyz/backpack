import qs from "qs";

export class CoinGecko {
  static readonly #apiBase: string = "https://api.coingecko.com/api/v3/simple";

  constructor() {}

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
    const query = qs.stringify({
      ids: ids.join(","),
      vs_currencies: "usd",
      include_24hr_change: true,
      include_last_updated_at: true,
    });
    const resp = await fetch(`${CoinGecko.#apiBase}/price?${query}`);
    return resp.json();
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
