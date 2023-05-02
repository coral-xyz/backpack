import { Suspense, useMemo, useCallback } from "react";
import {
  View,
  Pressable,
  Text,
  ActivityIndicator,
  FlatList,
} from "react-native";

import * as Linking from "expo-linking";

import { gql, useSuspenseQuery_experimental } from "@apollo/client";
import { useActiveWallet } from "@coral-xyz/recoil";
import { Image, XStack, StyledText } from "@coral-xyz/tamagui";
import { MaterialIcons } from "@expo/vector-icons";
import { ErrorBoundary } from "react-error-boundary";

import { EmptyState, Screen, RoundedContainerGroup } from "~components/index";
import {
  convertNftDataToFlatlist,
  type ListItemProps,
} from "~lib/CollectionUtils";

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

function ImageBox({ images }): JSX.Element {
  return (
    <View
      style={{
        borderRadius: 12,
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        padding: 8,
        backgroundColor: "orange",
      }}
    >
      {images.map((uri, index) => {
        return (
          <Image
            key={`${uri}-${index}`}
            source={{ uri }}
            style={{
              borderRadius: 8,
              width: "45%",
              height: 70,
              backgroundColor: "black",
            }}
          />
        );
      })}
    </View>
  );
}

function CollectionImage({ images }: { images: string[] }): JSX.Element {
  if (images.length === 1) {
    return (
      <Image
        source={{ uri: images[0] }}
        style={{ borderRadius: 12, aspectRatio: 1, height: 164, padding: 12 }}
      />
    );
  }

  return <ImageBox images={images.slice(0, 4)} />;
}

export function ListItem({
  item,
  handlePress,
}: {
  item: ListItemProps;
  handlePress: (item: ListItemProps) => void;
}): JSX.Element {
  console.log("data2:item", item);
  return (
    <Pressable
      style={{ flex: 1, marginBottom: 12, borderRadius: 16 }}
      onPress={() => handlePress(item)}
    >
      <CollectionImage images={item.images} />
      <XStack mt={8}>
        <StyledText
          mr={4}
          fontSize="$base"
          numberOfLines={1}
          maxWidth="80%"
          ellipsizeMode="tail"
        >
          {item.name}
        </StyledText>
      </XStack>
    </Pressable>
  );
}

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
    image
    name
    address
    description
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

function Container({ navigation }: any): JSX.Element {
  const activeWallet = useActiveWallet();
  const { data } = useSuspenseQuery_experimental(GET_NFT_COLLECTIONS, {
    variables: {
      chainId: activeWallet.blockchain.toUpperCase(),
      address: activeWallet.publicKey,
    },
  });

  console.log("debug2:data collections", data);

  const handlePressItem = useCallback(
    (item: ListItemProps) => {
      console.log("debug1 handle press", item);
      if (item.type === "collection") {
        // navigate to collection detail
        navigation.push("CollectionDetail", {
          id: item.id,
          title: item.name,
          blockchain: activeWallet.blockchain,
          nfts: item.nfts,
          nftIds: item?.nfts.map((n) => n.id) ?? [],
        });
      } else {
        // navigation to nft detail
        navigation.push("CollectionItemDetail", {
          id: item.id,
          title: item.name,
          blockchain: activeWallet.blockchain,
        });
      }
    },
    [navigation, activeWallet.blockchain]
  );

  const rows = useMemo(() => convertNftDataToFlatlist(data), [data]);
  const keyExtractor = (item: ListItemProps) => item.id;
  const renderItem = useCallback(
    ({ item }: { item: ListItemProps }) => {
      return <ListItem item={item} handlePress={handlePressItem} />;
    },
    [handlePressItem]
  );

  const numColumns = 2;
  const gap = 12;

  return (
    <Screen>
      <RoundedContainerGroup style={{ padding: 12 }}>
        <FlatList
          data={rows}
          numColumns={numColumns}
          ListEmptyComponent={NoNFTsEmptyState}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={{ gap }}
          columnWrapperStyle={{ gap }}
        />
      </RoundedContainerGroup>
    </Screen>
  );
}

export function CollectionListScreen({ navigation }: any): JSX.Element {
  return (
    <ErrorBoundary fallbackRender={({ error }) => <Text>{error.message}</Text>}>
      <Suspense fallback={<ActivityIndicator size="large" />}>
        <Container navigation={navigation} />
      </Suspense>
    </ErrorBoundary>
  );
}
