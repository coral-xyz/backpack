export interface Env {
  PRICES: KVNamespace;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    if (request.url.endsWith("/cron")) {
      return handleCron(request, env, ctx);
    } else {
      const j = await env.PRICES.get("prices", { type: "json" });
      return jsonResponse(j);
    }
  },
};

async function handleCron(request: Request, env: Env, ctx: ExecutionContext) {
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

async function fetchPrices() {
  const coinPrices = {};
  const ids = Object.keys(COINS);
  for (let k = 0; k < ids.length; k += 1) {
    const id = ids[k];
    const data = await coingeckoApi(`coins/${id}/market_chart`);
    coinPrices[id] = {
      ...COINS[id],
      ...data,
    };
  }
  return coinPrices;
}

async function coingeckoApi(resource: string) {
  return await (
    await fetch(
      `https://api.coingecko.com/api/v3/${resource}?vs_currency=usd&days=1`
    )
  ).json();
}
