import type { NftCollection } from "@coral-xyz/common";

import React from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import * as Linking from "expo-linking";

import { EmptyState, Margin, NFTCard, Screen } from "@components";
import { Blockchain, toTitleCase } from "@coral-xyz/common";
import {
  useActiveWallets,
  useEnabledBlockchains,
  useLoader,
} from "@coral-xyz/recoil";
import { MaterialIcons } from "@expo/vector-icons";
import { createStackNavigator } from "@react-navigation/stack";

import { NFTDetailScreen, NFTDetailSendScreen } from "./NFTDetailScreen";

const Stack = createStackNavigator();
function TableHeader({
  onPress,
  visible,
  name,
}: {
  onPress: () => void;
  visible: boolean;
  name: string;
}): JSX.Element {
  return (
    <Pressable onPress={onPress} style={styles.header}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text>{name}</Text>
      </View>
      <MaterialIcons
        name={visible ? "keyboard-arrow-up" : "keyboard-arrow-down"}
        size={24}
        color="black"
      />
    </Pressable>
  );
}

function NFTItem({
  collectionId,
  name,
  imageUrl,
  onPress,
}: {
  collectionId: string;
  name: string;
  imageUrl: string;
  onPress: (collectionId: string) => void;
}): JSX.Element {
  return (
    <Pressable
      style={{ flex: 0.5, margin: 8, borderRadius: 8, overflow: "hidden" }}
      onPress={() => onPress(collectionId)}
    >
      <Image source={{ uri: imageUrl }} style={{ aspectRatio: 1 }} />
      <View
        style={{
          position: "absolute",
          bottom: 8,
          left: 8,
          right: 8,
          backgroundColor: "#FFF",
          borderRadius: 8,
          padding: 4,
        }}
      >
        <Text numberOfLines={1}>{name}</Text>
      </View>
    </Pressable>
  );
}

function NFTTable({
  blockchain,
  collection,
  initialState,
  onSelectItem,
}: {
  blockchain: Blockchain;
  collection: NftCollection[];
  initialState?: boolean;
  onSelectItem: (collectionId: string, blockchain: Blockchain) => void;
}): JSX.Element {
  const [visible, setVisible] = React.useState(initialState);
  const onPress = () => {
    setVisible(!visible);
  };

  return (
    <View style={{ backgroundColor: "#fff", borderRadius: 8 }}>
      <TableHeader name={blockchain} onPress={onPress} visible={visible} />

      {visible ? (
        <FlatList
          style={{ padding: 8 }}
          initialNumToRender={4}
          scrollEnabled={false}
          data={collection}
          numColumns={2}
          renderItem={({ item: collection }) => {
            const preview = collection.items[0];
            return (
              <NFTItem
                collectionId={collection.id}
                onPress={(collectionId) =>
                  onSelectItem(collectionId, blockchain)
                }
                name={preview.name}
                imageUrl={preview.imageUrl}
              />
            );
          }}
        />
      ) : null}
    </View>
  );
}

function NoEmptyState() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
      }}
    >
      <EmptyState
        icon={(props: any) => <MaterialIcons name="image" {...props} />}
        title="No NFTs"
        subtitle="Get started with your first NFT"
        buttonText="Browse Magic Eden"
        onPress={() => Linking.openURL("https://magiceden.io")}
      />
    </View>
  );
}

export function NFTCollectionListScreen({ navigation }): JSX.Element {
  // const isONELive = useIsONELive();
  const activeWallets = useActiveWallets();
  const enabledBlockchains = useEnabledBlockchains();

  // const collections = DEV_COLLECTIONS;
  const [collections, _, isLoading] = useLoader(
    nftCollections,
    Object.fromEntries(
      enabledBlockchains.map((b: Blockchain) => [b, new Array<NftCollection>()])
    ),
    // Note this reloads on any change to the active wallets, which reloads
    // NFTs for both blockchains.
    // TODO Make this reload for only the relevant blockchain
    [activeWallets]
  );

  const hasCollections =
    Object.entries(collections)
      .map(([_name, data]) => {
        return data.length > 0;
      })
      .filter(Boolean).length > 0;

  const onSelectItem = (id: string, blockchain: Blockchain) => {
    console.log("id", id, blockchain, collections[blockchain]);
    const collection = collections[blockchain].find((c) => c.id === id);
    console.log("collection", collection);

    if (!collection) {
      Alert.alert(`${blockchain}:${id} not working`);
    }

    const hasMultipleItems = collection.items.length > 1;

    if (hasMultipleItems) {
      navigation.push("NFTCollectionDetail", {
        title: collection.name,
        collectionId: collection.id,
      });
    } else {
      const collectionDisplayNft = collection.items[0];
      navigation.push("NFTDetail", {
        title: collectionDisplayNft.name || "",
        nftId: collectionDisplayNft.id,
      });
    }
  };

  // TODO(peter) FlatList inside of a ScrollView error. TBD
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flex: 1 }}>
      <View style={{ padding: 8, flex: 1 }}>
        {!hasCollections ? <NoEmptyState /> : null}
        {hasCollections &&
          Object.entries(collections).map(([blockchain, collection]) => {
            return (
              <Margin key={blockchain} bottom={8}>
                <NFTTable
                  blockchain={blockchain}
                  collection={collection}
                  initialState
                  onSelectItem={onSelectItem}
                />
              </Margin>
            );
          })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#eee",
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 30,
    padding: 8,
  },
  logoContainer: {
    width: 12,
    height: 12,
    backgroundColor: "#000",
    marginRight: 8,
  },
});

function NFTCollectionDetailScreen({ navigation, route }): JSX.Element {
  const { collectionId } = route.params;

  const [collections, _] = useLoader(nftCollections, {
    [Blockchain.SOLANA]: [] as NftCollection[],
    [Blockchain.ETHEREUM]: [] as NftCollection[],
  });

  const collection = Object.values(collections)
    .flat()
    .find((c: NftCollection) => c.id === collectionId);

  const handlePressNFT = (nftId: string) => {
    navigation.push("NFTDetail", { nftId });
  };

  // Hack: id can be undefined due to framer-motion animation, and
  // collection can be undefined when looking at a collection not in current
  // wallet.
  if (collectionId === undefined || !collection) {
    return <></>;
  }

  return (
    <FlatList
      style={{ padding: 8 }}
      initialNumToRender={8}
      data={collection.items}
      numColumns={2}
      renderItem={({ item }) => {
        return (
          <NFTCard
            imageUrl={item.imageUrl}
            onPress={() => {
              handlePressNFT(item.id);
            }}
          />
        );
      }}
    />
  );
}

export function NFTCollectiblesNavigator(): JSX.Element {
  return (
    <Stack.Navigator initialRouteName="NFTCollectionList">
      <Stack.Screen
        name="NFTCollectionList"
        component={NFTCollectionListScreen}
      />
      <Stack.Screen
        name="NFTCollectionDetail"
        component={NFTCollectionDetailScreen}
        options={({ route }) => ({ title: route.params.title })}
      />
      <Stack.Screen
        name="NFTDetail"
        component={NFTDetailScreen}
        options={({ route }) => ({ title: route.params.title })}
      />
      <Stack.Screen name="SendNFT" component={NFTDetailSendScreen} />
    </Stack.Navigator>
  );
}
