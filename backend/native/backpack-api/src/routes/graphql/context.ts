import type { ContextFunction } from "@apollo/server";
import type { ExpressContextFunctionArgument } from "@apollo/server/express4";
import type { Request, Response } from "express";
import { LRUCache } from "lru-cache";

import {
  COINGECKO_API_KEY,
  HASURA_URL,
  JWT as HASURA_JWT,
  TENSOR_API_KEY,
} from "../../config";

import { CoinGeckoIndexer, Hasura, Swr, Tensor } from "./clients";
import { extractJwt, getSubjectFromVerifiedJwt } from "./utils";

const IN_MEM_JWT_CACHE = new LRUCache<string, string>({
  allowStale: false,
  max: 1000,
  ttl: 1000 * 60 * 5, // 5 minute TTL
  ttlAutopurge: true,
});

export interface ApiContext {
  // Requesting user authorization and identity data
  authorization: {
    jwt?: string;
    userId?: string;
    valid: boolean;
  };
  // Data source clients that are common to more than one
  // type of provider. If a data source is proprietary to a
  // single provider, if should be instantiated only in that
  // provider's constructor and not placed in the common context
  dataSources: {
    coinGecko: CoinGeckoIndexer;
    hasura: Hasura;
    swr: Swr;
    tensor: Tensor;
  };
  // The original raw HTTP request and response object from express
  http: {
    req: Request;
    res: Response;
  };
  // Custom network options parsed from the request headers
  network: {
    devnet: boolean;
    rpc?: string;
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
> = async ({ req, res }): Promise<ApiContext> => {
  // Bootstrap authorization variables
  let userId: string | undefined = undefined;
  let valid = false;

  // Extract, verify, and decode the JWT if found in the request for the inferred user
  const jwt = extractJwt(req);
  if (jwt) {
    if (IN_MEM_JWT_CACHE.has(jwt)) {
      userId = IN_MEM_JWT_CACHE.get(jwt);
      valid = true;
    } else {
      userId = await getSubjectFromVerifiedJwt(jwt);
      if (userId) {
        valid = true;
        IN_MEM_JWT_CACHE.set(jwt, userId);
      }
    }
  }

  // Extract the target blockchain network from the headers if present
  const devnet: boolean =
    (req.headers["x-blockchain-devnet"] || "false") === "true";
  const rpc: string | undefined =
    (req.headers["x-blockchain-rpc"] as string) || undefined;

  return {
    authorization: {
      jwt,
      userId,
      valid,
    },
    dataSources: {
      coinGecko: new CoinGeckoIndexer({ apiKey: COINGECKO_API_KEY }),
      hasura: new Hasura({ secret: HASURA_JWT, url: HASURA_URL }),
      swr: new Swr({}),
      tensor: new Tensor({ apiKey: TENSOR_API_KEY }),
    },
    http: {
      req,
      res,
    },
    network: {
      devnet,
      rpc,
    },
  };
};
