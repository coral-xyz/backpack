import type { GraphQLResolveInfo } from "graphql";

import { getBlockchainForId } from "./blockchain";
import type { ApiContext } from "./context";
import type {
  Balances,
  ChainId,
  NftConnection,
  QueryResolvers,
  QueryWalletArgs,
  RequireFields,
  TransactionConnection,
  Wallet,
  WalletResolvers,
  WalletTransactionsArgs,
} from "./types";

/**
 * Root `Query` object resolver.
 */
export const queryResolvers: QueryResolvers = {
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
    };
  },
};

/**
 * Type-level query resolver for the `Wallet` schema object.
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
