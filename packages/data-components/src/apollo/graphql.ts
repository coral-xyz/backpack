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
  /**
   * Optionally provide a list of token mint or contract addresses to exclude from the results.
   * Mutually exclusive with `include` and `nativeOnly`.
   */
  exclude?: InputMaybe<Array<Scalars["String"]>>;
  /**
   * Optionally provide a list of token mint or contract addresses to include in the results.
   * Mutually exclusive with `exclude` and `nativeOnly`.
   */
  include?: InputMaybe<Array<Scalars["String"]>>;
  /** If requested, only provide balances for non-native tokens that are listed on CoinGecko. */
  marketListedTokensOnly?: InputMaybe<Scalars["Boolean"]>;
  /**
   * Optional flag to only receive the balance data for the holdings of the native token.
   * Mutually exclusive with `exclude` and `include`.
   */
  nativeOnly?: InputMaybe<Scalars["Boolean"]>;
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
  tokens: TokenBalanceConnection;
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

/** Wrapper type for all data entrypoints for Jupiter swap information. */
export type JupiterSwap = {
  __typename?: "JupiterSwap";
  /** A list of output token mints compatible with the argued input token mint. */
  swapOutputTokens?: Maybe<Array<TokenListEntry>>;
};

/** Wrapper type for all data entrypoints for Jupiter swap information. */
export type JupiterSwapSwapOutputTokensArgs = {
  inputToken: Scalars["String"];
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
  /**
   * Solana NFT compression data necessary for construction asset
   * proofs for transfers. Will only be populated if `compressed` is `true`.
   */
  compressionData?: Maybe<NftCompressionData>;
  /** The list of verified creator addresses if available. */
  creators?: Maybe<Array<Scalars["String"]>>;
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
  /** The blockchain metadata that is the source of the NFT data. */
  provider: Provider;
  /** The associated token account address or contract token ID of the individual item. */
  token?: Maybe<Scalars["String"]>;
  /**
   * The token type or standard for the NFT. The possible values for this field vary
   * based on the provider or blockchain from which the data is sourced.
   * BTC: 'ordinal'
   * EVM: 'erc721', 'erc1155', 'unknown'
   * SVM: 'nonfungible', 'programmable', 'unknown'
   */
  type: Scalars["String"];
};

/** NFT `attributes` list sub-type definition. */
export type NftAttribute = {
  __typename?: "NftAttribute";
  /** The trait name of the attribute. */
  trait: Scalars["String"];
  /** The item's value for the specified trait type. */
  value: Scalars["String"];
};

/** Solana NFT compression proof and tree data required for construction transfers. */
export type NftCompressionData = Node & {
  __typename?: "NftCompressionData";
  /** The hash of the compressed asset creator. */
  creatorHash?: Maybe<Scalars["String"]>;
  /** The hash of the underlying compressed data. */
  dataHash?: Maybe<Scalars["String"]>;
  /** Globally unique identifier for compressed asset data. */
  id: Scalars["ID"];
  /** The numerical ID of the leaf that the asset belongs to. */
  leaf: Scalars["Int"];
  /** The address of the merkle tree that the asset is compressed on. */
  tree?: Maybe<Scalars["String"]>;
};

/** The compression proof for Solana cNFTs. */
export type NftCompressionProof = Node & {
  __typename?: "NftCompressionProof";
  /** Globally unique identifier for the proof. */
  id: Scalars["ID"];
  /** The hash of the leaf assigned to the compression proof. */
  leaf: Scalars["String"];
  /** The compression proof hash list. */
  proof: Array<Scalars["String"]>;
  /** The root of the compression proof. */
  root: Scalars["String"];
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
  /** The address of a collection to get the owned NFTs that are grouped to. */
  collection?: InputMaybe<Scalars["String"]>;
  /** Number of results per page to truncate the response. */
  limit?: InputMaybe<Scalars["Int"]>;
  /** The page number to request additional items. */
  page?: InputMaybe<Scalars["Int"]>;
};

