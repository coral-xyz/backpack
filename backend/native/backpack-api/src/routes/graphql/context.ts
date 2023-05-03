import type { ContextFunction } from "@apollo/server";
import type { ExpressContextFunctionArgument } from "@apollo/server/express4";
import { Chain } from "@coral-xyz/zeus";
import { Alchemy } from "alchemy-sdk";

import { HASURA_URL, JWT } from "../../config";

import { CoinGecko, Helius, Tensor } from "./clients";

export interface ApiContext {
  authorization: {
    jwt?: string;
    username?: string;
    valid: boolean;
  };
  dataSources: {
    alchemy: Alchemy;
    coinGecko: CoinGecko;
    hasura: ReturnType<typeof Chain>;
    helius: Helius;
    tensor: Tensor;
  };
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
  // Bootstrap authorization variables
  let jwt: string | undefined = undefined;
  let username: string | undefined = undefined;
  let valid = false;

  // Check for and parse the bearer token if found in the authorization header for a JWT
  const authHeader = req.headers.authorization ?? "";
  if (authHeader.startsWith("Bearer ")) {
    jwt = authHeader.split(" ")[1];
  }

  // Verify and decode the JWT if found in the request for the inferred user
  if (jwt) {
    username = "backpack_dev"; // FIXME:TODO: add jwt verification and decoding
    valid = true;
  }

  return {
    authorization: {
      jwt,
      username,
      valid,
    },
    dataSources: {
      alchemy: new Alchemy({ apiKey: process.env.ALCHEMY_API_KEY }),
      coinGecko: new CoinGecko(),
      hasura: Chain(HASURA_URL, {
        headers: {
          Authorization: `Bearer ${JWT}`,
        },
      }),
      helius: new Helius(process.env.HELIUS_API_KEY ?? ""),
      tensor: new Tensor(process.env.TENSOR_API_KEY ?? ""),
    },
  };
};
