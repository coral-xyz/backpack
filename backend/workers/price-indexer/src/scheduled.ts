import {
  BitcoinToken,
  EclipseTokenList,
  EthereumTokenList,
  PolygonTokenList,
  SolanaTokenList,
} from "@coral-xyz/common/src/tokens";

import type { CoinGeckoPriceData, Environment } from "./types";

const COINGECKO_API_URL = "https://pro-api.coingecko.com/api/v3/coins/markets?";

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    const chunk = items.slice(i, i + size);
    chunks.push(chunk);
  }
  return chunks;
}

export const scheduledHandler: ExportedHandlerScheduledHandler<
  Environment
> = async (_event, env, _ctx) => {
  const mergedTokenLists = [
    BitcoinToken,
    ...Object.values(EclipseTokenList),
    ...Object.values(EthereumTokenList),
    ...Object.values(PolygonTokenList),
    ...Object.values(SolanaTokenList),
  ];

  const uniqueTokenIds = mergedTokenLists.reduce<Set<string>>((acc, curr) => {
    if (curr.coingeckoId && !acc.has(curr.coingeckoId)) {
      acc.add(curr.coingeckoId);
    }
    return acc;
  }, new Set());

  const allTokensToRequest = chunk([...uniqueTokenIds.values()], 50);

  for (const tokens of allTokensToRequest) {
    const params = new URLSearchParams({
      ids: tokens.join(","),
      page: "1",
      per_page: "100",
      price_change_percentage: "24h",
      sparkline: "true",
      vs_currency: "usd",
    });

    const response = await fetch(COINGECKO_API_URL + params, {
      headers: {
        "x-cg-pro-api-key": env.COINGECKO_API_KEY,
      },
    });

    const json: CoinGeckoPriceData[] = await response.json();

    await Promise.all(
      json.map((j) =>
        env.PRICES_KV.put(j.id, JSON.stringify(j), { expirationTtl: 100 })
      )
    );

    console.log(`Updated statuses for: ${json.map((j) => j.id).join(", ")}`);
  }
};
