import type { GraphQLResolveInfo } from "graphql";

import type { ApiContext } from "../context";
import type {
  Friendship,
  NotificationConnection,
  User,
  UserNotificationsArgs,
  UserResolvers,
  UserWalletsArgs,
  WalletConnection,
} from "../types";

/**
 * Handler for the `user` query.
 * @export
 * @param {{}} _parent
 * @param {{}} _args
 * @param {ApiContext} ctx
 * @param {GraphQLResolveInfo} _info
 * @returns {(Promise<User | null>)}
 */
export async function userQueryResolver(
  _parent: {},
  _args: {},
  ctx: ApiContext,
  _info: GraphQLResolveInfo
): Promise<User | null> {
  return ctx.dataSources.hasura.getUser(ctx.authorization.userId!);
}

/**
 * Type-level query resolver for the `User` schema object.
 * @export
 */
export const userTypeResolvers: UserResolvers = {
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
