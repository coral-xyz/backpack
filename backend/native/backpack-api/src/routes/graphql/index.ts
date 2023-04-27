import { queryResolvers, walletResolvers } from "./query";
import type { Node, PageInfo, Resolvers } from "./types";

export const resolvers: Resolvers = {
  Query: queryResolvers,
  Wallet: walletResolvers,
};

export type Edge<T extends Node> = {
  cursor: string;
  node: T;
};

export type Connection<T extends Node> = {
  edges: Edge<T>[];
  pageInfo: PageInfo;
};

/**
 * Generate a Relay connection from a list of node objects
 * @export
 * @template T
 * @param {T[]} nodes
 * @param {boolean} hasNextPage
 * @param {boolean} hasPreviousPage
 * @param {string} cursorPrefix
 * @returns {(Connection<T> | null)}
 */
export function createConnection<T extends Node>(
  nodes: T[],
  hasNextPage: boolean,
  hasPreviousPage: boolean,
  cursorPrefix: string
): Connection<T> | null {
  const edges: Edge<T>[] = nodes.map((i) => ({
    cursor: `${cursorPrefix}_${i.id}`,
    node: i,
  }));

  return edges.length === 0
    ? null
    : {
        edges,
        pageInfo: {
          startCursor: edges[0].cursor,
          endCursor: edges.at(-1)?.cursor,
          hasNextPage,
          hasPreviousPage,
        },
      };
}
