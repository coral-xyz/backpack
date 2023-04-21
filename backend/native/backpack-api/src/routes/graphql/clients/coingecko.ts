import qs from "qs";

const API_BASE = "https://api.coingecko.com/api/v3/simple";

export abstract class CoinGecko {
  static async getPrices<I extends string>(
    ids: I[]
  ): Promise<CoinGeckoGetPricesResponse<I>> {
    const query = qs.stringify({
      ids: ids.join(","),
      vs_currencies: "usd",
      include_24hr_change: true,
      include_last_updated_at: true,
    });
    const resp = await fetch(`${API_BASE}/price?${query}`);
    return resp.json();
  }
}

export type CoinGeckoGetPricesResponse<I extends string> = Record<
  I,
  CoinGeckoPriceData
>;

export type CoinGeckoPriceData = {
  usd: number;
  usd_24h_change: number;
  last_updated_at: number;
};
