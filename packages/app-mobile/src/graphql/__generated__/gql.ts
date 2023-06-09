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
  "\n  query UserWallets {\n    user {\n      id\n      wallets {\n        edges {\n          node {\n            id\n            address\n            isPrimary\n            createdAt\n            provider {\n              id\n              logo\n              name\n            }\n            balances {\n              id\n              aggregate {\n                valueChange\n                value\n                percentChange\n                id\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n":
    types.UserWalletsDocument,
  "\n  fragment NftCollectionFragment on Collection {\n    id\n    address\n    image\n    name\n    verified\n  }\n":
    types.NftCollectionFragmentFragmentDoc,
  "\n  \n  fragment NftNodeFragment on Nft {\n    id\n    address\n    token\n    name\n    owner\n    description\n    image\n    attributes {\n      trait\n      value\n    }\n    collection {\n      ...NftCollectionFragment\n    }\n  }\n":
    types.NftNodeFragmentFragmentDoc,
  "\n  \n  query WalletNftCollections($providerId: ProviderID!, $address: String!) {\n    wallet(providerId: $providerId, address: $address) {\n      id\n      nfts {\n        edges {\n          node {\n            ...NftNodeFragment\n          }\n        }\n      }\n    }\n  }\n":
    types.WalletNftCollectionsDocument,
  "\n  query Transactions($address: String!) {\n    user {\n      wallet(address: $address) {\n        transactions {\n          edges {\n            node {\n              id\n              block\n              description\n              fee\n              feePayer\n              hash\n              source\n              timestamp\n              type\n            }\n          }\n        }\n      }\n    }\n  }\n":
    types.TransactionsDocument,
  "\n  query UserWalletBalanceSummary($address: String!) {\n    user {\n      id\n      wallet(address: $address) {\n        id\n        isPrimary\n        provider {\n          id\n          name\n          logo\n        }\n        balances {\n          aggregate {\n            id\n            percentChange\n            value\n            valueChange\n          }\n        }\n      }\n    }\n  }\n":
    types.UserWalletBalanceSummaryDocument,
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
  source: "\n  query UserWallets {\n    user {\n      id\n      wallets {\n        edges {\n          node {\n            id\n            address\n            isPrimary\n            createdAt\n            provider {\n              id\n              logo\n              name\n            }\n            balances {\n              id\n              aggregate {\n                valueChange\n                value\n                percentChange\n                id\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"
): (typeof documents)["\n  query UserWallets {\n    user {\n      id\n      wallets {\n        edges {\n          node {\n            id\n            address\n            isPrimary\n            createdAt\n            provider {\n              id\n              logo\n              name\n            }\n            balances {\n              id\n              aggregate {\n                valueChange\n                value\n                percentChange\n                id\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment NftCollectionFragment on Collection {\n    id\n    address\n    image\n    name\n    verified\n  }\n"
): (typeof documents)["\n  fragment NftCollectionFragment on Collection {\n    id\n    address\n    image\n    name\n    verified\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  \n  fragment NftNodeFragment on Nft {\n    id\n    address\n    token\n    name\n    owner\n    description\n    image\n    attributes {\n      trait\n      value\n    }\n    collection {\n      ...NftCollectionFragment\n    }\n  }\n"
): (typeof documents)["\n  \n  fragment NftNodeFragment on Nft {\n    id\n    address\n    token\n    name\n    owner\n    description\n    image\n    attributes {\n      trait\n      value\n    }\n    collection {\n      ...NftCollectionFragment\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  \n  query WalletNftCollections($providerId: ProviderID!, $address: String!) {\n    wallet(providerId: $providerId, address: $address) {\n      id\n      nfts {\n        edges {\n          node {\n            ...NftNodeFragment\n          }\n        }\n      }\n    }\n  }\n"
): (typeof documents)["\n  \n  query WalletNftCollections($providerId: ProviderID!, $address: String!) {\n    wallet(providerId: $providerId, address: $address) {\n      id\n      nfts {\n        edges {\n          node {\n            ...NftNodeFragment\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query Transactions($address: String!) {\n    user {\n      wallet(address: $address) {\n        transactions {\n          edges {\n            node {\n              id\n              block\n              description\n              fee\n              feePayer\n              hash\n              source\n              timestamp\n              type\n            }\n          }\n        }\n      }\n    }\n  }\n"
): (typeof documents)["\n  query Transactions($address: String!) {\n    user {\n      wallet(address: $address) {\n        transactions {\n          edges {\n            node {\n              id\n              block\n              description\n              fee\n              feePayer\n              hash\n              source\n              timestamp\n              type\n            }\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query UserWalletBalanceSummary($address: String!) {\n    user {\n      id\n      wallet(address: $address) {\n        id\n        isPrimary\n        provider {\n          id\n          name\n          logo\n        }\n        balances {\n          aggregate {\n            id\n            percentChange\n            value\n            valueChange\n          }\n        }\n      }\n    }\n  }\n"
): (typeof documents)["\n  query UserWalletBalanceSummary($address: String!) {\n    user {\n      id\n      wallet(address: $address) {\n        id\n        isPrimary\n        provider {\n          id\n          name\n          logo\n        }\n        balances {\n          aggregate {\n            id\n            percentChange\n            value\n            valueChange\n          }\n        }\n      }\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never;
