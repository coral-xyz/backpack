import type { GraphQLResolveInfo } from "graphql";

import type { ApiContext } from "../../context";
import { NodeBuilder } from "../../nodes";
import { getProviderForId } from "../../providers";
import type {
  Balances,
  NftConnection,
  QueryWalletArgs,
  TransactionConnection,
  Wallet,
  WalletBalancesArgs,
  WalletNftsArgs,
  WalletResolvers,
  WalletTransactionsArgs,
} from "../../types";

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
  { address, providerId }: QueryWalletArgs,
  ctx: ApiContext,
  _info: GraphQLResolveInfo
): Promise<Wallet | null> {
  const p = getProviderForId(providerId, ctx);
  return NodeBuilder.wallet(providerId, {
    address: address,
    provider: NodeBuilder.provider({
      logo: p.logo(),
      name: p.name(),
      providerId,
    }),
    createdAt: new Date().toISOString(),
    isPrimary: false,
  });
}

/**
 * Type-level query resolver for the `Wallet` schema object.
 * @export
 */
export const walletTypeResolvers: WalletResolvers = {
  /**
   * Field-level resolver handler for the `balances` field.
   * @param {Wallet} parent
   * @param {WalletBalancesArgs} args
   * @param {ApiContext} ctx
   * @param {GraphQLResolveInfo} _info
   * @returns {(Promise<Balances | null>)}
   */
  async balances(
    parent: Wallet,
    { filters }: WalletBalancesArgs,
    ctx: ApiContext,
    _info: GraphQLResolveInfo
  ): Promise<Balances | null> {
    return getProviderForId(
      parent.provider.providerId,
      ctx
    ).getBalancesForAddress(parent.address, filters ?? undefined);
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
    return getProviderForId(parent.provider.providerId, ctx).getNftsForAddress(
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
    return getProviderForId(
      parent.provider.providerId,
      ctx
    ).getTransactionsForAddress(parent.address, filters ?? undefined);
  },
};
