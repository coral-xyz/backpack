import type { BalanceAggregate, Node, PageInfo, TokenBalance } from "./types";
import { ChainId } from "./types";

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
      totalValueChange > 0
        ? (totalValueChange / (totalValue - totalValueChange)) * 100
        : 0,
    value: totalValue,
    valueChange: totalValueChange,
  };
}

/**
 * Calculates percent change from coingecko data
 * @export
 * @param {number} percentChange
 * @param {number} price
 * @returns {number}
 */
export function calculateUsdChange(
  percentChange: number,
  price: number
): number {
  const usdChange = (percentChange / 100) * price;
  return Number(usdChange.toFixed(2));
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
 * Infer and return a ChainId enum variant from the argued string value.
 * @export
 * @param {string} val
 * @returns {(ChainId | never)}
 */
export function inferChainIdFromString(val: string): ChainId | never {
  switch (val) {
    case "ethereum": {
      return ChainId.Ethereum;
    }

    case "solana": {
      return ChainId.Solana;
    }

    default: {
      throw new Error(`unknown chain id string: ${val}`);
    }
  }
}
