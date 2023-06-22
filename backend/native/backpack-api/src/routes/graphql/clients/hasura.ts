import { Chain } from "@coral-xyz/zeus";
import { GraphQLError } from "graphql";

import { NodeBuilder } from "../nodes";
import { getProviderForId } from "../providers";
import {
  type Friend,
  type FriendRequest,
  FriendRequestType,
  type Notification,
  type NotificationConnection,
  type NotificationFiltersInput,
  type ProviderId,
  type User,
  type Wallet,
  type WalletConnection,
  type WalletFiltersInput,
} from "../types";
import { createConnection, inferProviderIdFromString } from "../utils";

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
   * Inserts a new notification entry for the argued data.
   * @param {string} userId
   * @param {string} source
   * @param {string} title
   * @param {(string | Record<string, any>)} body
   * @returns {Promise<Notification>}
   * @memberof Hasura
   */
  async createNotification(
    userId: string,
    source: string,
    title: string,
    body: string | Record<string, any>
  ): Promise<Notification> {
    const b = JSON.stringify(typeof body === "string" ? { data: body } : body);
    const timestamp = new Date();

    const resp = await this.#chain("mutation")(
      {
        insert_auth_notifications_one: [
          {
            object: {
              body: b,
              image: "",
              timestamp,
              title,
              uuid: userId,
              username: "",
              xnft_id: source,
            },
          },
          {
            id: true,
          },
        ],
      },
      { operationName: "CreateNotification" }
    );

    if (!resp.insert_auth_notifications_one) {
      throw new GraphQLError("Failed to create new notification");
    }

    return NodeBuilder.notification({
      body: b,
      dbId: resp.insert_auth_notifications_one.id,
      source,
      title,
      timestamp: timestamp.toISOString(),
      viewed: false,
    });
  }

  /**
   * Deletes a friend request in the data from the argued user ID to
   * the other user ID.
   * @param {string} from
   * @param {string} to
   * @memberof Hasura
   */
  async deleteFriendRequest(from: string, to: string) {
    await this.#chain("mutation")(
      {
        delete_auth_friend_requests: [
          {
            where: { from: { _eq: from }, to: { _eq: to } },
          },
          { affected_rows: true },
        ],
      },
      { operationName: "DeleteFriendRequest" }
    );
  }

  /**
   * Return a list of friends for the argued user ID.
   * @param {string} id
   * @returns {Promise<string[]>}
   * @memberof Hasura
   */
  async getFriends(id: string): Promise<Friend[]> {
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
      return [];
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
            public_keys: [
              { where: { is_primary: { _eq: true } } },
              { blockchain: true, public_key: true },
            ],
          },
        ],
      },
      { operationName: "GetFriendDetailsFromIds" }
    );

    return detailsResp.auth_users.map((u) =>
      NodeBuilder.friend(u.id, {
        avatar: `https://swr.xnfts.dev/avatars/${u.username}`,
        primaryWallets: u.public_keys.map((pk) => {
          const provider = getProviderForId(
            inferProviderIdFromString(pk.blockchain)
          );
          return NodeBuilder.friendPrimaryWallet(u.id as string, {
            address: pk.public_key,
            provider: NodeBuilder.provider({
              logo: provider.logo(),
              name: provider.name(),
              providerId: provider.id(),
            }),
          });
        }),
        username: u.username as string,
      })
    );
  }

  /**
   * Return a list of friend requests that have been sent
   * or received by the argued user ID.
   * @param {string} id
   * @returns {Promise<FriendRequest[]>}
   * @memberof Hasura
   */
  async getFriendRequests(id: string): Promise<FriendRequest[]> {
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

    return resp.auth_friend_requests.map((r) =>
      NodeBuilder.friendRequest(r.id, {
        type:
          id === r.from ? FriendRequestType.Sent : FriendRequestType.Received,
        userId: id === r.from ? r.to : r.from,
      })
    );
  }

  /**
   *
   * @param {string} id
   * @param {NotificationFiltersInput | null} [filters]
   * @returns {Promise<NotificationConnection>}
   * @memberof Hasura
   */
  async getNotifications(
    id: string,
    filters?: NotificationFiltersInput | null
  ): Promise<NotificationConnection> {
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
            order_by: filters?.sortDirection
              ? [
                  {
                    timestamp: filters.sortDirection.toLowerCase() as any,
                  },
                ]
              : undefined,
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
      return createConnection([], false, false);
    }

    // Create the list of notification type nodes for the connection
    const nodes = resp.auth_notifications.map((n) =>
      NodeBuilder.notification({
        body: n.body,
        dbId: n.id,
        source: n.xnft_id,
        timestamp: new Date(n.timestamp as string).toISOString(),
        title: n.title,
        viewed: n.viewed ?? false,
      })
    );

    const conn = createConnection(
      nodes,
      false,
      false
    ) as NotificationConnection;

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
        auth_users_by_pk: [
          { id },
          {
            created_at: true,
            username: true,
          },
        ],
      },
      { operationName: "GetUserDetailsById" }
    );

    if (!resp.auth_users_by_pk) {
      return null;
    }

    const user = resp.auth_users_by_pk as {
      created_at: string;
      username: string;
    };

    return NodeBuilder.user({
      avatar: `https://swr.xnfts.dev/avatars/${user.username}`,
      createdAt: new Date(user.created_at).toISOString(),
      userId: id,
      username: user.username,
    });
  }

  /**
   * Get a single wallet matching the argued address that is owned
   * by the user ID in the database.
   * @param {string} id
   * @param {string} address
   * @param {ProviderId} [providerId]
   * @returns {Promise<Wallet | null>}
   * @memberof Hasura
   */
  async getWallet(
    id: string,
    address: string,
    providerId?: ProviderId
  ): Promise<Wallet | null> {
    // Query Hasura for a single public key owned by the argued user ID
    // and matches the argued public key address
    const resp = await this.#chain("query")(
      {
        auth_public_keys: [
          {
            limit: 1,
            where: {
              public_key: { _eq: address },
              user_id: { _eq: id },
            },
          },
          {
            blockchain: true,
            created_at: true,
            is_primary: true,
          },
        ],
      },
      { operationName: "GetSingleUserPublicKey" }
    );

    if (resp.auth_public_keys.length === 0) {
      return null;
    }

    const { blockchain, created_at, is_primary } = resp.auth_public_keys[0];
    const provider = getProviderForId(
      providerId ?? inferProviderIdFromString(blockchain)
    );

    return NodeBuilder.wallet(provider.id(), {
      address,
      provider: NodeBuilder.provider({
        logo: provider.logo(),
        name: provider.name(),
        providerId: provider.id(),
      }),
      createdAt: new Date(created_at as string).toISOString(),
      isPrimary: is_primary ?? false,
    });
  }

  /**
   * Get the list of wallets registered for the argued user ID.
   * @param {string} id
   * @param {(WalletFiltersInput | null)} [filters]
   * @returns {(Promise<WalletConnection | null>)}
   * @memberof Hasura
   */
  async getWallets(
    id: string,
    filters?: WalletFiltersInput | null
  ): Promise<WalletConnection | null> {
    // Query Hasura for the list of registered wallet public keys
    // and associated blockchains for the parent `User` username,
    // optionally filtered by the field-level filter input if provided
    const resp = await this.#chain("query")(
      {
        auth_public_keys: [
          {
            where: {
              blockchain: filters?.providerId
                ? { _eq: filters.providerId.toLowerCase() }
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

    const nodes = resp.auth_public_keys.map((pk) => {
      const provider = getProviderForId(
        inferProviderIdFromString(pk.blockchain)
      );

      return NodeBuilder.wallet(provider.id(), {
        address: pk.public_key,
        provider: NodeBuilder.provider({
          logo: provider.logo(),
          name: provider.name(),
          providerId: provider.id(),
        }),
        createdAt: new Date(pk.created_at as string).toISOString(),
        isPrimary: pk.is_primary ?? false,
      });
    });

    return createConnection(nodes, false, false);
  }
}
