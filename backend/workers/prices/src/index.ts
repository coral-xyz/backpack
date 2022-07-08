export interface Env {
  PRICES: KVNamespace;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const store = new Store(env);
    let _coinPrices = await store.get("prices");
    if (!_coinPrices) {
      try {
        _coinPrices = await fetchPrices();
        await store.set("prices", _coinPrices);
      } catch (err) {
        console.log("err", err);
      }
    }
    return jsonResponse(_coinPrices);
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    await ctx.waitUntil(handleCron(event, env, ctx));
  },
};

async function handleCron(
  request: ScheduledEvent,
  env: Env,
  ctx: ExecutionContext
) {
  const prices = await fetchPrices();
  const result = {
    //    updatedAt: scheduledData,
    prices,
  };
  await env.PRICES.put("prices", JSON.stringify(result));
}

function handleRequest(request: Request, env: Env, ctx: ExecutionContext) {
  // todo
  return {};
}

class Store {
  constructor(private env: Env) {}

  async get(key: string) {
    return await this.env.PRICES.get(key, "json");
  }

  async set(key: string, value: any) {
    await this.env.PRICES.put(key, JSON.stringify(value));
  }
}

function jsonResponse(jsonObj: any, status = 200) {
  return new Response(
    JSON.stringify(jsonObj, {
      status,
      headers: {
        "content-type": "application/json",
      },
    })
  );
}

async function fetchPrices() {
  const COINS = {
    solana: {
      symbol: "SOL",
      name: "Solana",
    },
    ethereum: {
      symbol: "ETH",
      name: "Ethereum",
    },
    serum: {
      symbol: "SRM",
      name: "Serum",
    },
    "ftx-token": {
      symbol: "FTT",
      name: "FTX",
    },
  };

  const coinPrices = {};
  for (const coin in COINS) {
    const data = await coingeckoApi(`coins/${coin}/market_chart`);
    coinPrices[coin] = {
      ...COINS[coin],
      ...data,
    };
  }
  return coinPrices;
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
