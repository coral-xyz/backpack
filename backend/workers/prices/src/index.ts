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
    const _coinPrices = await store.get("prices");
    try {
      const coinPrices = await fetchPrices();
    } catch (err) {
      console.log("err", err);
    }
    //		await store.set("prices", coinPrices);
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
    return JSON.parse(await this.env.PRICES.get(key));
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
  console.log("here", coinPrices);
  const ids = Object.keys(COINS);
  for (let k = 0; k < ids.length; k += 1) {
    const id = ids[k];
    const data = await coingeckoApi(`coins/${id}/market_chart`);
    console.log("data here", data);
    coinPrices[id] = {
      ...COINS[id],
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
