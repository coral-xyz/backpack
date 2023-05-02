import type { GraphQLResolveInfo } from "graphql";

import { getBlockchainForId } from "./blockchain";
import type { ApiContext } from "./context";
import type {
  Balances,
  ChainId,
  NftConnection,
  QueryResolvers,
  QueryUserArgs,
  QueryWalletArgs,
  RequireFields,
  TransactionConnection,
  User,
  UserResolvers,
  UserWalletsArgs,
  Wallet,
  WalletConnection,
  WalletResolvers,
  WalletTransactionsArgs,
} from "./types";
import { createConnection, inferChainIdFromString } from ".";

/**
 * Root `Query` object resolver.
 * @export
 */
export const queryResolvers: QueryResolvers = {
  /**
   * Handler for the `user` query.
   * @param {{}} _parent
   * @param {RequireFields<QueryUserArgs, "username">} args
   * @param {ApiContext} ctx
   * @param {GraphQLResolveInfo} _info
   * @returns {(Promise<User | null>)}
   */
  async user(
    _parent: {},
    args: RequireFields<QueryUserArgs, "username">,
    ctx: ApiContext,
    _info: GraphQLResolveInfo
  ): Promise<User | null> {
    const resp = await ctx.dataSources.hasura("query")({
      auth_users: [
        { where: { username: { _eq: args.username } }, limit: 1 },
        {
          id: true,
        },
      ],
    });

    if (resp.auth_users.length === 0) {
      return null;
    }

    return {
      id: `user_${resp.auth_users[0].id}`,
      username: args.username,
    };
  },

  /**
   * Handler for the `wallet` query.
   * @param {{}} _parent
   * @param {RequireFields<QueryWalletArgs, 'address' | 'chainId'>} args
   * @param {ApiContext} _ctx
   * @param {GraphQLResolveInfo} _info
   * @returns {(Promise<Wallet | null>)}
   */
  async wallet(
    _parent: {},
    args: RequireFields<QueryWalletArgs, "address" | "chainId">,
    _ctx: ApiContext,
    _info: GraphQLResolveInfo
  ): Promise<Wallet | null> {
    return {
      id: `${args.chainId}/${args.address}`,
      address: args.address,
      chainId: args.chainId,
    };
  },
};

/**
 * Type-level query resolver for the `User` schema object.
 * @export
 */
export const userResolvers: UserResolvers = {
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
    args: Partial<UserWalletsArgs>,
    ctx: ApiContext,
    _info: GraphQLResolveInfo
  ): Promise<WalletConnection | null> {
    const resp = await ctx.dataSources.hasura("query")({
      auth_users: [
        {
          where: { username: { _eq: parent.username } },
          limit: 1,
        },
        {
          public_keys: [
            args.filter?.pubkeys
              ? { where: { public_key: { _in: args.filter.pubkeys } } }
              : {},
            {
              blockchain: true,
              public_key: true,
            },
          ],
        },
      ],
    });

    if (resp.auth_users.length === 0) {
      return null;
    }

    const nodes: Wallet[] = resp.auth_users[0].public_keys.map((pk) => {
      const chain = inferChainIdFromString(pk.blockchain);
      return {
        id: `${chain}/${pk.public_key}`,
        address: pk.public_key,
        chainId: chain,
      };
    });

    return createConnection(nodes, false, false);
  },
};

/**
 * Type-level query resolver for the `Wallet` schema object.
 * @export
 */
export const walletResolvers: WalletResolvers = {
  /**
   * Field-level resolver handler for the `balances` field.
   * @param {Wallet} parent
   * @param {{}} _args
   * @param {ApiContext} ctx
   * @param {GraphQLResolveInfo} _info
   * @returns {(Promise<Balances | null>)}
   */
  async balances(
    parent: Wallet,
    _args: {},
    ctx: ApiContext,
    _info: GraphQLResolveInfo
  ): Promise<Balances | null> {
    const [chainId, address] = parent.id.split("/") as [ChainId, string];
    return getBlockchainForId(chainId, ctx).getBalancesForAddress(address);
  },

  /**
   * Field-level resolver handler for the `nfts` field.
   * @param {Wallet} parent
   * @param {{}} _args
   * @param {ApiContext} ctx
   * @param {GraphQLResolveInfo} _info
   * @returns {(Promise<NftConnection | null>)}
   */
  async nfts(
    parent: Wallet,
    _args: {},
    ctx: ApiContext,
    _info: GraphQLResolveInfo
  ): Promise<NftConnection | null> {
    const [chainId, address] = parent.id.split("/") as [ChainId, string];
    return getBlockchainForId(chainId, ctx).getNftsForAddress(address);
  },

  /**
   * Field-level resolver handler for the `transactions` field.
   * @param {Wallet} parent
   * @param {Partial<WalletTransactionsArgs>} args
   * @param {ApiContext} ctx
   * @param {GraphQLResolveInfo} _info
   * @returns {(Promise<TransactionConnection | null>)}
   */
  async transactions(
    parent: Wallet,
    args: Partial<WalletTransactionsArgs>,
    ctx: ApiContext,
    _info: GraphQLResolveInfo
  ): Promise<TransactionConnection | null> {
    const [chainId, address] = parent.id.split("/") as [ChainId, string];
    return getBlockchainForId(chainId, ctx).getTransactionsForAddress(
      address,
      args.before || undefined,
      args.after || undefined
    );
  },
};
