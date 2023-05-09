import { Chain } from "@coral-xyz/zeus";

import {
  type ChainId,
  type Friend,
  type FriendRequest,
  FriendRequestType,
  type Notification,
  type NotificationConnection,
  type NotificationsFiltersInput,
  type User,
  type Wallet,
  type WalletConnection,
  type WalletsFiltersInput,
} from "../types";
import { createConnection, inferChainIdFromString } from "../utils";

type HasuraOptions = {
  secret: string;
  url: string;
};

/**
 * Custom Hasura data source class abstraction.
 * @export
 * @class Hasura
 */
export class Hasura {
  readonly #chain: ReturnType<typeof Chain>;

  constructor(opts: HasuraOptions) {
    this.#chain = Chain(opts.url, {
      headers: {
        Authorization: `Bearer ${opts.secret}`,
      },
    });
  }

  /**
   * Return a list of friends for the argued user ID.
   * @param {string} id
   * @returns {Promise<string[]>}
   * @memberof Hasura
   */
  async getFriends(id: string): Promise<Friend[] | null> {
    // Query Hasura for a list of user ID pairs that represent the active
    // friendships of the user argued
    const resp = await this.#chain("query")(
      {
        auth_friendships: [
          {
            where: {
              are_friends: { _eq: true },
              _or: [{ user1: { _eq: id } }, { user2: { _eq: id } }],
            },
          },
          {
            user1: true,
            user2: true,
          },
        ],
      },
      { operationName: "GetFriendIdsForUser" }
    );

    if (resp.auth_friendships.length === 0) {
      return null;
    }

    const ids = resp.auth_friendships.map((f) =>
      f.user1 === id ? f.user2 : f.user1
    );

    // Query Hasura for the username of the each user ID in the
    // discovered friends list from the previous query
    const detailsResp = await this.#chain("query")(
      {
        auth_users: [
          {
            where: { id: { _in: ids } },
          },
          {
            id: true,
            username: true,
          },
        ],
      },
      { operationName: "GetFriendDetailsFromIds" }
    );

    return detailsResp.auth_users.length > 0
      ? detailsResp.auth_users.map((u) => ({
          id: `friend:${u.id}`,
          avatar: `https://swr.xnfts.dev/avatars/${u.username}`,
          username: u.username as string,
        }))
      : null;
  }

  /**
   * Return a list of friend requests that have been sent
   * or received by the argued user ID.
   * @param {string} id
   * @returns {(Promise<FriendRequest[] | null>)}
   * @memberof Hasura
   */
  async getFriendRequests(id: string): Promise<FriendRequest[] | null> {
    // Query Hasura for a list inbound and outbound friend requests
    // for the user ID derived from the contextual JWT
    const resp = await this.#chain("query")(
      {
        auth_friend_requests: [
          {
            where: {
              _or: [{ from: { _eq: id } }, { to: { _eq: id } }],
            },
          },
          {
            id: true,
            from: true,
            to: true,
          },
        ],
      },
      { operationName: "GetFriendRequestsForUser" }
    );

    return resp.auth_friend_requests.length > 0
      ? resp.auth_friend_requests.map((r) => ({
          id: `friend_request:${r.id}`,
          type:
            id === r.from ? FriendRequestType.Sent : FriendRequestType.Received,
          user: id === r.from ? r.to : r.from,
        }))
      : null;
  }

  /**
   *
   * @param {string} id
   * @param {NotificationsFiltersInput | null} [filters]
   * @returns {(Promise<NotificationConnection | null>)}
   * @memberof Hasura
   */
  async getNotifications(
    id: string,
    filters?: NotificationsFiltersInput | null
  ): Promise<NotificationConnection | null> {
    // Query Hasura for the list of notifications for the user
    // that match the input filter(s) if provided
    const resp = await this.#chain("query")(
      {
        auth_notifications: [
          {
            where: {
              uuid: { _eq: id },
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
              uuid: { _eq: id },
            },
          },
          {
            last_read_notificaiton: true,
          },
        ],
      },
      { operationName: "GetNotificationsForUser" }
    );

    if (resp.auth_notifications.length === 0) {
      return null;
    }

    // Create the list of notification type nodes for the connection
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
  }

  /**
   * Return a partial user details object based on the
   * argued user ID.
   * @param {string} id
   * @returns {(Promise<User | null>)}
   * @memberof Hasura
   */
  async getUser(id: string): Promise<User | null> {
    // Query Hasura for the user details for the user ID inferred
    // from the discover and decoded JWT in the request
    const resp = await this.#chain("query")(
      {
        auth_users: [
          { where: { id: { _eq: id } }, limit: 1 },
          {
            id: true,
            created_at: true,
            username: true,
          },
        ],
      },
      { operationName: "GetUserDetailsById" }
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
   * Get the details for the wallet matching the argued address
   * and blockchain ID.
   * @param {ChainId} chainId
   * @param {string} address
   * @returns {(Promise<Wallet | null>)}
   * @memberof Hasura
   */
  async getWallet(chainId: ChainId, address: string): Promise<Wallet | null> {
    // Query Hasura for the peripheral database details about the wallet
    const resp = await this.#chain("query")({
      auth_public_keys: [
        {
          where: {
            blockchain: { _eq: chainId.toLowerCase() },
            public_key: { _eq: address },
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
      id: `${chainId}_wallet:${address}`,
      address: address,
      chainId: chainId,
      createdAt: new Date(
        resp.auth_public_keys[0].created_at as string
      ).toISOString(),
      isPrimary: resp.auth_public_keys[0].is_primary ?? false,
    };
  }

  /**
   * Get the list of wallets registered for the argued user ID.
   * @param {string} id
   * @param {(WalletsFiltersInput | null)} [filters]
   * @returns {(Promise<WalletConnection | null>)}
   * @memberof Hasura
   */
  async getWallets(
    id: string,
    filters?: WalletsFiltersInput | null
  ): Promise<WalletConnection | null> {
    // Query Hasura for the list of registered wallet public keys
    // and associated blockchains for the parent `User` username,
    // optionally filtered by the field-level filter input if provided
    const resp = await this.#chain("query")(
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
              user_id: { _eq: id },
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
  }
}