/** Interface to enforce the implementation of an `id` field on a type. */
export type Node = {
  /** Globally unique identifier. */
  id: Scalars["ID"];
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
  Eclipse = "ECLIPSE",
  Ethereum = "ETHEREUM",
  Polygon = "POLYGON",
  Solana = "SOLANA",
}

/** Root level query type. */
export type Query = {
  __typename?: "Query";
  /** Fetches the proof for a compressed Solana NFT for the argued asset ID. */
  assetProof?: Maybe<NftCompressionProof>;
  /** Entrypoint query for fetching Solana swap information from Jupiter. */
  jupiter: JupiterSwap;
  /** Query for an arbitrary type that implements `Node` by its global ID. */
  node?: Maybe<Node>;
  /**
   * Calculate and return the suggested priority fee to append to a Solana
   * transaction for the argued list of account addresses.
   */
  solanaPrioritizationFee: Scalars["Int"];
  /** Get the entire or a specific entry of a token list. */
  tokenList: Array<Maybe<TokenListEntry>>;
  /** Get the market value data for the argued token mint or contract. */
  tokenMarketPrice?: Maybe<Scalars["Float"]>;
  /** Fetching a wallet and it's assets by the public key address and associated `ProviderID`. */
  wallet?: Maybe<Wallet>;
  /** The NFT connection of all NFTs owned between the wallet public keys that are provided. */
  walletNftAggregate: NftConnection;
  /** The Relay connection for the wallet's and their data that are registered to the user. */
  wallets: WalletConnection;
};

/** Root level query type. */
export type QueryAssetProofArgs = {
  assetId: Scalars["String"];
};

/** Root level query type. */
export type QueryNodeArgs = {
  id: Scalars["ID"];
};

/** Root level query type. */
export type QuerySolanaPrioritizationFeeArgs = {
  accounts: Array<Scalars["String"]>;
};

/** Root level query type. */
export type QueryTokenListArgs = {
  filters?: InputMaybe<TokenListEntryFiltersInput>;
  providerId: ProviderId;
};

/** Root level query type. */
export type QueryTokenMarketPriceArgs = {
  address: Scalars["String"];
  providerId: ProviderId;
};

/** Root level query type. */
export type QueryWalletArgs = {
  address: Scalars["String"];
  providerId: ProviderId;
};

/** Root level query type. */
export type QueryWalletNftAggregateArgs = {
  addresses: Array<WalletAddressesInput>;
  filters?: InputMaybe<NftFiltersInput>;
};

/** Root level query type. */
export type QueryWalletsArgs = {
  addresses: Array<WalletAddressesInput>;
};

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
  /** Metadata about the blockchain provider that is associated with the balance data. */
  provider: Provider;
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
  /** The number of decimals associated with the token. */
  decimals: Scalars["Int"];
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
  /** The public key of the wallet associated with the transaction. */
  address: Scalars["String"];
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
  nfts?: Maybe<Array<Scalars["String"]>>;
  /** The metadata for the blockchain provider that sourced the transaction data. */
  provider: Provider;
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
  /** Block hash or signature to search before. */
  before?: InputMaybe<Scalars["String"]>;
  /** The number of transactions to pull for the page at once. */
  limit?: InputMaybe<Scalars["Int"]>;
  /** Used for transaction pagination for a Bitcoin provider wallet. */
  offset?: InputMaybe<Scalars["Int"]>;
  /** A token mint or contract address to filter for. */
  token?: InputMaybe<Scalars["String"]>;
};

