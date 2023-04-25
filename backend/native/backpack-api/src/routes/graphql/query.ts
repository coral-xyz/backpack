import type { GraphQLResolveInfo } from "graphql";

import { getBlockchainForId } from "./blockchain";
import type { ApiContext } from "./context";
import type {
  Nft,
  QueryResolvers,
  QueryWalletArgs,
  RequireFields,
  Wallet,
  WalletBalances,
  WalletResolvers,
} from "./types";

/**
 * Root `Query` object resolver.
 */
export const queryResolvers: QueryResolvers = {
  /**
   * Handler for the `wallet` query.
   * @param {{}} _parent
   * @param {RequireFields<QueryWalletArgs, 'address' | 'chainId'>} _args
   * @param {ApiContext} _ctx
   * @param {GraphQLResolveInfo} _info
   * @returns {(Promise<Wallet | null>)}
   */
  async wallet(
    _parent: {},
    _args: RequireFields<QueryWalletArgs, "address" | "chainId">,
    _ctx: ApiContext,
    _info: GraphQLResolveInfo
  ): Promise<Wallet | null> {
    return {};
  },
};

/**
 * Type-level query resolver for the `Wallet` schema object.
 */
export const walletResolvers: WalletResolvers = {
  /**
   * Field-level resolver handler for the `balances` field.
   * @param {Wallet} _parent
   * @param {{}} _args
   * @param {ApiContext} ctx
   * @param {GraphQLResolveInfo} info
   * @returns {(Promise<WalletBalances | null>)}
   */
  async balances(
    _parent: Wallet,
    _args: {},
    ctx: ApiContext,
    info: GraphQLResolveInfo
  ): Promise<WalletBalances | null> {
    if (info.path.prev?.key !== "wallet") return null;
    const { address, chainId } = info.variableValues as QueryWalletArgs;
    return getBlockchainForId(chainId, ctx).getBalancesForAddress(address);
  },

  /**
   * Field-level resolver handler for the `nfts` field.
   * @param {Wallet} _parent
   * @param {{}} _args
   * @param {ApiContext} ctx
   * @param {GraphQLResolveInfo} info
   * @returns {(Promise<Nft[] | null>)}
   */
  async nfts(
    _parent: Wallet,
    _args: {},
    ctx: ApiContext,
    info: GraphQLResolveInfo
  ): Promise<Nft[] | null> {
    if (info.path.prev?.key !== "wallet") return null;
    const { address, chainId } = info.variableValues as QueryWalletArgs;
    return getBlockchainForId(chainId, ctx).getNftsForAddress(address);
  },
};
