import type {
  GraphQLResolveInfo,
  GraphQLScalarType,
  GraphQLScalarTypeConfig,
} from "graphql";
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
  /** Custom scalar to handle the parsing of arbitrary JSON object data. */
  JSONObject: any;
};

/** The aggregate market balance data for all balances in a wallet. */
export type BalanceAggregate = Node & {
  __typename?: "BalanceAggregate";
  /** Globally unique identifier for the balance aggregate. */
  id: Scalars["ID"];
  /** The aggregate percentage of change. */
  percentChange: Scalars["Float"];
  /** The aggregate USD value of all balance holdings. */
  value: Scalars["Float"];
  /** The aggregate change in USD value. */
  valueChange: Scalars["Float"];
};

/** Input filter type for fetching wallet balances. */
export type BalanceFiltersInput = {
  /** If requested, only provide balances for non-native tokens that are listed on CoinGecko. */
  marketListedTokensOnly?: InputMaybe<Scalars["Boolean"]>;
};

/**
 * Top-level type for providing wallet balance information.
 * Should provide details about native and non-native token balances with aggregation details.
 */
export type Balances = Node & {
  __typename?: "Balances";
  /** The numerical value representing the aggregated market value of all fungible assets in the wallet. */
  aggregate: BalanceAggregate;
  /** Globally unique identifier for a wallet's balances data. */
  id: Scalars["ID"];
  /** The Relay connection of token account balances and market data for tokens owned by the wallet. */
  tokens?: Maybe<TokenBalanceConnection>;
};

/** Scope enum for cache control. */
export enum CacheControlScope {
  Private = "PRIVATE",
  Public = "PUBLIC",
}

/** `Nft` collection sub-type definition. */
export type Collection = Node & {
  __typename?: "Collection";
  /** The mint or contract address of the collection, presenting an NFT's parental entity. */
  address: Scalars["String"];
  /** Globally unique identifier for an NFT collection object. */
  id: Scalars["ID"];
  /** The image link for the collection or parental contract entity. */
  image?: Maybe<Scalars["String"]>;
  /** The name of the collection or parental contract entity. */
  name?: Maybe<Scalars["String"]>;
  /** Flag to indicate whether or not it has been verified by the relevant ecosystem standards. */
  verified: Scalars["Boolean"];
};

/** Represents a friend reference for the parent `User`. */
export type Friend = Node & {
  __typename?: "Friend";
  /** The image link for a friend's user avatar. */
  avatar: Scalars["String"];
  /** Globally unique identifier for a friend of a user. */
  id: Scalars["ID"];
  /** The primary wallets associated with the user. */
  primaryWallets: Array<FriendPrimaryWallet>;
  /** The Backpack username of the friend. */
  username: Scalars["String"];
};

/** Abbreviated wallet information for the primary wallet(s) of a friend. */
export type FriendPrimaryWallet = Node & {
  __typename?: "FriendPrimaryWallet";
  /** The public key of the wallet. */
  address: Scalars["String"];
  /** Globally unique identifier for the friend's primary wallet. */
  id: Scalars["ID"];
  /** The ID of the provider associated with the wallet. */
  provider: Provider;
};

/** Friend request data for a user. */
export type FriendRequest = Node & {
  __typename?: "FriendRequest";
  /** Globally unique identifier for a single friend request entity. */
  id: Scalars["ID"];
  /** The type of friend request to indicate whether it was sent or received by the user. */
  type: FriendRequestType;
  /** The recipient or sending Backpack user ID of the request. */
  userId: Scalars["String"];
};

/** Enum for associating a friend request with the direction of how it was sent. */
export enum FriendRequestType {
  Received = "RECEIVED",
  Sent = "SENT",
}

/** Wrapper type for all user friendship data. */
export type Friendship = {
  __typename?: "Friendship";
  /** A list of Backpack friends of the user. */
  friends?: Maybe<Array<Friend>>;
  /** A list of pending Backpack friend requests related to the user. */
  requests?: Maybe<Array<FriendRequest>>;
};

/** NFT listing data pulling from marketplaces. */
export type Listing = Node & {
  __typename?: "Listing";
  /** The display amount of the current listing price. */
  amount: Scalars["String"];
  /** Globally unique identifier for an NFT marketplace listing. */
  id: Scalars["ID"];
  /** The marketplace or platform that the NFT is currently listing on. */
  source: Scalars["String"];
  /** A link to the NFT's listing on the marketplace. */
  url: Scalars["String"];
};

/** Coingecko and computed market and price data for a token. */
export type MarketData = Node & {
  __typename?: "MarketData";
  /** Globally unqiue identifier for the token's market data. */
  id: Scalars["ID"];
  /** A timestamp of the last date of when the market data was updated. */
  lastUpdatedAt: Scalars["String"];
  /** The percentage of change since the latest market data update. */
  percentChange: Scalars["Float"];
  /** The current USD price of the token according to the market data. */
  price: Scalars["Float"];
  /** Time series price data for the token to be used for creating a sparkline. */
  sparkline: Array<Scalars["Float"]>;
  /** The numerical amount change in USD since the latest market data update. */
  usdChange: Scalars["Float"];
  /** The value of the wallet's currently holdings of the token in USD. */
  value: Scalars["Float"];
  /** The value change in USD of the wallet's holdings of the token is USD. */
  valueChange: Scalars["Float"];
};

