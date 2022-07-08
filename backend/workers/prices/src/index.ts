import { jsonResponse, fetchCoinPrices, Store } from "./utils";

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
    const data = await fetchCoinPrices(coin);
    coinPrices[coin] = {
      ...COINS[coin],
      ...data,
    };
  }
  return coinPrices;
}
