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
  type ListItem,
} from "~lib/convertNftDataToFlatlist";

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

function CollectionImage({ images }: { images: string[] }): JSX.Element {
  if (images.length === 1) {
    return (
      <Image
        source={{ uri: images[0] }}
        style={{ borderRadius: 16, aspectRatio: 1, height: 164, padding: 12 }}
      />
    );
  }

  return (
    <View
      style={{
        flexDirection: "row",
        flex: 1,
        gap: 4,
        flexWrap: "wrap",
        padding: 8,
      }}
    >
      {images.slice(0, 4).map((uri) => {
        return (
          <Image
            key={uri}
            source={{ uri }}
            style={{
              borderRadius: 8,
              aspectRatio: 1,
              width: "25%",
              backgroundColor: "black",
            }}
          />
        );
      })}
    </View>
  );
}

function RowItem({
  item,
  handlePress,
}: {
  item: ListItem;
  handlePress: (item: ListItem) => void;
}): JSX.Element {
  return (
    <Pressable
      style={{ flex: 1, marginBottom: 12, borderRadius: 16 }}
      onPress={() => handlePress(item)}
    >
      <CollectionImage images={item.images} />
      <XStack mt={16}>
        <StyledText mr={4} fontSize="$base" maxWidth="90%" ellipsizeMode="tail">
          {item.title}
        </StyledText>
        <StyledText fontSize="$base">{item.numItems.toString()}</StyledText>
      </XStack>
    </Pressable>
  );
}

const GET_NFT_COLLECTIONS = gql`
  query WalletNftCollections($chainId: ChainID!, $address: String!) {
    wallet(chainId: $chainId, address: $address) {
      id
      nfts {
        edges {
          node {
            id
            image
            name
            address
            collection {
              address
              id
              image
              name
              verified
            }
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
      // TODO add blockchain_uppercase so we don't have to keep adding this everywhere
      // alternatively make the graphql enum return lowercase if possible
      chainId: activeWallet.blockchain.toUpperCase(),
      address: activeWallet.publicKey,
    },
  });

  const handlePressItem = useCallback(
    (item: ListItem) => {
      if (item.type === "collection") {
        // navigate to collection detail
        navigation.push("NftCollectionDetail", {
          id: item.key,
          title: item.title,
        });
      } else {
        // navigation to nft detail
        navigation.push("NftDetail", { item: item.key, title: item.title });
      }
    },
    [navigation]
  );

  const rows = useMemo(() => convertNftDataToFlatlist(data), [data]);
  const keyExtractor = (item: ListItem) => item.key;
  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      return <RowItem item={item} handlePress={handlePressItem} />;
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