/** Root level mutation type. */
export type Mutation = {
  __typename?: "Mutation";
  /** Authenticate a user and set the JWT in their cookies. */
  authenticate: Scalars["String"];
  /** Deauthenticate the current user and clear their JWT cookie. */
  deauthenticate: Scalars["String"];
  /** Attempt to add a new wallet public key to the user account. */
  importPublicKey?: Maybe<Scalars["Boolean"]>;
  /** Set the `viewed` status of the argued notification IDs are `true`. */
  markNotificationsAsRead: Scalars["Int"];
  /** Allows users to send friend requests to another remote user. */
  sendFriendRequest?: Maybe<Scalars["Boolean"]>;
};

/** Root level mutation type. */
export type MutationAuthenticateArgs = {
  message: Scalars["String"];
  providerId: ProviderId;
  publicKey: Scalars["String"];
  signature: Scalars["String"];
};

/** Root level mutation type. */
export type MutationImportPublicKeyArgs = {
  address: Scalars["String"];
  providerId: ProviderId;
  signature: Scalars["String"];
};

/** Root level mutation type. */
export type MutationMarkNotificationsAsReadArgs = {
  ids: Array<Scalars["Int"]>;
};

/** Root level mutation type. */
export type MutationSendFriendRequestArgs = {
  accept: Scalars["Boolean"];
  otherUserId: Scalars["String"];
};

/** Generic NFT object type definition to provide on-chain and off-chain metadata. */
export type Nft = Node & {
  __typename?: "Nft";
  /** The mint or contract address of the item. */
  address: Scalars["String"];
  /** The list of attributes or traits found in the item's metadata. */
  attributes?: Maybe<Array<NftAttribute>>;
  /** The collection or contract parental entity of the item. */
  collection?: Maybe<Collection>;
  /** Whether or not the NFT is using on-chain compression. */
  compressed: Scalars["Boolean"];
  /** The description of the NFT found in the metadata. */
  description?: Maybe<Scalars["String"]>;
  /** Globally unique identifier for an NFT. */
  id: Scalars["ID"];
  /** The image link of the NFT found in the metadata. */
  image?: Maybe<Scalars["String"]>;
  /** Possible marketplace or platform listing data for the NFT for sale. */
  listing?: Maybe<Listing>;
  /** The link to the off-chain metadata. */
  metadataUri?: Maybe<Scalars["String"]>;
  /** The name of the NFT found in the metadata. */
  name?: Maybe<Scalars["String"]>;
  /** The owning wallet's public key. */
  owner: Scalars["String"];
  /** The associated token account address or contract token ID of the individual item. */
  token: Scalars["String"];
};

/** NFT `attributes` list sub-type definition. */
export type NftAttribute = {
  __typename?: "NftAttribute";
  /** The trait name of the attribute. */
  trait: Scalars["String"];
  /** The item's value for the specified trait type. */
  value: Scalars["String"];
};

/** Relay connection specification for `Nft` edges. */
export type NftConnection = {
  __typename?: "NftConnection";
  edges: Array<NftEdge>;
  pageInfo: PageInfo;
};

/** Relay edge specification for `Nft` nodes. */
export type NftEdge = {
  __typename?: "NftEdge";
  cursor: Scalars["String"];
  node: Nft;
};

/** Input filter type for fetching user wallet NFTs. */
export type NftFiltersInput = {
  /** A list of mint or contract addresses to filter the response. */
  addresses?: InputMaybe<Array<Scalars["String"]>>;
};

/** Interface to enforce the implementation of an `id` field on a type. */
export type Node = {
  /** Globally unique identifier. */
  id: Scalars["ID"];
};

/** Notification data type for user notification reads. */
export type Notification = Node & {
  __typename?: "Notification";
  /** Application identity information if the notification was from an xNFT. */
  app?: Maybe<NotificationApplicationData>;
  /** Arbitrary body data of the notification parsed as an object. */
  body: Scalars["JSONObject"];
  /** The database unique integer identifier. */
  dbId: Scalars["Int"];
  /** Globally unique identifier for a specific notification. */
  id: Scalars["ID"];
  /** The emitting source of the notification. */
  source: Scalars["String"];
  /** The timestamp that the notification was created. */
  timestamp: Scalars["String"];
  /** The title of the notification. */
  title: Scalars["String"];
  /** Flag to indicate whether it has been viewed or not by the user. */
  viewed: Scalars["Boolean"];
};

/** Identifying metadata for an xNFT application that triggered a notification. */
export type NotificationApplicationData = Node & {
  __typename?: "NotificationApplicationData";
  /** The public key string of the xNFT application */
  address: Scalars["String"];
  /** Globally unique identifier for the node. */
  id: Scalars["ID"];
  /** The image link to the application's icon. */
  image: Scalars["String"];
  /** The name of the application. */
  name: Scalars["String"];
};

/** Relay connection specification for `Notification` edges. */
export type NotificationConnection = {
  __typename?: "NotificationConnection";
  edges: Array<NotificationEdge>;
  /** The database integer ID of the last read notification of the user. */
  lastReadId?: Maybe<Scalars["Int"]>;
  pageInfo: PageInfo;
};