/** Wallet definition to provide data about all assets owned by an address. */
export type Wallet = Node & {
  __typename?: "Wallet";
  /** The public key address of the wallet. */
  address: Scalars["String"];
  /** The detailed and aggregate balance data for the wallet. */
  balances?: Maybe<Balances>;
  /** Globally unique identifier for a specific wallet on a blockchain. */
  id: Scalars["ID"];
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

/**
 * Input to provide the combination of desired wallet
 * address and associated provider ID.
 */
export type WalletAddressesInput = {
  /** Associated provider ID for the wallet address. */
  providerId: ProviderId;
  /** Wallet address / public key. */
  pubkeys: Array<Scalars["String"]>;
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

export type GetTransactionsForTokenQueryVariables = Exact<{
  address: Scalars["String"];
  providerId: ProviderId;
  transactionFilters: TransactionFiltersInput;
}>;

export type GetTransactionsForTokenQuery = {
  __typename?: "Query";
  wallet?: {
    __typename?: "Wallet";
    id: string;
    provider: { __typename?: "Provider"; providerId: ProviderId };
    balances?: {
      __typename?: "Balances";
      tokens: {
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
              valueChange: number;
            } | null;
            tokenListEntry?: {
              __typename?: "TokenListEntry";
              id: string;
              address: string;
              logo?: string | null;
              name: string;
              symbol: string;
            } | null;
          };
        }>;
      };
    } | null;
    transactions?: {
      __typename?: "TransactionConnection";
      edges: Array<{
        __typename?: "TransactionEdge";
        node: {
          __typename?: "Transaction";
          id: string;
          hash: string;
          timestamp: string;
          provider: {
            __typename?: "Provider";
            id: string;
            providerId: ProviderId;
          };
        };
      }>;
    } | null;
  } | null;
};

export type GetTokenBalancesQueryVariables = Exact<{
  address: Scalars["String"];
  providerId: ProviderId;
}>;

export type GetTokenBalancesQuery = {
  __typename?: "Query";
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
      tokens: {
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
              valueChange: number;
            } | null;
            tokenListEntry?: {
              __typename?: "TokenListEntry";
              id: string;
              address: string;
              logo?: string | null;
              name: string;
              symbol: string;
            } | null;
          };
        }>;
      };
    } | null;
  } | null;
};

export type GetCollectiblesQueryVariables = Exact<{
  address: Scalars["String"];
  providerId: ProviderId;
}>;

export type GetCollectiblesQuery = {
  __typename?: "Query";
  wallet?: {
    __typename?: "Wallet";
    id: string;
    nfts?: {
      __typename?: "NftConnection";
      edges: Array<{
        __typename?: "NftEdge";
        node: {
          __typename?: "Nft";
          id: string;
          address: string;
          compressed: boolean;
          description?: string | null;
          image?: string | null;
          name?: string | null;
          token?: string | null;
          attributes?: Array<{
            __typename?: "NftAttribute";
            trait: string;
            value: string;
          }> | null;
          collection?: {
            __typename?: "Collection";
            id: string;
            address: string;
            name?: string | null;
          } | null;
          compressionData?: {
            __typename?: "NftCompressionData";
            id: string;
            creatorHash?: string | null;
            dataHash?: string | null;
            leaf: number;
            tree?: string | null;
          } | null;
        };
      }>;
    } | null;
  } | null;
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
    symbol: string;
  } | null>;
};

export type GetTransactionsQueryVariables = Exact<{
  address: Scalars["String"];
  providerId: ProviderId;
  filters?: InputMaybe<TransactionFiltersInput>;
}>;

export type GetTransactionsQuery = {
  __typename?: "Query";
  wallet?: {
    __typename?: "Wallet";
    id: string;
    provider: { __typename?: "Provider"; providerId: ProviderId };
    transactions?: {
      __typename?: "TransactionConnection";
      edges: Array<{
        __typename?: "TransactionEdge";
        cursor: string;
        node: {
          __typename?: "Transaction";
          id: string;
          address: string;
          description?: string | null;
          fee?: string | null;
          feePayer?: string | null;
          error?: string | null;
          hash: string;
          nfts?: Array<string> | null;
          source?: string | null;
          timestamp: string;
          type: string;
          provider: {
            __typename?: "Provider";
            id: string;
            providerId: ProviderId;
          };
        };
      }>;
      pageInfo: { __typename?: "PageInfo"; hasNextPage: boolean };
    } | null;
  } | null;
};

export type GetNftSpotlightAggregateQueryVariables = Exact<{
  addresses: Array<WalletAddressesInput> | WalletAddressesInput;
}>;

