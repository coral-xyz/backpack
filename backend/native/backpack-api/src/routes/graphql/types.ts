import type { GraphQLResolveInfo } from "graphql";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type RequireFields<T, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: NonNullable<T[P]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export enum ChainId {
  Ethereum = "ETHEREUM",
  Solana = "SOLANA",
}

export type Collection = Node & {
  __typename?: "Collection";
  id: Scalars["ID"];
  image?: Maybe<Scalars["String"]>;
  name?: Maybe<Scalars["String"]>;
  verified: Scalars["Boolean"];
};

export type MarketData = Node & {
  __typename?: "MarketData";
  change: Scalars["Float"];
  id: Scalars["ID"];
  lastUpdatedAt: Scalars["Int"];
  logo: Scalars["String"];
  price: Scalars["Float"];
  value: Scalars["Float"];
};

export type Nft = Node & {
  __typename?: "Nft";
  collection?: Maybe<Collection>;
  id: Scalars["ID"];
  image?: Maybe<Scalars["String"]>;
  name: Scalars["String"];
};

export type Node = {
  id: Scalars["ID"];
};

export type Query = {
  __typename?: "Query";
  wallet?: Maybe<Wallet>;
};

export type QueryWalletArgs = {
  address: Scalars["String"];
  chainId: ChainId;
};

export type TokenBalance = Node & {
  __typename?: "TokenBalance";
  amount: Scalars["String"];
  decimals: Scalars["Int"];
  displayAmount: Scalars["String"];
  id: Scalars["ID"];
  marketData?: Maybe<MarketData>;
  mint: Scalars["String"];
};

export type Transaction = Node & {
  __typename?: "Transaction";
  fee: Scalars["Int"];
  feePayer: Scalars["String"];
  id: Scalars["ID"];
  slot: Scalars["Float"];
  timestamp: Scalars["Float"];
};

export type Wallet = Node & {
  __typename?: "Wallet";
  _chainId: ChainId;
  balances?: Maybe<WalletBalances>;
  id: Scalars["ID"];
  nfts?: Maybe<Array<Maybe<Nft>>>;
  transactions?: Maybe<Array<Maybe<Transaction>>>;
};

export type WalletTransactionsArgs = {
  after?: InputMaybe<Scalars["String"]>;
  before?: InputMaybe<Scalars["String"]>;
};

