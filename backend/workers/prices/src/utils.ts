export class Store {
  constructor(private env: Env) {}

  async get(key: string) {
    return await this.env.PRICES.get(key, "json");
  }

  async set(key: string, value: any) {
    await this.env.PRICES.put(key, JSON.stringify(value));
  }
}

export function jsonResponse(jsonObj: any, status = 200) {
  return new Response(
    JSON.stringify(jsonObj, {
      status,
      headers: {
        "content-type": "application/json",
      },
    })
  );
}

export async function fetchCoinPrices(coin: string) {
  return await coingeckoApi(`coins/${coin}/market_chart`);
}

async function coingeckoApi(resource: string) {
  try {
    const url = `https://api.coingecko.com/api/v3/${resource}?vs_currency=usd&days=1`;
    console.log("url", url);
    const resp = await fetch(url);
    return await resp.json();
  } catch (err) {
    console.log("err", err);
    throw err;
  }
}
