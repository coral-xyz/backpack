import type { ContextFunction } from "@apollo/server";
import type { ExpressContextFunctionArgument } from "@apollo/server/express4";
import { Chain } from "@coral-xyz/zeus";
import { Alchemy } from "alchemy-sdk";
import type { Request } from "express";
import { importSPKI, jwtVerify } from "jose";

import { AUTH_JWT_PUBLIC_KEY, HASURA_URL, JWT } from "../../config";

import { CoinGecko, Helius, Tensor } from "./clients";

export interface ApiContext {
  authorization: {
    jwt?: string;
    userId?: string;
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
  let userId: string | undefined = undefined;
  let valid = false;

  // Extract, verify, and decode the JWT if found in the request for the inferred user
  const jwt = extractJwt(req);
  if (jwt) {
    const publicKey = await importSPKI(AUTH_JWT_PUBLIC_KEY, "RS256");

    try {
      const resp = await jwtVerify(jwt, publicKey, {
        issuer: "auth.xnfts.dev",
        audience: "backpack",
      });

      userId = resp.payload.sub;
      valid = true;
    } catch {
      // NOOP
    }
  }

  return {
    authorization: {
      jwt,
      userId,
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
