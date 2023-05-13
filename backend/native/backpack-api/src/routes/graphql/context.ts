import type { ContextFunction } from "@apollo/server";
import type { ExpressContextFunctionArgument } from "@apollo/server/express4";
import { Alchemy, Network } from "alchemy-sdk";
import type { Request, Response } from "express";
import { importSPKI, jwtVerify } from "jose";
import { LRUCache } from "lru-cache";

import {
  ALCHEMY_API_KEY,
  AUTH_JWT_PUBLIC_KEY,
  HASURA_URL,
  HELIUS_API_KEY,
  JWT as HASURA_JWT,
  TENSOR_API_KEY,
} from "../../config";

import { CoinGecko, Hasura, Helius, Tensor } from "./clients";

const IN_MEM_JWT_CACHE = new LRUCache<string, string>({
  allowStale: false,
  max: 1000,
  ttl: 1000 * 60 * 5,
});

export interface ApiContext {
  authorization: {
    jwt?: string;
    userId?: string;
    valid: boolean;
  };
  dataSources: {
    alchemy: Alchemy;
    coinGecko: CoinGecko;
    hasura: Hasura;
    helius: Helius;
    tensor: Tensor;
  };
  devnet: boolean;
  http: {
    req: Request;
    res: Response;
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
      const publicKey = await importSPKI(AUTH_JWT_PUBLIC_KEY, "RS256");

      try {
        const resp = await jwtVerify(jwt, publicKey, {
          issuer: "auth.xnfts.dev",
          audience: "backpack",
        });

        userId = resp.payload.sub;
        valid = true;

        IN_MEM_JWT_CACHE.set(jwt, userId);
      } catch {
        // NOOP
      }
    }
  }

  // Extract the target blockchain network from the headers if present
  const devnet: boolean =
    (req.headers["x-blockchain-devnet"] || "false") === "true";

  return {
    authorization: {
      jwt,
      userId,
      valid,
    },
    dataSources: {
      alchemy: new Alchemy({
        apiKey: ALCHEMY_API_KEY,
        network: devnet ? Network.ETH_SEPOLIA : Network.ETH_MAINNET,
      }),
      coinGecko: new CoinGecko(),
      hasura: new Hasura({ secret: HASURA_JWT, url: HASURA_URL }),
      helius: new Helius({ apiKey: HELIUS_API_KEY, devnet }),
      tensor: new Tensor({ apiKey: TENSOR_API_KEY }),
    },
    devnet,
    http: {
      req,
      res,
    },
  };
};

/**
 * Attempt to find and extract a JWT from the argued request.
 * @param {Request} req
 * @returns {(string | undefined)}
 */
function extractJwt(req: Request): string | undefined {
  let jwt: string | undefined = undefined;
  const authHeader = req.headers.authorization ?? "";
  if (authHeader.startsWith("Bearer")) {
    jwt = authHeader.split(" ")[1];
  } else if (req.cookies.jwt) {
    jwt = req.cookies.jwt;
  } else if (req.query.jwt) {
    jwt = req.query.jwt as string;
  }
  return jwt;
}