/** Relay edge specification for `Notification` nodes. */
export type NotificationEdge = {
  __typename?: "NotificationEdge";
  cursor: Scalars["String"];
  node: Notification;
};

/** Input filter type for fetching user notifications. */
export type NotificationFiltersInput = {
  /** The limit for number of items desired in the response. */
  limit?: InputMaybe<Scalars["Int"]>;
  /** The direction to sort the timestamps by. */
  sortDirection?: InputMaybe<SortDirection>;
  /** Flag to filter for only unread notifications of the user. */
  unreadOnly?: InputMaybe<Scalars["Boolean"]>;
};

/** Relay specification for a connection's page information. */
export type PageInfo = {
  __typename?: "PageInfo";
  /** Cursor for the last edge in the page. */
  endCursor?: Maybe<Scalars["String"]>;
  /** Flag to indicate if the connection has another page of edges. */
  hasNextPage: Scalars["Boolean"];
  /** Flag to indicate if the connection has a previous page of edges. */
  hasPreviousPage: Scalars["Boolean"];
  /** Cursor for the first edge in the page. */
  startCursor?: Maybe<Scalars["String"]>;
};

/** Schema exposure of the blockchain data provider used for a `Wallet`. */
export type Provider = Node & {
  __typename?: "Provider";
  /** Globally unique identifier for the node. */
  id: Scalars["ID"];
  /** The logo URL of the provider. */
  logo: Scalars["String"];
  /** The display name of the provider. */
  name: Scalars["String"];
  /** The `ProviderID` enum variant associated with the data provider. */
  providerId: ProviderId;
};

/** Provider ID enum variants for the supported blockchains or wallet types in the API. */
export enum ProviderId {
  Bitcoin = "BITCOIN",
  Ethereum = "ETHEREUM",
  Solana = "SOLANA",
}

/** Root level query type. */
export type Query = {
  __typename?: "Query";
  /** Get the entire or a specific entry of a token list. */
  tokenList: Array<Maybe<TokenListEntry>>;
  /**
   * Fetch a user by their Backpack account username. The username is inferred by the
   * presence of a valid and verified JWT.
   */
  user?: Maybe<User>;
  /**
   * Fetching a wallet and it's assets by the public key address and associated `ProviderID`.
   * @deprecated Should use the user entrypoint for authentication identities.
   */
  wallet?: Maybe<Wallet>;
};

/** Root level query type. */
export type QueryTokenListArgs = {
  filters?: InputMaybe<TokenListEntryFiltersInput>;
  providerId: ProviderId;
};

/** Root level query type. */
export type QueryWalletArgs = {
  address: Scalars["String"];
  providerId: ProviderId;
};

/** Enum for specifying the direction of sorting a list of items. */
export enum SortDirection {
  Asc = "ASC",
  Desc = "DESC",
}

/** Generic native or non-native token data and balance for a `Wallet`. */
export type TokenBalance = Node & {
  __typename?: "TokenBalance";
  /** The associated token account or wallet + contract address of the wallet. */
  address: Scalars["String"];
  /** The unformated amount of tokens held for the specific contract or mint. */
  amount: Scalars["String"];
  /** The number of decimals associated with the contract or mint. */
  decimals: Scalars["Int"];
  /** The formatted display amount for the wallet's holdings of the token. */
  displayAmount: Scalars["String"];
  /** Globally unqiue identifier for the token balance object in a wallet. */
  id: Scalars["ID"];
  /** Market price data for the token contract or mint. */
  marketData?: Maybe<MarketData>;
  /** The address of the token mint or contract. */
  token: Scalars["String"];
  /** The possible entry in the token registry list for the mint or contract address. */
  tokenListEntry?: Maybe<TokenListEntry>;
};

/** Relay connection specification for `TokenBalance` edges. */
export type TokenBalanceConnection = {
  __typename?: "TokenBalanceConnection";
  edges: Array<TokenBalanceEdge>;
  pageInfo: PageInfo;
};

/** Relay edge specification for `TokenBalance` nodes. */
export type TokenBalanceEdge = {
  __typename?: "TokenBalanceEdge";
  cursor: Scalars["String"];
  node: TokenBalance;
};

export type TokenListEntry = Node & {
  __typename?: "TokenListEntry";
  /** The mint or contract address of the token. */
  address: Scalars["String"];
  /** The Coingecko market listing ID. */
  coingeckoId?: Maybe<Scalars["String"]>;
  /** Globally unique identifier for the list entry. */
  id: Scalars["ID"];
  /** The logo associated with the token. */
  logo?: Maybe<Scalars["String"]>;
  /** The registered name of the token. */
  name: Scalars["String"];
  /** The registered symbol of the token. */
  symbol: Scalars["String"];
};

/** Input filter type for fetching a specific entry from a token list. */
export type TokenListEntryFiltersInput = {
  /** The mint or contract address of the token. */
  addresses?: InputMaybe<Array<Scalars["String"]>>;
  /** The market listing name of the token. */
  name?: InputMaybe<Scalars["String"]>;
  /** The market listing symbol of the token. */
  symbols?: InputMaybe<Array<Scalars["String"]>>;
};

