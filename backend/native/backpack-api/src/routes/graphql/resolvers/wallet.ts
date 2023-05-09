import type { GraphQLResolveInfo } from "graphql";

import { getBlockchainForId } from "../blockchain";
import type { ApiContext } from "../context";
import type {
  Balances,
  NftConnection,
  QueryWalletArgs,
  TransactionConnection,
  Wallet,
  WalletNftsArgs,
  WalletResolvers,
  WalletTransactionsArgs,
} from "../types";

/**
 * Handler for the `wallet` query.
 * @export
 * @param {{}} _parent
 * @param {QueryWalletArgs} args
 * @param {ApiContext} ctx
 * @param {GraphQLResolveInfo} _info
 * @returns {(Promise<Wallet | null>)}
 */
export async function walletQueryResolver(
  _parent: {},
  args: QueryWalletArgs,
  ctx: ApiContext,
  _info: GraphQLResolveInfo
): Promise<Wallet | null> {
  // Query Hasura for the peripheral database details about the wallet
  const resp = await ctx.dataSources.hasura("query")({
    auth_public_keys: [
      {
        where: {
          blockchain: { _eq: args.chainId.toLowerCase() },
          public_key: { _eq: args.address },
        },
        limit: 1,
      },
      {
        created_at: true,
        is_primary: true,
      },
    ],
  });

  if (resp.auth_public_keys.length === 0) {
    return null;
  }

  return {
    id: `${args.chainId}_wallet:${args.address}`,
    address: args.address,
    chainId: args.chainId,
    createdAt: new Date(
      resp.auth_public_keys[0].created_at as string
    ).toISOString(),
    isPrimary: resp.auth_public_keys[0].is_primary ?? false,
  };
}

/**
 * Type-level query resolver for the `Wallet` schema object.
 * @export
 */
export const walletTypeResolvers: WalletResolvers = {
  /**
   * Field-level resolver handler for the `balances` field.
   * @param {Wallet} parent
   * @param {{}} _args
   * @param {ApiContext} ctx
   * @param {GraphQLResolveInfo} _info
   * @returns {(Promise<Balances | null>)}
   */
  async balances(
    parent: Wallet,
    _args: {},
    ctx: ApiContext,
    _info: GraphQLResolveInfo
  ): Promise<Balances | null> {
    return getBlockchainForId(parent.chainId, ctx).getBalancesForAddress(
      parent.address
    );
  },

  /**
   * Field-level resolver handler for the `nfts` field.
   * @param {Wallet} parent
   * @param {Partial<WalletNftsArgs>} args
   * @param {ApiContext} ctx
   * @param {GraphQLResolveInfo} _info
   * @returns {(Promise<NftConnection | null>)}
   */
  async nfts(
    parent: Wallet,
    { filters }: Partial<WalletNftsArgs>,
    ctx: ApiContext,
    _info: GraphQLResolveInfo
  ): Promise<NftConnection | null> {
    return getBlockchainForId(parent.chainId, ctx).getNftsForAddress(
      parent.address,
      filters?.mints as string[] | undefined
    );
  },

  /**
   * Field-level resolver handler for the `transactions` field.
   * @param {Wallet} parent
   * @param {WalletTransactionsArgs} args
   * @param {ApiContext} ctx
   * @param {GraphQLResolveInfo} _info
   * @returns {(Promise<TransactionConnection | null>)}
   */
  async transactions(
    parent: Wallet,
    args: WalletTransactionsArgs,
    ctx: ApiContext,
    _info: GraphQLResolveInfo
  ): Promise<TransactionConnection | null> {
    return getBlockchainForId(parent.chainId, ctx).getTransactionsForAddress(
      parent.address,
      args.before || undefined,
      args.after || undefined
    );
  },
};
