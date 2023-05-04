import type { GraphQLResolveInfo } from "graphql";

import type { ApiContext } from "../context";
import type {
  Friend,
  User,
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
    const resp = await ctx.dataSources.hasura("query")(
      {
        auth_users: [
          {
            where: { username: { _eq: parent.username } },
            limit: 1,
          },
          {
            public_keys: [
              filters && Object.keys(filters).length > 0
                ? {
                    where: {
                      blockchain: filters.chainId
                        ? { _eq: filters.chainId.toLowerCase() }
                        : undefined,
                      public_key: filters.pubkeys
                        ? { _in: filters.pubkeys }
                        : undefined,
                    },
                  }
                : {},
              {
                blockchain: true,
                public_key: true,
              },
            ],
          },
        ],
      },
      { operationName: "GetUserPublicKeys" }
    );

    if (resp.auth_users.length === 0) {
      return null;
    }

    const nodes: Wallet[] = resp.auth_users[0].public_keys.map((pk) => {
      const chain = inferChainIdFromString(pk.blockchain);
      return {
        id: `${chain}_wallet:${pk.public_key}`,
        address: pk.public_key,
        chainId: chain,
      };
    });

    return createConnection(nodes, false, false);
  },
};
