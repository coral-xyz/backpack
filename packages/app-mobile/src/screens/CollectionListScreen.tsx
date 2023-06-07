import { Suspense, useMemo, useCallback } from "react";
import { View, Text, FlatList } from "react-native";

import * as Linking from "expo-linking";

import { gql, useSuspenseQuery_experimental } from "@apollo/client";
import { useActiveWallet } from "@coral-xyz/recoil";
import { MaterialIcons } from "@expo/vector-icons";
import { ErrorBoundary } from "react-error-boundary";

import { BaseListItem } from "~components/CollectionListItem";
import { ItemSeparator } from "~components/ListItem";
import { EmptyState, Screen, FullScreenLoading } from "~components/index";
import {
  convertNftDataToFlatlist,
  type ListItemProps,
} from "~lib/CollectionUtils";
import { CollectionListScreenProps } from "~navigation/types";

function NoNFTsEmptyState() {
  return (
    <View style={{ flex: 1, margin: 18 }}>
      <EmptyState
        icon={(props: any) => <MaterialIcons name="image" {...props} />}
        title="No NFTs"
        subtitle="Get started with your first NFT"
        buttonText="Browse Magic Eden"
        onPress={() => {
          Linking.openURL("https://magiceden.io");
        }}
      />
    </View>
  );
}

// TODO generate these from the server
export type NftCollectionFragmentType = {
  id: string;
  name: string;
  address: string;
  image: string;
  verified: boolean;
};

export const NftCollectionFragment = gql`
  fragment NftCollectionFragment on Collection {
    id
    address
    image
    name
    verified
  }
`;

export type NftNodeFragmentType = {
  id: string;
  address: string;
  token: string;
  name: string;
  owner: string;
  description: string;
  image: string;
  attributes: { trait: string; value: string }[];
  collection: NftCollectionFragmentType;
};

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

const GET_NFT_COLLECTIONS = gql`
  ${NftNodeFragment}
  query WalletNftCollections($chainId: ChainID!, $address: String!) {
    wallet(chainId: $chainId, address: $address) {
      id
      nfts {
        edges {
          node {
            ...NftNodeFragment
          }
        }
      }
    }
  }
`;

function Container({ navigation }: CollectionListScreenProps): JSX.Element {
  const { blockchain, publicKey } = useActiveWallet();
  const { data } = useSuspenseQuery_experimental(GET_NFT_COLLECTIONS, {
    variables: {
      chainId: blockchain.toUpperCase(),
      address: publicKey,
    },
  });

  const handlePressItem = useCallback(
    (item: ListItemProps) => {
      if (item.type === "collection" && item.images.length > 1) {
        navigation.push("CollectionDetail", {
          id: item.id,
          title: item.name,
          nftIds: item?.nfts?.map((n) => n.id) ?? [],
        });
      } else {
        const nft = item.type === "collection" ? item.nfts[0] : item;
        navigation.push("CollectionItemDetail", {
          id: nft.id,
          title: nft.name,
          blockchain,
        });
      }
    },
    [navigation, blockchain]
  );

  const rows = useMemo(() => convertNftDataToFlatlist(data), [data]);
  const keyExtractor = (item: ListItemProps) => item.id;
  const renderItem = useCallback(
    ({ item }: { item: ListItemProps }) => {
      return <BaseListItem onPress={handlePressItem} item={item} />;
    },
    [handlePressItem]
  );

  const gap = 12;

  return (
    <Screen>
      <FlatList
        data={rows}
        numColumns={2}
        ItemSeparatorComponent={ItemSeparator}
        ListEmptyComponent={NoNFTsEmptyState}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={{ gap }}
        columnWrapperStyle={{ gap }}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

export function CollectionListScreen({
  navigation,
  route,
}: CollectionListScreenProps): JSX.Element {
  return (
    <ErrorBoundary fallbackRender={({ error }) => <Text>{error.message}</Text>}>
      <Suspense fallback={<FullScreenLoading />}>
        <Container navigation={navigation} route={route} />
      </Suspense>
    </ErrorBoundary>
  );
}
