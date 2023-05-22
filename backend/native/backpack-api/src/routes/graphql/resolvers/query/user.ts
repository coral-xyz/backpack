import type { GraphQLResolveInfo } from "graphql";

import { getBlockchainForId } from "../../blockchain";
import type { ApiContext } from "../../context";
import type {
  BalanceAggregate,
  Friendship,
  NotificationConnection,
  QueryResolvers,
  TokenBalance,
  User,
  UserNotificationsArgs,
  UserResolvers,
  UserWalletArgs,
  UserWalletsArgs,
  Wallet,
  WalletConnection,
} from "../../types";
import { calculateBalanceAggregate } from "../../utils";

/**
 * Handler for the `user` query.
 * @export
 * @param {{}} _parent
 * @param {{}} _args
 * @param {ApiContext} ctx
 * @param {GraphQLResolveInfo} _info
 * @returns {Promise<User | null>}
 */
export const userQueryResolver: QueryResolvers["user"] = async (
  _parent: {},
  _args: {},
  ctx: ApiContext,
  _info: GraphQLResolveInfo
): Promise<User | null> => {
  return ctx.dataSources.hasura.getUser(ctx.authorization.userId!);
};

/**
 * Type-level query resolver for the `User` schema object.
 * @export
 */
export const userTypeResolvers: UserResolvers = {
  /**
   * Field-level resolver for the `aggregate` field.
   * @param {User} parent
   * @param {{}} _args
   * @param {ApiContext} ctx
   * @param {GraphQLResolveInfo} _info
   * @returns {Promise<BalanceAggregate | null>}
   */
  async aggregate(
    parent: User,
    _args: {},
    ctx: ApiContext,
    _info: GraphQLResolveInfo
  ): Promise<BalanceAggregate | null> {
    const walletsConnection =
      parent.wallets ??
      (await ctx.dataSources.hasura.getWallets(ctx.authorization.userId!));

    if (!walletsConnection) {
      return null;
    }

    const walletNodes = walletsConnection.edges.map((e) => e.node);
    const balances = await Promise.all(
      walletNodes.map((n) => {
        if (n.balances) {
          return Promise.resolve(n.balances);
        }
        return getBlockchainForId(n.chainId, ctx).getBalancesForAddress(
          n.address
        );
      })
    );

    const flatBalances = balances.reduce<TokenBalance[]>((acc, curr) => {
      const tokens = curr.tokens?.edges.map((e) => e.node) ?? [];
      return [curr.native, ...tokens, ...acc];
    }, []);

    return calculateBalanceAggregate(ctx.authorization.userId!, flatBalances);
  },

  /**
   * Field-level resolver handler for the `friendship` field.
   * @param {User} _parent
   * @param {{}} _args
   * @param {ApiContext} _ctx
   * @param {GraphQLResolveInfo} _info
   * @returns {(Promise<Friendship | null>)}
   */
  async friendship(
    _parent: User,
    _args: {},
    _ctx: ApiContext,
    _info: GraphQLResolveInfo
  ): Promise<Friendship | null> {
    // Return an empty object so that the separate resolvers
    // for the `friendship` sub-fields are executed if requested
    return {};
  },

  /**
   * Field-level resolver handler for the `notifications` field.
   * @param {User} _parent
   * @param {UserNotificationsArgs} args
   * @param {ApiContext} ctx
   * @param {GraphQLResolveInfo} _info
   * @returns {(Promise<NotificationConnection | null>)}
   */
  async notifications(
    _parent: User,
    { filters }: UserNotificationsArgs,
    ctx: ApiContext,
    _info: GraphQLResolveInfo
  ): Promise<NotificationConnection | null> {
    return ctx.dataSources.hasura.getNotifications(
      ctx.authorization.userId!,
      filters
    );
  },

  /**
   * Field-level resolver handler for the `wallet` field.
   * @param {User} _parent
   * @param {UserWalletArgs} args
   * @param {ApiContext} ctx
   * @param {GraphQLResolveInfo} _info
   * @returns {Promise<Wallet | null>}
   */
  async wallet(
    _parent: User,
    { address }: UserWalletArgs,
    ctx: ApiContext,
    _info: GraphQLResolveInfo
  ): Promise<Wallet | null> {
    return ctx.dataSources.hasura.getWallet(ctx.authorization.userId!, address);
  },

  /**
   * Field-level resolver handler for the `wallets` field.
   * @param {User} _parent
   * @param {UserWalletsArgs} args
   * @param {ApiContext} ctx
   * @param {GraphQLResolveInfo} _info
   * @returns {(Promise<WalletConnection | null>)}
   */
  async wallets(
    _parent: User,
    { filters }: UserWalletsArgs,
    ctx: ApiContext,
    _info: GraphQLResolveInfo
  ): Promise<WalletConnection | null> {
    return ctx.dataSources.hasura.getWallets(
      ctx.authorization.userId!,
      filters
    );
  },
};
