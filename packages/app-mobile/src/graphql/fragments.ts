import { gql } from "@apollo/client";

export const TransactionFragment = gql`
  fragment TransactionFragment on Transaction {
    id
    block
    description
    fee
    feePayer
    hash
    source
    timestamp
    type
  }
`;

export const NftCollectionFragment = gql`
  fragment NftCollectionFragment on Collection {
    id
    address
    image
    name
    verified
  }
`;

export const NftNodeFragment = gql`
  ${NftCollectionFragment}
  fragment NftNodeFragment on Nft {
    id
    address
    token
    name
    owner
    description
    image
    attributes {
      trait
      value
    }
    collection {
      ...NftCollectionFragment
    }
  }
`;
