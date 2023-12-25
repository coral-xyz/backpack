/* eslint-disable */
import * as types from "./graphql";
import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
  "\n  query GetTransactionsForToken(\n    $address: String!, \n    $providerId: ProviderID!, \n    $transactionFilters: TransactionFiltersInput!\n  ) {\n    wallet(address: $address, providerId: $providerId) {\n      id\n      provider {\n        providerId\n      }\n      balances {\n        tokens {\n          edges {\n            node {\n              id\n              address\n              displayAmount\n              marketData {\n                id\n                percentChange\n                value\n                valueChange\n              }\n              token\n              tokenListEntry {\n                id\n                address\n                logo\n                name\n                symbol\n              }\n            }\n          }\n        }\n      }\n      transactions(filters: $transactionFilters) {\n        edges {\n          node {\n            id\n            hash\n            provider {\n              id\n              providerId\n            }\n            timestamp\n          }\n        }\n      }\n    }\n  }\n":
    types.GetTransactionsForTokenDocument,
  "\n  query GetTokenBalances($address: String!, $providerId: ProviderID!) {\n    wallet(address: $address, providerId: $providerId) {\n      id\n      balances {\n        id\n        aggregate {\n          id\n          percentChange\n          value\n          valueChange\n        }\n        tokens {\n          edges {\n            node {\n              id\n              address\n              displayAmount\n              marketData {\n                id\n                percentChange\n                value\n                valueChange\n              }\n              token\n              tokenListEntry {\n                id\n                address\n                logo\n                name\n                symbol\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n":
    types.GetTokenBalancesDocument,
  "\n  query GetCollectibles($address: String!, $providerId: ProviderID!) {\n    wallet(address: $address, providerId: $providerId) {\n      id\n      nfts {\n        edges {\n          node {\n            id\n            address\n            attributes {\n              trait\n              value\n            }\n            collection {\n              id\n              address\n              name\n            }\n            compressed\n            compressionData {\n              id\n              creatorHash\n              dataHash\n              leaf\n              tree\n            }\n            description\n            image\n            name\n            token\n          }\n        }\n      }\n    }\n  }\n":
    types.GetCollectiblesDocument,
  "\n  query GetTokenListEntryLogo($providerId: ProviderID!, $filters: TokenListEntryFiltersInput) {\n    tokenList(providerId: $providerId, filters: $filters) {\n      id\n      logo\n      symbol\n    }\n  }\n":
    types.GetTokenListEntryLogoDocument,
  "\n  query GetTransactions($address: String!, $providerId: ProviderID!, $filters: TransactionFiltersInput) {\n    wallet(address: $address, providerId: $providerId) {\n      id\n      provider {\n        providerId\n      }\n      transactions(filters: $filters) {\n        edges {\n          cursor\n          node {\n            id\n            address\n            description\n            fee\n            feePayer\n            error\n            hash\n            nfts\n            provider {\n              id\n              providerId\n            }\n            source\n            timestamp\n            type\n          }\n        }\n        pageInfo {\n          hasNextPage\n        }\n      }\n    }\n  }\n":
    types.GetTransactionsDocument,
  "\n  query GetNftSpotlightAggregate($addresses: [WalletAddressesInput!]!) {\n    walletNftAggregate(addresses: $addresses) {\n      edges {\n        node {\n          id\n          address\n          attributes {\n            trait\n            value\n          }\n          collection {\n            id\n            address\n            name\n          }\n          compressed\n          compressionData {\n            id\n            creatorHash\n            dataHash\n            leaf\n            tree\n          }\n          description\n          image\n          name\n          token\n        }\n      }\n    }\n  }\n":
    types.GetNftSpotlightAggregateDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query GetTransactionsForToken(\n    $address: String!, \n    $providerId: ProviderID!, \n    $transactionFilters: TransactionFiltersInput!\n  ) {\n    wallet(address: $address, providerId: $providerId) {\n      id\n      provider {\n        providerId\n      }\n      balances {\n        tokens {\n          edges {\n            node {\n              id\n              address\n              displayAmount\n              marketData {\n                id\n                percentChange\n                value\n                valueChange\n              }\n              token\n              tokenListEntry {\n                id\n                address\n                logo\n                name\n                symbol\n              }\n            }\n          }\n        }\n      }\n      transactions(filters: $transactionFilters) {\n        edges {\n          node {\n            id\n            hash\n            provider {\n              id\n              providerId\n            }\n            timestamp\n          }\n        }\n      }\n    }\n  }\n"
): (typeof documents)["\n  query GetTransactionsForToken(\n    $address: String!, \n    $providerId: ProviderID!, \n    $transactionFilters: TransactionFiltersInput!\n  ) {\n    wallet(address: $address, providerId: $providerId) {\n      id\n      provider {\n        providerId\n      }\n      balances {\n        tokens {\n          edges {\n            node {\n              id\n              address\n              displayAmount\n              marketData {\n                id\n                percentChange\n                value\n                valueChange\n              }\n              token\n              tokenListEntry {\n                id\n                address\n                logo\n                name\n                symbol\n              }\n            }\n          }\n        }\n      }\n      transactions(filters: $transactionFilters) {\n        edges {\n          node {\n            id\n            hash\n            provider {\n              id\n              providerId\n            }\n            timestamp\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query GetTokenBalances($address: String!, $providerId: ProviderID!) {\n    wallet(address: $address, providerId: $providerId) {\n      id\n      balances {\n        id\n        aggregate {\n          id\n          percentChange\n          value\n          valueChange\n        }\n        tokens {\n          edges {\n            node {\n              id\n              address\n              displayAmount\n              marketData {\n                id\n                percentChange\n                value\n                valueChange\n              }\n              token\n              tokenListEntry {\n                id\n                address\n                logo\n                name\n                symbol\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"
): (typeof documents)["\n  query GetTokenBalances($address: String!, $providerId: ProviderID!) {\n    wallet(address: $address, providerId: $providerId) {\n      id\n      balances {\n        id\n        aggregate {\n          id\n          percentChange\n          value\n          valueChange\n        }\n        tokens {\n          edges {\n            node {\n              id\n              address\n              displayAmount\n              marketData {\n                id\n                percentChange\n                value\n                valueChange\n              }\n              token\n              tokenListEntry {\n                id\n                address\n                logo\n                name\n                symbol\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query GetCollectibles($address: String!, $providerId: ProviderID!) {\n    wallet(address: $address, providerId: $providerId) {\n      id\n      nfts {\n        edges {\n          node {\n            id\n            address\n            attributes {\n              trait\n              value\n            }\n            collection {\n              id\n              address\n              name\n            }\n            compressed\n            compressionData {\n              id\n              creatorHash\n              dataHash\n              leaf\n              tree\n            }\n            description\n            image\n            name\n            token\n          }\n        }\n      }\n    }\n  }\n"
): (typeof documents)["\n  query GetCollectibles($address: String!, $providerId: ProviderID!) {\n    wallet(address: $address, providerId: $providerId) {\n      id\n      nfts {\n        edges {\n          node {\n            id\n            address\n            attributes {\n              trait\n              value\n            }\n            collection {\n              id\n              address\n              name\n            }\n            compressed\n            compressionData {\n              id\n              creatorHash\n              dataHash\n              leaf\n              tree\n            }\n            description\n            image\n            name\n            token\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query GetTokenListEntryLogo($providerId: ProviderID!, $filters: TokenListEntryFiltersInput) {\n    tokenList(providerId: $providerId, filters: $filters) {\n      id\n      logo\n      symbol\n    }\n  }\n"
): (typeof documents)["\n  query GetTokenListEntryLogo($providerId: ProviderID!, $filters: TokenListEntryFiltersInput) {\n    tokenList(providerId: $providerId, filters: $filters) {\n      id\n      logo\n      symbol\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query GetTransactions($address: String!, $providerId: ProviderID!, $filters: TransactionFiltersInput) {\n    wallet(address: $address, providerId: $providerId) {\n      id\n      provider {\n        providerId\n      }\n      transactions(filters: $filters) {\n        edges {\n          cursor\n          node {\n            id\n            address\n            description\n            fee\n            feePayer\n            error\n            hash\n            nfts\n            provider {\n              id\n              providerId\n            }\n            source\n            timestamp\n            type\n          }\n        }\n        pageInfo {\n          hasNextPage\n        }\n      }\n    }\n  }\n"
): (typeof documents)["\n  query GetTransactions($address: String!, $providerId: ProviderID!, $filters: TransactionFiltersInput) {\n    wallet(address: $address, providerId: $providerId) {\n      id\n      provider {\n        providerId\n      }\n      transactions(filters: $filters) {\n        edges {\n          cursor\n          node {\n            id\n            address\n            description\n            fee\n            feePayer\n            error\n            hash\n            nfts\n            provider {\n              id\n              providerId\n            }\n            source\n            timestamp\n            type\n          }\n        }\n        pageInfo {\n          hasNextPage\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query GetNftSpotlightAggregate($addresses: [WalletAddressesInput!]!) {\n    walletNftAggregate(addresses: $addresses) {\n      edges {\n        node {\n          id\n          address\n          attributes {\n            trait\n            value\n          }\n          collection {\n            id\n            address\n            name\n          }\n          compressed\n          compressionData {\n            id\n            creatorHash\n            dataHash\n            leaf\n            tree\n          }\n          description\n          image\n          name\n          token\n        }\n      }\n    }\n  }\n"
): (typeof documents)["\n  query GetNftSpotlightAggregate($addresses: [WalletAddressesInput!]!) {\n    walletNftAggregate(addresses: $addresses) {\n      edges {\n        node {\n          id\n          address\n          attributes {\n            trait\n            value\n          }\n          collection {\n            id\n            address\n            name\n          }\n          compressed\n          compressionData {\n            id\n            creatorHash\n            dataHash\n            leaf\n            tree\n          }\n          description\n          image\n          name\n          token\n        }\n      }\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never;
