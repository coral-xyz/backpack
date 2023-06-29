import { Suspense, useMemo, useCallback } from "react";
import { View, Text, FlatList, FlatListProps } from "react-native";

import * as Linking from "expo-linking";

import { useSuspenseQuery } from "@apollo/client";
import { useActiveWallet } from "@coral-xyz/recoil";
import { MaterialIcons } from "@expo/vector-icons";
import { ErrorBoundary } from "react-error-boundary";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BaseListItem, ITEM_HEIGHT } from "~components/CollectionListItem";
import { EmptyState, FullScreenLoading } from "~components/index";
import {
  convertNftDataToFlatlist,
  type ListItemProps,
} from "~lib/CollectionUtils";
import { CollectionListScreenProps } from "~navigation/types";

import { gql } from "~src/graphql/__generated__";
import { GlobalStyles } from "~src/lib";

const ITEM_GAP = 16;
const ITEM_SPACE = ITEM_GAP / 2;

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
  const insets = useSafeAreaInsets();
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

  return (
    <PaddedFlatList
      data={rows}
      numColumns={2}
      ListEmptyComponent={NoNFTsEmptyState}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      columnWrapperStyle={{ gap: ITEM_GAP }}
      showsVerticalScrollIndicator={false}
      getItemLayout={(_, index: number) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
      })}
    />
  );
}

export function PaddedFlatList(props: FlatListProps<any>) {
  const insets = useSafeAreaInsets();
  return (
    <FlatList
      style={GlobalStyles.listContainer}
      contentContainerStyle={[
        GlobalStyles.listContentContainer,
        { paddingBottom: insets.bottom + ITEM_GAP },
      ]}
      {...props}
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
