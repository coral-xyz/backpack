import type { GraphQLResolveInfo } from "graphql";

import type { ApiContext } from "../context";
import type {
  Friend,
  Notification,
  User,
  UserNotificationsArgs,
  UserResolvers,
  UserWalletsArgs,
  Wallet,
  WalletConnection,
} from "../types";
import { createConnection, inferChainIdFromString } from "../utils";

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
  // Query Hasura for the user details for the user ID inferred
  // from the discover and decoded JWT in the request
  const resp = await ctx.dataSources.hasura("query")(
    {
      auth_users: [
        { where: { id: { _eq: ctx.authorization.userId } }, limit: 1 },
        {
          id: true,
          created_at: true,
          username: true,
        },
      ],
    },
    { operationName: "GetUserDetails" }
  );

  if (resp.auth_users.length === 0) {
    return null;
  }

  const user = resp.auth_users[0] as {
    id: string;
    created_at: string;
    username: string;
  };

  return {
    id: `user:${user.id}`,
    avatar: `https://swr.xnfts.dev/avatars/${user.username}`,
    createdAt: new Date(user.created_at).toISOString(),
    username: user.username,
  };
}

/**
 * Type-level query resolver for the `User` schema object.
 * @export
 */
export const userTypeResolvers: UserResolvers = {
  async friends(
    _parent: User,
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
   * Field-level resolver handler for the `notifications` field.
   * @param {User} parent
   * @param {Partial<UserNotificationsArgs>} args
   * @param {ApiContext} ctx
   * @param {GraphQLResolveInfo} _info
   * @returns {(Promise<Notification[] | null>)}
   */
  async notifications(
    parent: User,
    { filters }: Partial<UserNotificationsArgs>,
    ctx: ApiContext,
    _info: GraphQLResolveInfo
  ): Promise<Notification[] | null> {
    // Query Hasura for the list of notifications for the user
    // that match the input filter(s) if provided
    const resp = await ctx.dataSources.hasura("query")(
      {
        auth_notifications: [
          {
            where: {
              uuid: { _eq: ctx.authorization.userId },
              viewed: filters?.unreadOnly ? { _eq: false } : undefined,
            },
            limit: filters?.limit,
          },
          {
            id: true,
            body: true,
            timestamp: true,
            title: true,
            viewed: true,
            xnft_id: true,
          },
        ],
      },
      { operationName: "GetUserNotifications" }
    );

    if (resp.auth_notifications.length === 0) {
      return null;
    }

    return resp.auth_notifications.map((n) => ({
      id: `notification:${n.id}`,
      body: n.body,
      source: n.xnft_id,
      timestamp: new Date(n.timestamp as string).toISOString(),
      title: n.title,
      viewed: n.viewed ?? false,
    }));
  },

  /**
   * Field-level resolver handler for the `wallets` field.
   * @param {User} parent
   * @param {Partial<UserWalletsArgs>} args
   * @param {ApiContext} ctx
   * @param {GraphQLResolveInfo} _info
   * @returns {(Promise<WalletConnection | null>)}
   */
  async wallets(
    parent: User,
    { filters }: Partial<UserWalletsArgs>,
    ctx: ApiContext,
    _info: GraphQLResolveInfo
  ): Promise<WalletConnection | null> {
    // Query Hasura for the list of registered wallet public keys
    // and associated blockchains for the parent `User` username,
    // optionally filtered by the field-level filter input if provided
    const resp = await ctx.dataSources.hasura("query")(
      {
        auth_public_keys: [
          {
            where: {
              blockchain: filters?.chainId
                ? { _eq: filters.chainId.toLowerCase() }
                : undefined,
              is_primary: filters?.primaryOnly ? { _eq: true } : undefined,
              public_key: filters?.pubkeys
                ? { _in: filters.pubkeys }
                : undefined,
              user_id: { _eq: ctx.authorization.userId },
            },
          },
          {
            blockchain: true,
            created_at: true,
            is_primary: true,
            public_key: true,
          },
        ],
      },
      { operationName: "GetUserPublicKeys" }
    );

    if (resp.auth_public_keys.length === 0) {
      return null;
    }

    const nodes: Wallet[] = resp.auth_public_keys.map((pk) => {
      const chain = inferChainIdFromString(pk.blockchain);
      return {
        id: `${chain}_wallet:${pk.public_key}`,
        address: pk.public_key,
        chainId: chain,
        createdAt: new Date(pk.created_at as string).toISOString(),
        isPrimary: pk.is_primary ?? false,
      };
    });

    return createConnection(nodes, false, false);
  },
};
