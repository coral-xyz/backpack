import type { GraphQLResolveInfo } from "graphql";

import type { ApiContext } from "../../context";
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
    return Object.values(list).map((entry) => ({
      id: `token_list_entry:${entry.address}`,
      ...entry,
    }));
  }

  let item: Omit<TokenListEntry, "id"> | undefined = undefined;
  if (filters.address) {
    item = list[filters.address];
  } else if (filters.name) {
    item = Object.values(list).find((entry) => entry.name === filters.name);
  } else if (filters.symbol) {
    item = Object.values(list).find((entry) => entry.symbol === filters.symbol);
  }

  return item
    ? [
        {
          id: `token_list_entry:${item.address}`,
          ...item,
        },
      ]
    : [];
};
