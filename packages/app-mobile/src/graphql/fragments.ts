import { gql } from "~src/graphql/__generated__";
// import { gql } from "@apollo/client";

export const TransactionFragment = gql(`
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
`);

// export type NftCollectionFragmentType = {
//   id: string;
//   name: string;
//   address: string;
//   image: string;
//   verified: boolean;
// };
export const NftCollectionFragment = gql(`
  fragment NftCollectionFragment on Collection {
    id
    address
    image
    name
    verified
  }
`);

// export type NftNodeFragmentType = {
//   id: string;
//   address: string;
//   token: string;
//   name: string;
//   owner: string;
//   description: string;
//   image: string;
//   attributes: { trait: string; value: string }[];
//   collection: NftCollectionFragmentType;
// };

export const NftNodeFragment = gql(`
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
`);

export const BalanceFragment = gql(`
  fragment BalanceFragment on Balances {
    id
    aggregate {
      valueChange
      value
      percentChange
      id
    }
  }
`);

export const ProviderFragment = gql(`
  fragment ProviderFragment on Provider {
    id
    providerId
    name
    logo
}
`);

export const WalletFragment = gql(`
  fragment WalletFragment on Wallet {
    id
    address
    isPrimary
    createdAt
    provider {
      ...ProviderFragment
    }
    balances {
      ...BalanceFragment
    }
  }
`);

export const PrimaryWalletFragment = gql(`
  fragment PrimaryWalletFragment on FriendPrimaryWallet {
    id
    address
    provider {
      ...ProviderFragment
    }
  }
`);

export const FriendFragment = gql(`
  fragment FriendFragment on Friend {
    id
    username
    avatar
    primaryWallets {
      ...PrimaryWalletFragment
    }
  }
`);
