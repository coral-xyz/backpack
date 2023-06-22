import type { Request } from "express";
import { importSPKI, jwtVerify } from "jose";

import { AUTH_JWT_PUBLIC_KEY } from "../../config";

import {
  type BalanceAggregate,
  type Node,
  type PageInfo,
  ProviderId,
  type TokenBalance,
} from "./types";

export type Edge<T extends Node> = {
  cursor: string;
  node: T;
};

export type Connection<T extends Node> = {
  edges: Edge<T>[];
  pageInfo: PageInfo;
};

/**
 * Calculate the aggregate value and changes of market data for the argued
 * list of token balance objects.
 * @export
 * @param {string} owner
 * @param {TokenBalance[]} balances
 * @returns {BalanceAggregate}
 */
export function calculateBalanceAggregate(
  owner: string,
  balances: TokenBalance[]
): BalanceAggregate {
  const totalValue = balances.reduce(
    (acc, curr) => (curr.marketData ? acc + curr.marketData.value : acc),
    0
  );

  const totalValueChange = balances.reduce(
    (acc, curr) => (curr.marketData ? acc + curr.marketData.valueChange : acc),
    0
  );

  return {
    id: `balance_aggregate:${owner}`,
    percentChange:
      Math.abs(totalValueChange) > 0
        ? (totalValueChange / (totalValue - totalValueChange)) * 100
        : 0,
    value: totalValue,
    valueChange: totalValueChange,
  };
}

/**
 * Generate a Relay connection from a list of node objects.
 * @export
 * @template T
 * @param {T[]} nodes
 * @param {boolean} hasNextPage
 * @param {boolean} hasPreviousPage
 * @returns {Connection<T>}
 */
export function createConnection<T extends Node>(
  nodes: T[],
  hasNextPage: boolean,
  hasPreviousPage: boolean
): Connection<T> {
  const edges: Edge<T>[] = nodes.map((i) => ({
    cursor: Buffer.from(`edge_cursor:${i.id}`).toString("base64"),
    node: i,
  }));

  return {
    edges,
    pageInfo: {
      startCursor: edges.at(0)?.cursor,
      endCursor: edges.at(-1)?.cursor,
      hasNextPage,
      hasPreviousPage,
    },
  };
}

/**
 * Attempt to find and extract a JWT from the argued request.
 * @export
 * @param {Request} req
 * @returns {(string | undefined)}
 */
export function extractJwt(req: Request): string | undefined {
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

/**
 * Verify and return the subject of the argued JWT.
 * @export
 * @param {string} jwt
 * @param {boolean} [isXnft]
 * @returns {Promise<string | undefined>}
 */
export async function getSubjectFromVerifiedJwt(
  jwt: string,
  isXnft?: boolean
): Promise<string | undefined> {
  try {
    const publicKey = await importSPKI(AUTH_JWT_PUBLIC_KEY, "RS256");

    const resp = await jwtVerify(jwt, publicKey, {
      issuer: "auth.xnfts.dev",
      audience: "backpack",
    });
    return resp.payload.sub;
  } catch {
    // NOOP
    return undefined;
  }
}

/**
 * Infer and return a ProviderId enum variant from the argued string value.
 * @export
 * @param {string} val
 * @returns {(ProviderId | never)}
 */
export function inferProviderIdFromString(val: string): ProviderId | never {
  switch (val.toLowerCase()) {
    case "ethereum": {
      return ProviderId.Ethereum;
    }

    case "solana": {
      return ProviderId.Solana;
    }

    default: {
      throw new Error(`unknown chain id string: ${val}`);
    }
  }
}