export type WalletBalances = {
  __typename?: "WalletBalances";
  aggregateValue: Scalars["Float"];
  native: TokenBalance;
  tokens: Array<Maybe<TokenBalance>>;
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs
> {
  subscribe: SubscriptionSubscribeFn<
    { [key in TKey]: TResult },
    TParent,
    TContext,
    TArgs
  >;
  resolve?: SubscriptionResolveFn<
    TResult,
    { [key in TKey]: TResult },
    TContext,
    TArgs
  >;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs
> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<
  TResult,
  TKey extends string,
  TParent = {},
  TContext = {},
  TArgs = {}
> =
  | ((
      ...args: any[]
    ) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (
  obj: T,
  context: TContext,
  info: GraphQLResolveInfo
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<
  TResult = {},
  TParent = {},
  TContext = {},
  TArgs = {}
> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Boolean: ResolverTypeWrapper<Scalars["Boolean"]>;
  ChainID: ChainId;
  Collection: ResolverTypeWrapper<Collection>;
  Float: ResolverTypeWrapper<Scalars["Float"]>;
  ID: ResolverTypeWrapper<Scalars["ID"]>;
  Int: ResolverTypeWrapper<Scalars["Int"]>;
  MarketData: ResolverTypeWrapper<MarketData>;
  Nft: ResolverTypeWrapper<Nft>;
  Node:
    | ResolversTypes["Collection"]
    | ResolversTypes["MarketData"]
    | ResolversTypes["Nft"]
    | ResolversTypes["TokenBalance"]
    | ResolversTypes["Transaction"]
    | ResolversTypes["Wallet"];
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars["String"]>;
  TokenBalance: ResolverTypeWrapper<TokenBalance>;
  Transaction: ResolverTypeWrapper<Transaction>;
  Wallet: ResolverTypeWrapper<Wallet>;
  WalletBalances: ResolverTypeWrapper<WalletBalances>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Boolean: Scalars["Boolean"];
  Collection: Collection;
  Float: Scalars["Float"];
  ID: Scalars["ID"];
  Int: Scalars["Int"];
  MarketData: MarketData;
  Nft: Nft;
  Node:
    | ResolversParentTypes["Collection"]
    | ResolversParentTypes["MarketData"]
    | ResolversParentTypes["Nft"]
    | ResolversParentTypes["TokenBalance"]
    | ResolversParentTypes["Transaction"]
    | ResolversParentTypes["Wallet"];
  Query: {};
  String: Scalars["String"];
  TokenBalance: TokenBalance;
  Transaction: Transaction;
  Wallet: Wallet;
  WalletBalances: WalletBalances;
}>;

export type CollectionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Collection"] = ResolversParentTypes["Collection"]
> = ResolversObject<{
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  verified?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MarketDataResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["MarketData"] = ResolversParentTypes["MarketData"]
> = ResolversObject<{
  change?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  lastUpdatedAt?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  logo?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  price?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  value?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type NftResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Nft"] = ResolversParentTypes["Nft"]
> = ResolversObject<{
  collection?: Resolver<
    Maybe<ResolversTypes["Collection"]>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type NodeResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Node"] = ResolversParentTypes["Node"]
> = ResolversObject<{
  __resolveType: TypeResolveFn<
    | "Collection"
    | "MarketData"
    | "Nft"
    | "TokenBalance"
    | "Transaction"
    | "Wallet",
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
}>;

export type QueryResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Query"] = ResolversParentTypes["Query"]
> = ResolversObject<{
  wallet?: Resolver<
    Maybe<ResolversTypes["Wallet"]>,
    ParentType,
    ContextType,
    RequireFields<QueryWalletArgs, "address" | "chainId">
  >;
}>;

export type TokenBalanceResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["TokenBalance"] = ResolversParentTypes["TokenBalance"]
> = ResolversObject<{
  amount?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  decimals?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  displayAmount?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  marketData?: Resolver<
    Maybe<ResolversTypes["MarketData"]>,
    ParentType,
    ContextType
  >;
  mint?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TransactionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Transaction"] = ResolversParentTypes["Transaction"]
> = ResolversObject<{
  fee?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  feePayer?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  slot?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type WalletResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Wallet"] = ResolversParentTypes["Wallet"]
> = ResolversObject<{
  _chainId?: Resolver<ResolversTypes["ChainID"], ParentType, ContextType>;
  balances?: Resolver<
    Maybe<ResolversTypes["WalletBalances"]>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  nfts?: Resolver<
    Maybe<Array<Maybe<ResolversTypes["Nft"]>>>,
    ParentType,
    ContextType
  >;
  transactions?: Resolver<
    Maybe<Array<Maybe<ResolversTypes["Transaction"]>>>,
    ParentType,
    ContextType,
    Partial<WalletTransactionsArgs>
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type WalletBalancesResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["WalletBalances"] = ResolversParentTypes["WalletBalances"]
> = ResolversObject<{
  aggregateValue?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  native?: Resolver<ResolversTypes["TokenBalance"], ParentType, ContextType>;
  tokens?: Resolver<
    Array<Maybe<ResolversTypes["TokenBalance"]>>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = any> = ResolversObject<{
  Collection?: CollectionResolvers<ContextType>;
  MarketData?: MarketDataResolvers<ContextType>;
  Nft?: NftResolvers<ContextType>;
  Node?: NodeResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  TokenBalance?: TokenBalanceResolvers<ContextType>;
  Transaction?: TransactionResolvers<ContextType>;
  Wallet?: WalletResolvers<ContextType>;
  WalletBalances?: WalletBalancesResolvers<ContextType>;
}>;