/** Generic on-chain transaction details structure. */
export type Transaction = Node & {
  __typename?: "Transaction";
  /** The block number or slot that the transaction was committed to. */
  block: Scalars["Float"];
  /** The semantic description of the transaction effects. */
  description?: Maybe<Scalars["String"]>;
  /** The error message for the transaction if it failed. */
  error?: Maybe<Scalars["String"]>;
  /** The amount in fees that were paid for processing the transaction. */
  fee?: Maybe<Scalars["String"]>;
  /** The address of the wallet that paid the processing fees. */
  feePayer?: Maybe<Scalars["String"]>;
  /** The transaction hash or signature. */
  hash: Scalars["String"];
  /** Globally unique identifier for a single transaction. */
  id: Scalars["ID"];
  /** A list of NFT mints or contract + token IDs associated with the transaction. */
  nfts?: Maybe<Array<Maybe<Scalars["String"]>>>;
  /** The raw JSON data received from the index API response for the item. */
  raw: Scalars["JSONObject"];
  /** The source or program that is associated with the transaction. */
  source?: Maybe<Scalars["String"]>;
  /** The timestamp of the execution or commitment of the transaction. */
  timestamp: Scalars["String"];
  /** The category or type of transaction. */
  type: Scalars["String"];
};

/** Relay connection specification for `Transaction` edges. */
export type TransactionConnection = {
  __typename?: "TransactionConnection";
  edges: Array<TransactionEdge>;
  pageInfo: PageInfo;
};

/** Relay edge specification for `Transaction` nodes. */
export type TransactionEdge = {
  __typename?: "TransactionEdge";
  cursor: Scalars["String"];
  node: Transaction;
};

/** Input filter type for fetching transaction history. */
export type TransactionFiltersInput = {
  /** Block hash or signature to search after. */
  after?: InputMaybe<Scalars["String"]>;
  /** Block hash or signature to search before. */
  before?: InputMaybe<Scalars["String"]>;
  /** Used for transaction pagination for a Bitcoin provider wallet. */
  offset?: InputMaybe<Scalars["Int"]>;
  /** A token mint or contract address to filter for. */
  token?: InputMaybe<Scalars["String"]>;
};

/**
 * Backpack user type definition so provide data about all of the user's
 * assets, peripheral information, and social data.
 */
export type User = Node & {
  __typename?: "User";
  /** The aggregate token balances and value for all wallets associated with the user. */
  allWalletsAggregate?: Maybe<Balances>;
  /** The image link for the avatar of the user. */
  avatar: Scalars["String"];
  /** The timestamp of the creation of the user. */
  createdAt: Scalars["String"];
  /** A grouping object of the friends and friend request data for the user. */
  friendship?: Maybe<Friendship>;
  /** Globally unique identifier for a Backpack user. */
  id: Scalars["ID"];
  /** The Relay connection for the notifications received by the user. */
  notifications?: Maybe<NotificationConnection>;
  /** The user's unique UUID from the database. */
  userId: Scalars["String"];
  /** The user's Backpack username. */
  username: Scalars["String"];
  /** Get a single wallet object for the argued public key address. */
  wallet?: Maybe<Wallet>;
  /** The Relay connection for the wallet's and their data that are registered to the user. */
  wallets?: Maybe<WalletConnection>;
};

/**
 * Backpack user type definition so provide data about all of the user's
 * assets, peripheral information, and social data.
 */
export type UserNotificationsArgs = {
  filters?: InputMaybe<NotificationFiltersInput>;
};

/**
 * Backpack user type definition so provide data about all of the user's
 * assets, peripheral information, and social data.
 */
export type UserWalletArgs = {
  address: Scalars["String"];
  providerId?: InputMaybe<ProviderId>;
};

/**
 * Backpack user type definition so provide data about all of the user's
 * assets, peripheral information, and social data.
 */
export type UserWalletsArgs = {
  filters?: InputMaybe<WalletFiltersInput>;
};

/** Wallet definition to provide data about all assets owned by an address. */
export type Wallet = Node & {
  __typename?: "Wallet";
  /** The public key address of the wallet. */
  address: Scalars["String"];
  /** The detailed and aggregate balance data for the wallet. */
  balances?: Maybe<Balances>;
  /** The timestamp that the wallet was imported or registered to the Backpack user. */
  createdAt: Scalars["String"];
  /** Globally unique identifier for a specific wallet on a blockchain. */
  id: Scalars["ID"];
  /** Flag to indicate whether it is the user's primary wallet for the designated blockchain. */
  isPrimary: Scalars["Boolean"];
  /** The Relay connection for all of the NFTs owned by the wallet. */
  nfts?: Maybe<NftConnection>;
  /** The blockchain enum variant that the wallet is associated with. */
  provider: Provider;
  /** The Relay connection for all transactions initiated or associated with the wallet. */
  transactions?: Maybe<TransactionConnection>;
};

/** Wallet definition to provide data about all assets owned by an address. */
export type WalletBalancesArgs = {
  filters?: InputMaybe<BalanceFiltersInput>;
};

/** Wallet definition to provide data about all assets owned by an address. */
export type WalletNftsArgs = {
  filters?: InputMaybe<NftFiltersInput>;
};

/** Wallet definition to provide data about all assets owned by an address. */
export type WalletTransactionsArgs = {
  filters?: InputMaybe<TransactionFiltersInput>;
};

