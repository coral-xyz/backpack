import { Suspense, useMemo, useCallback } from "react";
import { View, Text, FlatList } from "react-native";

import * as Linking from "expo-linking";

import { useSuspenseQuery } from "@apollo/client";
import { useActiveWallet } from "@coral-xyz/recoil";
import { MaterialIcons } from "@expo/vector-icons";
import { ErrorBoundary } from "react-error-boundary";

import { BaseListItem } from "~components/CollectionListItem";
import { ItemSeparator } from "~components/ListItem";
import { EmptyState, FullScreenLoading } from "~components/index";
import {
  convertNftDataToFlatlist,
  type ListItemProps,
} from "~lib/CollectionUtils";
import { CollectionListScreenProps } from "~navigation/types";

import { gql } from "~src/graphql/__generated__";

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

const GET_NFT_COLLECTIONS = gql(`
  query WalletNftCollections($providerId: ProviderID!, $address: String!) {
    wallet(providerId: $providerId, address: $address) {
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
`);

function Container({ navigation }: CollectionListScreenProps): JSX.Element {
  const { blockchain, publicKey } = useActiveWallet();
  const { data } = useSuspenseQuery(GET_NFT_COLLECTIONS, {
    variables: {
      // @ts-expect-error graphql ProviderID not defined as string
      providerId: blockchain.toUpperCase(),
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
    <FlatList
      style={{ paddingTop: 16, paddingHorizontal: 16 }}
      contentContainerStyle={{ gap, paddingBottom: 32 }}
      data={rows}
      numColumns={2}
      ItemSeparatorComponent={ItemSeparator}
      ListEmptyComponent={NoNFTsEmptyState}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      columnWrapperStyle={{ gap }}
      showsVerticalScrollIndicator={false}
    />
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
