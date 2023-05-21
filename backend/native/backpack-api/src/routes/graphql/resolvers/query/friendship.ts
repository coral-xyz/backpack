import type { GraphQLResolveInfo } from "graphql";

import type { ApiContext } from "../../context";
import type {
  Friend,
  FriendRequest,
  Friendship,
  FriendshipResolvers,
} from "../../types";

/**
 * Type-level query resolver for the `Friendship` schema object.
 * @export
 */
export const friendshipTypeResolvers: FriendshipResolvers = {
  /**
   * Field-level resolver handler for the `friends` field.
   * @param {Friendship} _parent
   * @param {{}} _args
   * @param {ApiContext} ctx
   * @param {GraphQLResolveInfo} _info
   * @returns {Promise<Friend[]>}
   */
  async friends(
    _parent: Friendship,
    _args: {},
    ctx: ApiContext,
    _info: GraphQLResolveInfo
  ): Promise<Friend[]> {
    return ctx.dataSources.hasura.getFriends(ctx.authorization.userId!);
  },

  /**
   * Field-level resolver handler for the `requests` field.
   * @param {Friendship} _parent
   * @param {{}} _args
   * @param {ApiContext} ctx
   * @param {GraphQLResolveInfo} _info
   * @returns {Promise<FriendRequest[]>}
   */
  async requests(
    _parent: Friendship,
    _args: {},
    ctx: ApiContext,
    _info: GraphQLResolveInfo
  ): Promise<FriendRequest[]> {
    return ctx.dataSources.hasura.getFriendRequests(ctx.authorization.userId!);
  },
};
