import type { GraphQLResolveInfo } from "graphql";

import type { ApiContext } from "../context";
import {
  type Friend,
  type FriendRequest,
  FriendRequestType,
  type Friendship,
  type FriendshipResolvers,
} from "../types";

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
   * @returns {(Promise<Friend[] | null>)}
   */
  async friends(
    _parent: Friendship,
    _args: {},
    ctx: ApiContext,
    _info: GraphQLResolveInfo
  ): Promise<Friend[] | null> {
    // Query Hasura for a list of user ID pairs that represent the active
    // friendships of the user inferred by the user ID in the decoded JWT
    const idsResp = await ctx.dataSources.hasura("query")(
      {
        auth_friendships: [
          {
            where: {
              are_friends: { _eq: true },
              _or: [
                { user1: { _eq: ctx.authorization.userId } },
                { user2: { _eq: ctx.authorization.userId } },
              ],
            },
          },
          {
            user1: true,
            user2: true,
          },
        ],
      },
      { operationName: "GetFriends" }
    );

    if (idsResp.auth_friendships.length === 0) {
      return null;
    }

    const friendIds = idsResp.auth_friendships.map((f) =>
      f.user1 === ctx.authorization.userId ? f.user2 : f.user1
    );

    // Query Hasura for the username of the each user ID in the
    // discovered friends list from the previous query
    const detailsResp = await ctx.dataSources.hasura("query")(
      {
        auth_users: [
          {
            where: { id: { _in: friendIds } },
          },
          {
            id: true,
            username: true,
          },
        ],
      },
      { operationName: "GetFriendsDetails" }
    );

    if (detailsResp.auth_users.length === 0) {
      return null;
    }

    return detailsResp.auth_users.map((u) => ({
      id: `friend:${u.id}`,
      avatar: `https://swr.xnfts.dev/avatars/${u.username}`,
      username: u.username as string,
    }));
  },

  /**
   * Field-level resolver handler for the `requests` field.
   * @param {Friendship} _parent
   * @param {{}} _args
   * @param {ApiContext} ctx
   * @param {GraphQLResolveInfo} _info
   * @returns {(Promise<FriendRequest[] | null>)}
   */
  async requests(
    _parent: Friendship,
    _args: {},
    ctx: ApiContext,
    _info: GraphQLResolveInfo
  ): Promise<FriendRequest[] | null> {
    // Query Hasura for a list inbound and outbound friend requests
    // for the user ID derived from the contextual JWT
    const resp = await ctx.dataSources.hasura("query")(
      {
        auth_friend_requests: [
          {
            where: {
              _or: [
                { from: { _eq: ctx.authorization.userId } },
                { to: { _eq: ctx.authorization.userId } },
              ],
            },
          },
          {
            id: true,
            from: true,
            to: true,
          },
        ],
      },
      { operationName: "GetFriendRequests" }
    );

    if (resp.auth_friend_requests.length === 0) {
      return null;
    }

    return resp.auth_friend_requests.map((r) => ({
      id: `friend_request:${r.id}`,
      type:
        ctx.authorization.userId === r.from
          ? FriendRequestType.Sent
          : FriendRequestType.Received,
      user: ctx.authorization.userId === r.from ? r.to : r.from,
    }));
  },
};
