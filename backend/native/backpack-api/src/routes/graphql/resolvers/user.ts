import type { GraphQLResolveInfo } from "graphql";

import type { ApiContext } from "../context";
import type {
  Friendship,
  Notification,
  NotificationConnection,
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
  /**
   * Field-level resolver handler for the `friendship` field.
   * @param {User} _parent
   * @param {{}} _args
   * @param {ApiContext} _ctx
   * @param {GraphQLResolveInfo} _info
   * @returns {*}  {(Promise<Friendship | null>)}
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
   * @param {Partial<UserNotificationsArgs>} args
   * @param {ApiContext} ctx
   * @param {GraphQLResolveInfo} _info
   * @returns {(Promise<NotificationConnection | null>)}
   */
  async notifications(
    _parent: User,
    { filters }: Partial<UserNotificationsArgs>,
    ctx: ApiContext,
    _info: GraphQLResolveInfo
  ): Promise<NotificationConnection | null> {
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
        auth_notification_cursor: [
          {
            where: {
              uuid: { _eq: ctx.authorization.userId },
            },
          },
          {
            last_read_notificaiton: true,
          },
        ],
      },
      { operationName: "GetUserNotifications" }
    );

    if (resp.auth_notifications.length === 0) {
      return null;
    }

    // Create the connection nodes from the received array of notifications
    const nodes: Notification[] = resp.auth_notifications.map((n) => ({
      id: `notification:${n.id}`,
      body: n.body,
      source: n.xnft_id,
      timestamp: new Date(n.timestamp as string).toISOString(),
      title: n.title,
      viewed: n.viewed ?? false,
    }));

    const conn = createConnection(
      nodes,
      false,
      false
    ) as NotificationConnection | null;

    // Append the last read notification ID to the connection object
    // if one was found and there is a valid connection to be returned
    if (conn && resp.auth_notification_cursor.length > 0) {
      conn.lastReadId = resp.auth_notification_cursor[0].last_read_notificaiton;
    }

    return conn;
  },

  /**
   * Field-level resolver handler for the `wallets` field.
   * @param {User} _parent
   * @param {Partial<UserWalletsArgs>} args
   * @param {ApiContext} ctx
   * @param {GraphQLResolveInfo} _info
   * @returns {(Promise<WalletConnection | null>)}
   */
  async wallets(
    _parent: User,
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
