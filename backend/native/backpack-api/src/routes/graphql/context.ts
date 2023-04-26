import { Alchemy } from "alchemy-sdk";

import { CoinGecko } from "./clients/coingecko";
import { Helius } from "./clients/helius";

export interface ApiContext {
  dataSources: {
    alchemy: Alchemy;
    coinGecko: CoinGecko;
    helius: Helius;
  };
}

/**
 * Create the custom context object to pass into all resolvers.
 * @export
 * @returns {Promise<ApiContext>}
 */
export async function createContext(): Promise<ApiContext> {
  return {
    dataSources: {
      alchemy: new Alchemy({ apiKey: process.env.ALCHEMY_API_KEY }),
      coinGecko: new CoinGecko(),
      helius: new Helius(process.env.HELIUS_API_KEY ?? ""),
    },
  };
}
