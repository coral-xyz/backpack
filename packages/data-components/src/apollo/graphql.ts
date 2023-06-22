/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
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
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** Custom scalar to handle the parsing of arbitrary JSON object data. */
  JSONObject: { data: string } | Record<string, any>;
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

export type GetBalanceSummaryQueryVariables = Exact<{
  address: Scalars["String"];
}>;

export type GetBalanceSummaryQuery = {
  __typename?: "Query";
  user?: {
    __typename?: "User";
    id: string;
    wallet?: {
      __typename?: "Wallet";
      id: string;
      balances?: {
        __typename?: "Balances";
        id: string;
        aggregate: {
          __typename?: "BalanceAggregate";
          id: string;
          percentChange: number;
          value: number;
          valueChange: number;
        };
      } | null;
    } | null;
  } | null;
};

export type GetTokenBalancesQueryVariables = Exact<{
  address: Scalars["String"];
}>;

export type GetTokenBalancesQuery = {
  __typename?: "Query";
  user?: {
    __typename?: "User";
    id: string;
    wallet?: {
      __typename?: "Wallet";
      id: string;
      balances?: {
        __typename?: "Balances";
        id: string;
        tokens?: {
          __typename?: "TokenBalanceConnection";
          edges: Array<{
            __typename?: "TokenBalanceEdge";
            node: {
              __typename?: "TokenBalance";
              id: string;
              address: string;
              displayAmount: string;
              token: string;
              marketData?: {
                __typename?: "MarketData";
                id: string;
                percentChange: number;
                value: number;
              } | null;
              tokenListEntry?: {
                __typename?: "TokenListEntry";
                id: string;
                logo?: string | null;
                name: string;
                symbol: string;
              } | null;
            };
          }>;
        } | null;
      } | null;
    } | null;
  } | null;
};

export type SendFriendRequestMutationVariables = Exact<{
  otherUserId: Scalars["String"];
  accept: Scalars["Boolean"];
}>;

export type SendFriendRequestMutation = {
  __typename?: "Mutation";
  sendFriendRequest?: boolean | null;
};

export type GetNotificationsQueryVariables = Exact<{
  filters?: InputMaybe<NotificationFiltersInput>;
}>;

export type GetNotificationsQuery = {
  __typename?: "Query";
  user?: {
    __typename?: "User";
    id: string;
    notifications?: {
      __typename?: "NotificationConnection";
      edges: Array<{
        __typename?: "NotificationEdge";
        node: {
          __typename?: "Notification";
          id: string;
          body: { data: string } | Record<string, any>;
          dbId: number;
          source: string;
          timestamp: string;
          title: string;
          viewed: boolean;
          app?: {
            __typename?: "NotificationApplicationData";
            id: string;
            address: string;
            image: string;
            name: string;
          } | null;
        };
      }>;
    } | null;
  } | null;
};

export type MarkNotificationsAsReadMutationVariables = Exact<{
  ids: Array<Scalars["Int"]> | Scalars["Int"];
}>;

export type MarkNotificationsAsReadMutation = {
  __typename?: "Mutation";
  markNotificationsAsRead: number;
};

export type GetTokenListEntryLogoQueryVariables = Exact<{
  providerId: ProviderId;
  filters?: InputMaybe<TokenListEntryFiltersInput>;
}>;

export type GetTokenListEntryLogoQuery = {
  __typename?: "Query";
  tokenList: Array<{
    __typename?: "TokenListEntry";
    id: string;
    logo?: string | null;
  } | null>;
};

export type GetTransactionsQueryVariables = Exact<{
  address: Scalars["String"];
  filters?: InputMaybe<TransactionFiltersInput>;
}>;

export type GetTransactionsQuery = {
  __typename?: "Query";
  user?: {
    __typename?: "User";
    id: string;
    wallet?: {
      __typename?: "Wallet";
      id: string;
      provider: { __typename?: "Provider"; providerId: ProviderId };
      transactions?: {
        __typename?: "TransactionConnection";
        edges: Array<{
          __typename?: "TransactionEdge";
          node: {
            __typename?: "Transaction";
            id: string;
            description?: string | null;
            fee?: string | null;
            feePayer?: string | null;
            error?: string | null;
            hash: string;
            nfts?: Array<string | null> | null;
            source?: string | null;
            timestamp: string;
            type: string;
          };
        }>;
      } | null;
    } | null;
  } | null;
};

export const GetBalanceSummaryDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetBalanceSummary" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "address" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "user" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "wallet" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "address" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "address" },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "balances" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "aggregate" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "id" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "percentChange",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "value" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "valueChange",
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetBalanceSummaryQuery,
  GetBalanceSummaryQueryVariables
>;
export const GetTokenBalancesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetTokenBalances" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "address" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "user" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "wallet" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "address" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "address" },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "balances" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "tokens" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "edges" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "node" },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "id",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "address",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "displayAmount",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "marketData",
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: {
                                                        kind: "Name",
                                                        value: "id",
                                                      },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: {
                                                        kind: "Name",
                                                        value: "percentChange",
                                                      },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: {
                                                        kind: "Name",
                                                        value: "value",
                                                      },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "token",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "tokenListEntry",
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: {
                                                        kind: "Name",
                                                        value: "id",
                                                      },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: {
                                                        kind: "Name",
                                                        value: "logo",
                                                      },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: {
                                                        kind: "Name",
                                                        value: "name",
                                                      },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: {
                                                        kind: "Name",
                                                        value: "symbol",
                                                      },
                                                    },
                                                  ],
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetTokenBalancesQuery,
  GetTokenBalancesQueryVariables
>;
export const SendFriendRequestDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SendFriendRequest" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "otherUserId" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "accept" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "Boolean" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "sendFriendRequest" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "otherUserId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "otherUserId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "accept" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "accept" },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SendFriendRequestMutation,
  SendFriendRequestMutationVariables
>;
export const GetNotificationsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetNotifications" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "filters" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "NotificationFiltersInput" },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "user" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "notifications" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "filters" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "filters" },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "edges" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "node" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "id" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "app" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "id" },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "address",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "image",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "name" },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "body" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "dbId" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "source" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "timestamp" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "title" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "viewed" },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetNotificationsQuery,
  GetNotificationsQueryVariables
>;
export const MarkNotificationsAsReadDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "MarkNotificationsAsRead" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "ids" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: {
                  kind: "NamedType",
                  name: { kind: "Name", value: "Int" },
                },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "markNotificationsAsRead" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "ids" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "ids" },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  MarkNotificationsAsReadMutation,
  MarkNotificationsAsReadMutationVariables
>;
export const GetTokenListEntryLogoDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetTokenListEntryLogo" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "providerId" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "ProviderID" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "filters" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "TokenListEntryFiltersInput" },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "tokenList" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "providerId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "providerId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "filters" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "filters" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "logo" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetTokenListEntryLogoQuery,
  GetTokenListEntryLogoQueryVariables
>;
export const GetTransactionsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetTransactions" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "address" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "filters" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "TransactionFiltersInput" },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "user" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "wallet" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "address" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "address" },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "provider" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "providerId" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "transactions" },
                        arguments: [
                          {
                            kind: "Argument",
                            name: { kind: "Name", value: "filters" },
                            value: {
                              kind: "Variable",
                              name: { kind: "Name", value: "filters" },
                            },
                          },
                        ],
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "edges" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "node" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "id" },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "description",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "fee" },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "feePayer",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "error",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "hash" },
                                        },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "nfts" },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "source",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "timestamp",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "type" },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetTransactionsQuery,
  GetTransactionsQueryVariables
>;
