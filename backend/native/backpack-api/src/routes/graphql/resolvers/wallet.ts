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
  return ctx.dataSources.hasura.getWallet(args.chainId, args.address);
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
      filters ?? undefined
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
    { filters }: WalletTransactionsArgs,
    ctx: ApiContext,
    _info: GraphQLResolveInfo
  ): Promise<TransactionConnection | null> {
    return getBlockchainForId(parent.chainId, ctx).getTransactionsForAddress(
      parent.address,
      filters ?? undefined
    );
  },
};