/** Relay connection specification for `Wallet` edges. */
export type WalletConnection = {
  __typename?: "WalletConnection";
  edges: Array<WalletEdge>;
  pageInfo: PageInfo;
};

/** Relay edge specification for `Wallet` nodes. */
export type WalletEdge = {
  __typename?: "WalletEdge";
  cursor: Scalars["String"];
  node: Wallet;
};

/** Input filter type for fetching user wallets and their data. */
export type WalletFiltersInput = {
  /** Flag to filter for only the primary wallets for each registered blockchain of the user. */
  primaryOnly?: InputMaybe<Scalars["Boolean"]>;
  /** A `ProviderID` value to filter for all of the public keys of the user for a given blockchain. */
  providerId?: InputMaybe<ProviderId>;
  /** A list of public keys to filter in the response. */
  pubkeys?: InputMaybe<Array<Scalars["String"]>>;
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
  BalanceAggregate: ResolverTypeWrapper<BalanceAggregate>;
  BalanceFiltersInput: BalanceFiltersInput;
  Balances: ResolverTypeWrapper<Balances>;
  Boolean: ResolverTypeWrapper<Scalars["Boolean"]>;
  CacheControlScope: CacheControlScope;
  Collection: ResolverTypeWrapper<Collection>;
  Float: ResolverTypeWrapper<Scalars["Float"]>;
  Friend: ResolverTypeWrapper<Friend>;
  FriendPrimaryWallet: ResolverTypeWrapper<FriendPrimaryWallet>;
  FriendRequest: ResolverTypeWrapper<FriendRequest>;
  FriendRequestType: FriendRequestType;
  Friendship: ResolverTypeWrapper<Friendship>;
  ID: ResolverTypeWrapper<Scalars["ID"]>;
  Int: ResolverTypeWrapper<Scalars["Int"]>;
  JSONObject: ResolverTypeWrapper<Scalars["JSONObject"]>;
  Listing: ResolverTypeWrapper<Listing>;
  MarketData: ResolverTypeWrapper<MarketData>;
  Mutation: ResolverTypeWrapper<{}>;
  Nft: ResolverTypeWrapper<Nft>;
  NftAttribute: ResolverTypeWrapper<NftAttribute>;
  NftConnection: ResolverTypeWrapper<NftConnection>;
  NftEdge: ResolverTypeWrapper<NftEdge>;
  NftFiltersInput: NftFiltersInput;
  Node:
    | ResolversTypes["BalanceAggregate"]
    | ResolversTypes["Balances"]
    | ResolversTypes["Collection"]
    | ResolversTypes["Friend"]
    | ResolversTypes["FriendPrimaryWallet"]
    | ResolversTypes["FriendRequest"]
    | ResolversTypes["Listing"]
    | ResolversTypes["MarketData"]
    | ResolversTypes["Nft"]
    | ResolversTypes["Notification"]
    | ResolversTypes["NotificationApplicationData"]
    | ResolversTypes["Provider"]
    | ResolversTypes["TokenBalance"]
    | ResolversTypes["TokenListEntry"]
    | ResolversTypes["Transaction"]
    | ResolversTypes["User"]
    | ResolversTypes["Wallet"];
  Notification: ResolverTypeWrapper<Notification>;
  NotificationApplicationData: ResolverTypeWrapper<NotificationApplicationData>;
  NotificationConnection: ResolverTypeWrapper<NotificationConnection>;
  NotificationEdge: ResolverTypeWrapper<NotificationEdge>;
  NotificationFiltersInput: NotificationFiltersInput;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  Provider: ResolverTypeWrapper<Provider>;
  ProviderID: ProviderId;
  Query: ResolverTypeWrapper<{}>;
  SortDirection: SortDirection;
  String: ResolverTypeWrapper<Scalars["String"]>;
  TokenBalance: ResolverTypeWrapper<TokenBalance>;
  TokenBalanceConnection: ResolverTypeWrapper<TokenBalanceConnection>;
  TokenBalanceEdge: ResolverTypeWrapper<TokenBalanceEdge>;
  TokenListEntry: ResolverTypeWrapper<TokenListEntry>;
  TokenListEntryFiltersInput: TokenListEntryFiltersInput;
  Transaction: ResolverTypeWrapper<Transaction>;
  TransactionConnection: ResolverTypeWrapper<TransactionConnection>;
  TransactionEdge: ResolverTypeWrapper<TransactionEdge>;
  TransactionFiltersInput: TransactionFiltersInput;
  User: ResolverTypeWrapper<User>;
  Wallet: ResolverTypeWrapper<Wallet>;
  WalletConnection: ResolverTypeWrapper<WalletConnection>;
  WalletEdge: ResolverTypeWrapper<WalletEdge>;
  WalletFiltersInput: WalletFiltersInput;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  BalanceAggregate: BalanceAggregate;
  BalanceFiltersInput: BalanceFiltersInput;
  Balances: Balances;
  Boolean: Scalars["Boolean"];
  Collection: Collection;
  Float: Scalars["Float"];
  Friend: Friend;
  FriendPrimaryWallet: FriendPrimaryWallet;
  FriendRequest: FriendRequest;
  Friendship: Friendship;
  ID: Scalars["ID"];
  Int: Scalars["Int"];
  JSONObject: Scalars["JSONObject"];
  Listing: Listing;
  MarketData: MarketData;
  Mutation: {};
  Nft: Nft;
  NftAttribute: NftAttribute;
  NftConnection: NftConnection;
  NftEdge: NftEdge;
  NftFiltersInput: NftFiltersInput;
  Node:
    | ResolversParentTypes["BalanceAggregate"]
    | ResolversParentTypes["Balances"]
    | ResolversParentTypes["Collection"]
    | ResolversParentTypes["Friend"]
    | ResolversParentTypes["FriendPrimaryWallet"]
    | ResolversParentTypes["FriendRequest"]
    | ResolversParentTypes["Listing"]
    | ResolversParentTypes["MarketData"]
    | ResolversParentTypes["Nft"]
    | ResolversParentTypes["Notification"]
    | ResolversParentTypes["NotificationApplicationData"]
    | ResolversParentTypes["Provider"]
    | ResolversParentTypes["TokenBalance"]
    | ResolversParentTypes["TokenListEntry"]
    | ResolversParentTypes["Transaction"]
    | ResolversParentTypes["User"]
    | ResolversParentTypes["Wallet"];
  Notification: Notification;
  NotificationApplicationData: NotificationApplicationData;
  NotificationConnection: NotificationConnection;
  NotificationEdge: NotificationEdge;
  NotificationFiltersInput: NotificationFiltersInput;
  PageInfo: PageInfo;
  Provider: Provider;
  Query: {};
  String: Scalars["String"];
  TokenBalance: TokenBalance;
  TokenBalanceConnection: TokenBalanceConnection;
  TokenBalanceEdge: TokenBalanceEdge;
  TokenListEntry: TokenListEntry;
  TokenListEntryFiltersInput: TokenListEntryFiltersInput;
  Transaction: Transaction;
  TransactionConnection: TransactionConnection;
  TransactionEdge: TransactionEdge;
  TransactionFiltersInput: TransactionFiltersInput;
  User: User;
  Wallet: Wallet;
  WalletConnection: WalletConnection;
  WalletEdge: WalletEdge;
  WalletFiltersInput: WalletFiltersInput;
}>;

