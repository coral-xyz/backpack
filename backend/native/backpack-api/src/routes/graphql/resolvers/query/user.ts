import { ethers } from "ethers";
import type { GraphQLResolveInfo } from "graphql";

import type { ApiContext } from "../../context";
import { NodeBuilder } from "../../nodes";
import { getProviderForId } from "../../providers";
import type {
  Balances,
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
import { calculateBalanceAggregate, createConnection } from "../../utils";

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
   * Get the balance and value aggregates for all wallets associated with the user.
   * @param {User} _parent
   * @param {{}} _args
   * @param {ApiContext} ctx
   * @param {GraphQLResolveInfo} _info
   * @returns {Promise<Balances | null>}
   */
  async allWalletsAggregate(
    _parent: User,
    _args: {},
    ctx: ApiContext,
    _info: GraphQLResolveInfo
  ): Promise<Balances | null> {
    // Get all wallets associated with the authenticated user from the database
    const wallets = await ctx.dataSources.hasura.getWallets(
      ctx.authorization.userId!
    );

    if (!wallets || wallets.edges.length === 0) {
      return null;
    }

    // Get the token balances for all wallets received from the user wallet query
    const walletNodes = wallets.edges.map((e) => e.node);
    const walletBalances = await Promise.all(
      walletNodes.map((w) =>
        getProviderForId(w.provider.providerId, ctx).getBalancesForAddress(
          w.address
        )
      )
    );

    // Flatten the list of discovered token balances into a single array to traverse
    const flattenedTokenBalances = walletBalances.reduce<TokenBalance[]>(
      (acc, curr) => {
        if (curr.tokens && curr.tokens.edges.length > 0) {
          acc.push(...curr.tokens.edges.map((e) => e.node));
        }
        return acc;
      },
      []
    );

    // Reduce all of the flattened token balance array items into a map of combined
    // token balances for each discovered token mint or contract address
    const combinedBalances = flattenedTokenBalances.reduce<
      Record<string, TokenBalance>
    >((acc, curr) => {
      if (!acc[curr.token]) {
        acc[curr.token] = curr;
        return acc;
      }

      acc[curr.token].amount = ethers.BigNumber.from(acc[curr.token].amount)
        .add(ethers.BigNumber.from(curr.amount))
        .toString();

      acc[curr.token].displayAmount = ethers.utils.formatUnits(
        acc[curr.token].amount,
        curr.decimals
      );

      if (acc[curr.token].marketData) {
        acc[curr.token].marketData!.value =
          parseFloat(acc[curr.token].displayAmount) *
          acc[curr.token].marketData!.price;

        acc[curr.token].marketData!.valueChange =
          parseFloat(acc[curr.token].displayAmount) *
          acc[curr.token].marketData!.usdChange;
      }

      return acc;
    }, {});

    // Re-sort the new token balance nodes by market value decreasing
    const newTokenNodes = Object.values(combinedBalances).sort(
      (a, b) => (b.marketData?.value ?? 0) - (a.marketData?.value ?? 0)
    );

    // Re-construct and return the new balances node for the user aggregate values
    return NodeBuilder.balances(ctx.authorization.userId!, "AGGREGATE", {
      aggregate: calculateBalanceAggregate(
        ctx.authorization.userId!,
        newTokenNodes
      ),
      tokens: createConnection(newTokenNodes, false, false),
    });
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
    { address, providerId }: UserWalletArgs,
    ctx: ApiContext,
    _info: GraphQLResolveInfo
  ): Promise<Wallet | null> {
    return ctx.dataSources.hasura.getWallet(
      ctx.authorization.userId!,
      address,
      providerId ?? undefined
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
