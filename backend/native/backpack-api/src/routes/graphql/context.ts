import type { ContextFunction } from "@apollo/server";
import type { ExpressContextFunctionArgument } from "@apollo/server/express4";
import { Chain } from "@coral-xyz/zeus";
import { Alchemy } from "alchemy-sdk";
import { GraphQLError } from "graphql";

import { HASURA_URL, JWT } from "../../config";

import { CoinGecko, Helius, Tensor } from "./clients";

export interface ApiContext {
  authorization: {
    jwt?: string;
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
  let jwt: string | undefined = undefined;

  const authHeader = req.headers.authorization ?? "";
  if (authHeader.startsWith("Bearer ")) {
    jwt = authHeader.split(" ")[1];
  }

  // if (!jwt) {
  //   throw new GraphQLError("User authorization token was not found", {
  //     extensions: {
  //       code: "UNAUTHORIZED",
  //       http: { status: 401 },
  //     },
  //   });
  // }

  // TODO: add jwt validation as well

  return {
    authorization: {
      jwt,
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