export type CacheControlDirectiveArgs = {
  inheritMaxAge?: Maybe<Scalars["Boolean"]>;
  maxAge?: Maybe<Scalars["Int"]>;
  scope?: Maybe<CacheControlScope>;
};

export type CacheControlDirectiveResolver<
  Result,
  Parent,
  ContextType = any,
  Args = CacheControlDirectiveArgs
> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type BalanceAggregateResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["BalanceAggregate"] = ResolversParentTypes["BalanceAggregate"]
> = ResolversObject<{
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  percentChange?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  value?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  valueChange?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type BalancesResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Balances"] = ResolversParentTypes["Balances"]
> = ResolversObject<{
  aggregate?: Resolver<
    ResolversTypes["BalanceAggregate"],
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  tokens?: Resolver<
    Maybe<ResolversTypes["TokenBalanceConnection"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CollectionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Collection"] = ResolversParentTypes["Collection"]
> = ResolversObject<{
  address?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  verified?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type FriendResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Friend"] = ResolversParentTypes["Friend"]
> = ResolversObject<{
  avatar?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  primaryWallets?: Resolver<
    Array<ResolversTypes["FriendPrimaryWallet"]>,
    ParentType,
    ContextType
  >;
  username?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type FriendPrimaryWalletResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["FriendPrimaryWallet"] = ResolversParentTypes["FriendPrimaryWallet"]
> = ResolversObject<{
  address?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  provider?: Resolver<ResolversTypes["Provider"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type FriendRequestResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["FriendRequest"] = ResolversParentTypes["FriendRequest"]
> = ResolversObject<{
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  type?: Resolver<ResolversTypes["FriendRequestType"], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type FriendshipResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Friendship"] = ResolversParentTypes["Friendship"]
> = ResolversObject<{
  friends?: Resolver<
    Maybe<Array<ResolversTypes["Friend"]>>,
    ParentType,
    ContextType
  >;
  requests?: Resolver<
    Maybe<Array<ResolversTypes["FriendRequest"]>>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface JsonObjectScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["JSONObject"], any> {
  name: "JSONObject";
}

export type ListingResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Listing"] = ResolversParentTypes["Listing"]
> = ResolversObject<{
  amount?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  source?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  url?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MarketDataResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["MarketData"] = ResolversParentTypes["MarketData"]
> = ResolversObject<{
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  lastUpdatedAt?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  percentChange?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  price?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  sparkline?: Resolver<Array<ResolversTypes["Float"]>, ParentType, ContextType>;
  usdChange?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  value?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  valueChange?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Mutation"] = ResolversParentTypes["Mutation"]
> = ResolversObject<{
  authenticate?: Resolver<
    ResolversTypes["String"],
    ParentType,
    ContextType,
    RequireFields<
      MutationAuthenticateArgs,
      "message" | "providerId" | "publicKey" | "signature"
    >
  >;
  deauthenticate?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  importPublicKey?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType,
    RequireFields<
      MutationImportPublicKeyArgs,
      "address" | "providerId" | "signature"
    >
  >;
  markNotificationsAsRead?: Resolver<
    ResolversTypes["Int"],
    ParentType,
    ContextType,
    RequireFields<MutationMarkNotificationsAsReadArgs, "ids">
  >;
  sendFriendRequest?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType,
    RequireFields<MutationSendFriendRequestArgs, "accept" | "otherUserId">
  >;
}>;

export type NftResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Nft"] = ResolversParentTypes["Nft"]
> = ResolversObject<{
  address?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  attributes?: Resolver<
    Maybe<Array<ResolversTypes["NftAttribute"]>>,
    ParentType,
    ContextType
  >;
  collection?: Resolver<
    Maybe<ResolversTypes["Collection"]>,
    ParentType,
    ContextType
  >;
  compressed?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  description?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  listing?: Resolver<Maybe<ResolversTypes["Listing"]>, ParentType, ContextType>;
  metadataUri?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  name?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  owner?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  token?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type NftAttributeResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["NftAttribute"] = ResolversParentTypes["NftAttribute"]
> = ResolversObject<{
  trait?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  value?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type NftConnectionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["NftConnection"] = ResolversParentTypes["NftConnection"]
> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes["NftEdge"]>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes["PageInfo"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type NftEdgeResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["NftEdge"] = ResolversParentTypes["NftEdge"]
> = ResolversObject<{
  cursor?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  node?: Resolver<ResolversTypes["Nft"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type NodeResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Node"] = ResolversParentTypes["Node"]
> = ResolversObject<{
  __resolveType: TypeResolveFn<
    | "BalanceAggregate"
    | "Balances"
    | "Collection"
    | "Friend"
    | "FriendPrimaryWallet"
    | "FriendRequest"
    | "Listing"
    | "MarketData"
    | "Nft"
    | "Notification"
    | "NotificationApplicationData"
    | "Provider"
    | "TokenBalance"
    | "TokenListEntry"
    | "Transaction"
    | "User"
    | "Wallet",
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
}>;

export type NotificationResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Notification"] = ResolversParentTypes["Notification"]
> = ResolversObject<{
  app?: Resolver<
    Maybe<ResolversTypes["NotificationApplicationData"]>,
    ParentType,
    ContextType
  >;
  body?: Resolver<ResolversTypes["JSONObject"], ParentType, ContextType>;
  dbId?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  source?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  title?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  viewed?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type NotificationApplicationDataResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["NotificationApplicationData"] = ResolversParentTypes["NotificationApplicationData"]
> = ResolversObject<{
  address?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  image?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type NotificationConnectionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["NotificationConnection"] = ResolversParentTypes["NotificationConnection"]
> = ResolversObject<{
  edges?: Resolver<
    Array<ResolversTypes["NotificationEdge"]>,
    ParentType,
    ContextType
  >;
  lastReadId?: Resolver<Maybe<ResolversTypes["Int"]>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes["PageInfo"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type NotificationEdgeResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["NotificationEdge"] = ResolversParentTypes["NotificationEdge"]
> = ResolversObject<{
  cursor?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  node?: Resolver<ResolversTypes["Notification"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PageInfoResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["PageInfo"] = ResolversParentTypes["PageInfo"]
> = ResolversObject<{
  endCursor?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  hasNextPage?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  hasPreviousPage?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType
  >;
  startCursor?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ProviderResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Provider"] = ResolversParentTypes["Provider"]
> = ResolversObject<{
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  logo?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  providerId?: Resolver<ResolversTypes["ProviderID"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Query"] = ResolversParentTypes["Query"]
> = ResolversObject<{
  tokenList?: Resolver<
    Array<Maybe<ResolversTypes["TokenListEntry"]>>,
    ParentType,
    ContextType,
    RequireFields<QueryTokenListArgs, "providerId">
  >;
  user?: Resolver<Maybe<ResolversTypes["User"]>, ParentType, ContextType>;
  wallet?: Resolver<
    Maybe<ResolversTypes["Wallet"]>,
    ParentType,
    ContextType,
    RequireFields<QueryWalletArgs, "address" | "providerId">
  >;
}>;

export type TokenBalanceResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["TokenBalance"] = ResolversParentTypes["TokenBalance"]
> = ResolversObject<{
  address?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  amount?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  decimals?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  displayAmount?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  marketData?: Resolver<
    Maybe<ResolversTypes["MarketData"]>,
    ParentType,
    ContextType
  >;
  token?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  tokenListEntry?: Resolver<
    Maybe<ResolversTypes["TokenListEntry"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TokenBalanceConnectionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["TokenBalanceConnection"] = ResolversParentTypes["TokenBalanceConnection"]
> = ResolversObject<{
  edges?: Resolver<
    Array<ResolversTypes["TokenBalanceEdge"]>,
    ParentType,
    ContextType
  >;
  pageInfo?: Resolver<ResolversTypes["PageInfo"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TokenBalanceEdgeResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["TokenBalanceEdge"] = ResolversParentTypes["TokenBalanceEdge"]
> = ResolversObject<{
  cursor?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  node?: Resolver<ResolversTypes["TokenBalance"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TokenListEntryResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["TokenListEntry"] = ResolversParentTypes["TokenListEntry"]
> = ResolversObject<{
  address?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  coingeckoId?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  logo?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  symbol?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TransactionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Transaction"] = ResolversParentTypes["Transaction"]
> = ResolversObject<{
  block?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  description?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  error?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  fee?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  feePayer?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  hash?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  nfts?: Resolver<
    Maybe<Array<Maybe<ResolversTypes["String"]>>>,
    ParentType,
    ContextType
  >;
  raw?: Resolver<ResolversTypes["JSONObject"], ParentType, ContextType>;
  source?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  type?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TransactionConnectionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["TransactionConnection"] = ResolversParentTypes["TransactionConnection"]
> = ResolversObject<{
  edges?: Resolver<
    Array<ResolversTypes["TransactionEdge"]>,
    ParentType,
    ContextType
  >;
  pageInfo?: Resolver<ResolversTypes["PageInfo"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TransactionEdgeResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["TransactionEdge"] = ResolversParentTypes["TransactionEdge"]
> = ResolversObject<{
  cursor?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  node?: Resolver<ResolversTypes["Transaction"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["User"] = ResolversParentTypes["User"]
> = ResolversObject<{
  allWalletsAggregate?: Resolver<
    Maybe<ResolversTypes["Balances"]>,
    ParentType,
    ContextType
  >;
  avatar?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  friendship?: Resolver<
    Maybe<ResolversTypes["Friendship"]>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  notifications?: Resolver<
    Maybe<ResolversTypes["NotificationConnection"]>,
    ParentType,
    ContextType,
    Partial<UserNotificationsArgs>
  >;
  userId?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  username?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  wallet?: Resolver<
    Maybe<ResolversTypes["Wallet"]>,
    ParentType,
    ContextType,
    RequireFields<UserWalletArgs, "address">
  >;
  wallets?: Resolver<
    Maybe<ResolversTypes["WalletConnection"]>,
    ParentType,
    ContextType,
    Partial<UserWalletsArgs>
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type WalletResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Wallet"] = ResolversParentTypes["Wallet"]
> = ResolversObject<{
  address?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  balances?: Resolver<
    Maybe<ResolversTypes["Balances"]>,
    ParentType,
    ContextType,
    Partial<WalletBalancesArgs>
  >;
  createdAt?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  isPrimary?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  nfts?: Resolver<
    Maybe<ResolversTypes["NftConnection"]>,
    ParentType,
    ContextType,
    Partial<WalletNftsArgs>
  >;
  provider?: Resolver<ResolversTypes["Provider"], ParentType, ContextType>;
  transactions?: Resolver<
    Maybe<ResolversTypes["TransactionConnection"]>,
    ParentType,
    ContextType,
    Partial<WalletTransactionsArgs>
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type WalletConnectionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["WalletConnection"] = ResolversParentTypes["WalletConnection"]
> = ResolversObject<{
  edges?: Resolver<
    Array<ResolversTypes["WalletEdge"]>,
    ParentType,
    ContextType
  >;
  pageInfo?: Resolver<ResolversTypes["PageInfo"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type WalletEdgeResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["WalletEdge"] = ResolversParentTypes["WalletEdge"]
> = ResolversObject<{
  cursor?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  node?: Resolver<ResolversTypes["Wallet"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = any> = ResolversObject<{
  BalanceAggregate?: BalanceAggregateResolvers<ContextType>;
  Balances?: BalancesResolvers<ContextType>;
  Collection?: CollectionResolvers<ContextType>;
  Friend?: FriendResolvers<ContextType>;
  FriendPrimaryWallet?: FriendPrimaryWalletResolvers<ContextType>;
  FriendRequest?: FriendRequestResolvers<ContextType>;
  Friendship?: FriendshipResolvers<ContextType>;
  JSONObject?: GraphQLScalarType;
  Listing?: ListingResolvers<ContextType>;
  MarketData?: MarketDataResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Nft?: NftResolvers<ContextType>;
  NftAttribute?: NftAttributeResolvers<ContextType>;
  NftConnection?: NftConnectionResolvers<ContextType>;
  NftEdge?: NftEdgeResolvers<ContextType>;
  Node?: NodeResolvers<ContextType>;
  Notification?: NotificationResolvers<ContextType>;
  NotificationApplicationData?: NotificationApplicationDataResolvers<ContextType>;
  NotificationConnection?: NotificationConnectionResolvers<ContextType>;
  NotificationEdge?: NotificationEdgeResolvers<ContextType>;
  PageInfo?: PageInfoResolvers<ContextType>;
  Provider?: ProviderResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  TokenBalance?: TokenBalanceResolvers<ContextType>;
  TokenBalanceConnection?: TokenBalanceConnectionResolvers<ContextType>;
  TokenBalanceEdge?: TokenBalanceEdgeResolvers<ContextType>;
  TokenListEntry?: TokenListEntryResolvers<ContextType>;
  Transaction?: TransactionResolvers<ContextType>;
  TransactionConnection?: TransactionConnectionResolvers<ContextType>;
  TransactionEdge?: TransactionEdgeResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  Wallet?: WalletResolvers<ContextType>;
  WalletConnection?: WalletConnectionResolvers<ContextType>;
  WalletEdge?: WalletEdgeResolvers<ContextType>;
}>;

export type DirectiveResolvers<ContextType = any> = ResolversObject<{
  cacheControl?: CacheControlDirectiveResolver<any, any, ContextType>;
}>;
