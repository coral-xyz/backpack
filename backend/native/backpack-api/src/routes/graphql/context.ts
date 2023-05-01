import type { ContextFunction } from "@apollo/server";
import type { ExpressContextFunctionArgument } from "@apollo/server/express4";
import { Chain } from "@coral-xyz/zeus";
import { Alchemy } from "alchemy-sdk";

import { HASURA_URL, JWT } from "../../config";

import { CoinGecko } from "./clients/coingecko";
import { Helius } from "./clients/helius";

export interface ApiContext {
  dataSources: {
    alchemy: Alchemy;
    coinGecko: CoinGecko;
    hasura: ReturnType<typeof Chain>;
    helius: Helius;
  };
  jwt?: string;
}

/**
 * Create the custom context object to pass into all resolvers.
 * @export
 * @returns {Promise<ApiContext>}
 */
export const createContext: ContextFunction<
  [ExpressContextFunctionArgument],
  ApiContext
> = async ({ req }): Promise<ApiContext> => {
  let jwt: string | undefined = undefined;

  const authHeader = req.headers.authorization ?? "";
  if (authHeader.startsWith("Bearer ")) {
    jwt = authHeader.split(" ")[1];
  }

  return {
    dataSources: {
      alchemy: new Alchemy({ apiKey: process.env.ALCHEMY_API_KEY }),
      coinGecko: new CoinGecko(),
      hasura: Chain(HASURA_URL, {
        headers: {
          Authorization: `Bearer ${JWT}`,
        },
      }),
      helius: new Helius(process.env.HELIUS_API_KEY ?? ""),
    },
    jwt,
  };
};
