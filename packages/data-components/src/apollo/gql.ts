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
  "\n  query GetBalanceSummary($address: String!) {\n    user {\n      id\n      wallet(address: $address) {\n        id\n        balances {\n          id\n          aggregate {\n            id\n            percentChange\n            value\n            valueChange\n          }\n        }\n      }\n    }\n  }\n":
    types.GetBalanceSummaryDocument,
  "\n  query GetTokenBalances($address: String!) {\n    user {\n      id\n      wallet(address: $address) {\n        id\n        balances {\n          id\n          tokens {\n            edges {\n              node {\n                id\n                address\n                displayAmount\n                marketData {\n                  id\n                  percentChange\n                  value       \n                }\n                token\n                tokenListEntry {\n                  id\n                  logo\n                  name\n                  symbol\n                }        \n              }\n            }\n          }\n        }\n      }\n    }\n  }\n":
    types.GetTokenBalancesDocument,
  "\n  mutation SendFriendRequest($otherUserId: String!, $accept: Boolean!) {\n    sendFriendRequest(otherUserId: $otherUserId, accept: $accept)\n  }\n":
    types.SendFriendRequestDocument,
  "\n  query GetNotifications($filters: NotificationFiltersInput) {\n    user {\n      id\n      notifications(filters: $filters) {\n        edges {\n          node {\n            id\n            app {\n              id\n              address\n              image\n              name\n            }\n            body\n            dbId\n            source\n            timestamp\n            title\n            viewed\n          }\n        }\n      }\n    }\n  }\n":
    types.GetNotificationsDocument,
  "\n  mutation MarkNotificationsAsRead($ids: [Int!]!) {\n    markNotificationsAsRead(ids: $ids)\n  }\n":
    types.MarkNotificationsAsReadDocument,
  "\n  query GetTokenListEntryLogo($providerId: ProviderID!, $filters: TokenListEntryFiltersInput) {\n    tokenList(providerId: $providerId, filters: $filters) {\n      id\n      logo\n    }\n  }\n":
    types.GetTokenListEntryLogoDocument,
  "\n  query GetTransactions($address: String!, $filters: TransactionFiltersInput) {\n    user {\n      id\n      wallet(address: $address) {\n        id\n        provider {\n          providerId\n        }\n        transactions(filters: $filters) {\n          edges {\n            node {\n              id\n              description\n              fee\n              feePayer\n              error\n              hash\n              nfts\n              source\n              timestamp\n              type\n            }\n          }\n        }\n      }\n    }\n  }\n":
    types.GetTransactionsDocument,
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
  source: "\n  query GetBalanceSummary($address: String!) {\n    user {\n      id\n      wallet(address: $address) {\n        id\n        balances {\n          id\n          aggregate {\n            id\n            percentChange\n            value\n            valueChange\n          }\n        }\n      }\n    }\n  }\n"
): (typeof documents)["\n  query GetBalanceSummary($address: String!) {\n    user {\n      id\n      wallet(address: $address) {\n        id\n        balances {\n          id\n          aggregate {\n            id\n            percentChange\n            value\n            valueChange\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query GetTokenBalances($address: String!) {\n    user {\n      id\n      wallet(address: $address) {\n        id\n        balances {\n          id\n          tokens {\n            edges {\n              node {\n                id\n                address\n                displayAmount\n                marketData {\n                  id\n                  percentChange\n                  value       \n                }\n                token\n                tokenListEntry {\n                  id\n                  logo\n                  name\n                  symbol\n                }        \n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"
): (typeof documents)["\n  query GetTokenBalances($address: String!) {\n    user {\n      id\n      wallet(address: $address) {\n        id\n        balances {\n          id\n          tokens {\n            edges {\n              node {\n                id\n                address\n                displayAmount\n                marketData {\n                  id\n                  percentChange\n                  value       \n                }\n                token\n                tokenListEntry {\n                  id\n                  logo\n                  name\n                  symbol\n                }        \n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation SendFriendRequest($otherUserId: String!, $accept: Boolean!) {\n    sendFriendRequest(otherUserId: $otherUserId, accept: $accept)\n  }\n"
): (typeof documents)["\n  mutation SendFriendRequest($otherUserId: String!, $accept: Boolean!) {\n    sendFriendRequest(otherUserId: $otherUserId, accept: $accept)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query GetNotifications($filters: NotificationFiltersInput) {\n    user {\n      id\n      notifications(filters: $filters) {\n        edges {\n          node {\n            id\n            app {\n              id\n              address\n              image\n              name\n            }\n            body\n            dbId\n            source\n            timestamp\n            title\n            viewed\n          }\n        }\n      }\n    }\n  }\n"
): (typeof documents)["\n  query GetNotifications($filters: NotificationFiltersInput) {\n    user {\n      id\n      notifications(filters: $filters) {\n        edges {\n          node {\n            id\n            app {\n              id\n              address\n              image\n              name\n            }\n            body\n            dbId\n            source\n            timestamp\n            title\n            viewed\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation MarkNotificationsAsRead($ids: [Int!]!) {\n    markNotificationsAsRead(ids: $ids)\n  }\n"
): (typeof documents)["\n  mutation MarkNotificationsAsRead($ids: [Int!]!) {\n    markNotificationsAsRead(ids: $ids)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query GetTokenListEntryLogo($providerId: ProviderID!, $filters: TokenListEntryFiltersInput) {\n    tokenList(providerId: $providerId, filters: $filters) {\n      id\n      logo\n    }\n  }\n"
): (typeof documents)["\n  query GetTokenListEntryLogo($providerId: ProviderID!, $filters: TokenListEntryFiltersInput) {\n    tokenList(providerId: $providerId, filters: $filters) {\n      id\n      logo\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query GetTransactions($address: String!, $filters: TransactionFiltersInput) {\n    user {\n      id\n      wallet(address: $address) {\n        id\n        provider {\n          providerId\n        }\n        transactions(filters: $filters) {\n          edges {\n            node {\n              id\n              description\n              fee\n              feePayer\n              error\n              hash\n              nfts\n              source\n              timestamp\n              type\n            }\n          }\n        }\n      }\n    }\n  }\n"
): (typeof documents)["\n  query GetTransactions($address: String!, $filters: TransactionFiltersInput) {\n    user {\n      id\n      wallet(address: $address) {\n        id\n        provider {\n          providerId\n        }\n        transactions(filters: $filters) {\n          edges {\n            node {\n              id\n              description\n              fee\n              feePayer\n              error\n              hash\n              nfts\n              source\n              timestamp\n              type\n            }\n          }\n        }\n      }\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never;
