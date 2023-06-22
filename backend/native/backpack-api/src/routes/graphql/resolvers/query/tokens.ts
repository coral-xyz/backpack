import {
  BitcoinToken,
  EthereumTokenList,
  SolanaTokenList,
} from "@coral-xyz/common";
import type { GraphQLResolveInfo } from "graphql";

import type { ApiContext } from "../../context";
import { NodeBuilder } from "../../nodes";
import {
  ProviderId,
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
  { providerId, filters }: QueryTokenListArgs,
  _ctx: ApiContext,
  _info: GraphQLResolveInfo
): Promise<TokenListEntry[]> => {
  const list =
    providerId === ProviderId.Ethereum
      ? EthereumTokenList
      : providerId === ProviderId.Solana
      ? SolanaTokenList
      : { [BitcoinToken.address]: BitcoinToken };

  if (!filters) {
    return Object.values(list).map((entry) =>
      NodeBuilder.tokenListEntry(entry)
    );
  }

  let items: Omit<TokenListEntry, "id">[] = [];

  // Filter based on argued list of token addresses
  if (filters.addresses) {
    items = filters.addresses.reduce<(typeof list)[string][]>((acc, curr) => {
      const val = list[curr];
      if (val) {
        acc.push(val);
      }
      return acc;
    }, []);

    // Filter based on a single token name
  } else if (filters.name) {
    const finds = Object.values(list).find(
      (entry) => entry.name === filters.name
    );
    if (finds) {
      items = [finds];
    }

    // Filter based on argued list token symbols
  } else if (filters.symbols) {
    items = Object.values(list).filter((entry) =>
      filters.symbols!.includes(entry.symbol)
    );
  }

  return items.map((i) => NodeBuilder.tokenListEntry(i));
};