export type GetNftSpotlightAggregateQuery = {
  __typename?: "Query";
  walletNftAggregate: {
    __typename?: "NftConnection";
    edges: Array<{
      __typename?: "NftEdge";
      node: {
        __typename?: "Nft";
        id: string;
        address: string;
        compressed: boolean;
        description?: string | null;
        image?: string | null;
        name?: string | null;
        token?: string | null;
        attributes?: Array<{
          __typename?: "NftAttribute";
          trait: string;
          value: string;
        }> | null;
        collection?: {
          __typename?: "Collection";
          id: string;
          address: string;
          name?: string | null;
        } | null;
        compressionData?: {
          __typename?: "NftCompressionData";
          id: string;
          creatorHash?: string | null;
          dataHash?: string | null;
          leaf: number;
          tree?: string | null;
        } | null;
      };
    }>;
  };
};

export const GetTransactionsForTokenDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetTransactionsForToken" },
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
            name: { kind: "Name", value: "transactionFilters" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "TransactionFiltersInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
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
              {
                kind: "Argument",
                name: { kind: "Name", value: "providerId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "providerId" },
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
                  name: { kind: "Name", value: "balances" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
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
                                                  value: "address",
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
                {
                  kind: "Field",
                  name: { kind: "Name", value: "transactions" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "filters" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "transactionFilters" },
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
                                    name: { kind: "Name", value: "hash" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "provider" },
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
                                            value: "providerId",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "timestamp" },
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
  GetTransactionsForTokenQuery,
  GetTransactionsForTokenQueryVariables
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
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
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
              {
                kind: "Argument",
                name: { kind: "Name", value: "providerId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "providerId" },
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
                      { kind: "Field", name: { kind: "Name", value: "id" } },
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
                              name: { kind: "Name", value: "percentChange" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "value" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "valueChange" },
                            },
                          ],
                        },
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
                                                  value: "address",
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
} as unknown as DocumentNode<
  GetTokenBalancesQuery,
  GetTokenBalancesQueryVariables
>;
export const GetCollectiblesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetCollectibles" },
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
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
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
              {
                kind: "Argument",
                name: { kind: "Name", value: "providerId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "providerId" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "nfts" },
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
                                    name: { kind: "Name", value: "address" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "attributes" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "trait",
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
                                    name: { kind: "Name", value: "collection" },
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
                                          name: { kind: "Name", value: "name" },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "compressed" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "compressionData",
                                    },
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
                                            value: "creatorHash",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "dataHash",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "leaf" },
                                        },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "tree" },
                                        },
                                      ],
                                    },
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
                                    name: { kind: "Name", value: "image" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "name" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "token" },
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
  GetCollectiblesQuery,
  GetCollectiblesQueryVariables
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
                { kind: "Field", name: { kind: "Name", value: "symbol" } },
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
            name: { kind: "Name", value: "TransactionFiltersInput" },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
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
              {
                kind: "Argument",
                name: { kind: "Name", value: "providerId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "providerId" },
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
                              name: { kind: "Name", value: "cursor" },
                            },
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
                                    name: { kind: "Name", value: "address" },
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
                                    name: { kind: "Name", value: "feePayer" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "error" },
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
                                    name: { kind: "Name", value: "provider" },
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
                                            value: "providerId",
                                          },
                                        },
                                      ],
                                    },
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
                                    name: { kind: "Name", value: "type" },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "pageInfo" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "hasNextPage" },
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
export const GetNftSpotlightAggregateDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetNftSpotlightAggregate" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "addresses" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: {
                  kind: "NamedType",
                  name: { kind: "Name", value: "WalletAddressesInput" },
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
            name: { kind: "Name", value: "walletNftAggregate" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "addresses" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "addresses" },
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
                              name: { kind: "Name", value: "address" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "attributes" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "trait" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "value" },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "collection" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "id" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "address" },
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
                              name: { kind: "Name", value: "compressed" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "compressionData" },
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
                                      value: "creatorHash",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "dataHash" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "leaf" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "tree" },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "description" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "image" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "name" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "token" },
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
  GetNftSpotlightAggregateQuery,
  GetNftSpotlightAggregateQueryVariables
>;
