import type { GraphQLResolveInfo } from "graphql";

import type { ApiContext } from "../../context";
import { NodeBuilder } from "../../nodes";
import { JupiterTokenList, UniswapTokenList } from "../../tokens";
import {
  ChainId,
  type QueryResolvers,
  type QueryTokenListArgs,
  type TokenListEntry,
} from "../../types";

/**
 * Handler for the `tokenList` query.
 * @param {{}} _parent
 * @param {QueryTokenListArgs} args
 * @param {ApiContext} _ctx
 * @param {GraphQLResolveInfo} _info
 * @returns {Promise<TokenListEntry[]>}
 */
export const tokenListQueryResolver: QueryResolvers["tokenList"] = async (
  _parent: {},
  { chainId, filters }: QueryTokenListArgs,
  _ctx: ApiContext,
  _info: GraphQLResolveInfo
): Promise<TokenListEntry[]> => {
  const list =
    chainId === ChainId.Ethereum ? UniswapTokenList : JupiterTokenList;

  if (!filters) {
    return Object.values(list).map((entry) =>
      NodeBuilder.tokenListEntry(entry)
    );
  }

  let items: Omit<TokenListEntry, "id">[] = [];
  if (filters.address) {
    items = [list[filters.address]];
  } else if (filters.name) {
    const finds = Object.values(list).find(
      (entry) => entry.name === filters.name
    );
    if (finds) {
      items = [finds];
    }
  } else if (filters.symbols) {
    items = Object.values(list).filter((entry) =>
      filters.symbols!.includes(entry.symbol)
    );
  }

  return items.map((i) => NodeBuilder.tokenListEntry(i));
};
