import type { Nft, NftCollection } from "@coral-xyz/common";
import type { UnwrapRecoilValue } from "recoil";

import React, { useState } from "react";
import {
  SectionList,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";

import * as Linking from "expo-linking";

import { UNKNOWN_NFT_ICON_SRC, Blockchain } from "@coral-xyz/common";
import {
  // isAggregateWallets,
  nftCollectionsWithIds,
  useActiveWallet,
  // allWalletsDisplayed,
  nftById,
  useAllWallets,
  useBlockchainConnectionUrl,
  // useNavigation,
  // useUser,
} from "@coral-xyz/recoil";
import { MaterialIcons } from "@expo/vector-icons";
import { createStackNavigator } from "@react-navigation/stack";
import { WalletPickerButton } from "@screens/Unlocked/components/Balances";
import { TableHeader } from "@screens/Unlocked/components/index";
import { useRecoilValue, useRecoilValueLoadable } from "recoil";

import { NFTCard, BaseCard } from "@components/NFTCard";
import { Screen, EmptyState, Margin, CopyButtonIcon } from "@components/index";
import { useTheme } from "@hooks/useTheme";

import { NFTDetailScreen, NFTDetailSendScreen } from "./NFTDetailScreen";
const ONE_COLLECTION_ID = "3PMczHyeW2ds7ZWDZbDSF3d21HBqG6yR4tG7vP6qczfj";

type NftCollectionsWithId = {
  publicKey: string;
  collections: NftCollection[];
};

function NftCollectionCard({
  publicKey,
  collection,
  onPress,
}: {
  publicKey: string;
  collection: NftCollection;
  onPress: (data: any) => void;
}): JSX.Element | null {
  const theme = useTheme();
  const wallets = useAllWallets();
  const wallet = wallets.find((wallet) => wallet.publicKey === publicKey);
  const blockchain = wallet?.blockchain!;
  const connectionUrl = useBlockchainConnectionUrl(blockchain);

  // Display the first NFT in the collection as the thumbnail in the grid
  const collectionDisplayNftId = collection.itemIds?.find((nftId) => !!nftId)!;
  const collectionDisplayNft = useRecoilValue(
    nftById({
      publicKey,
      connectionUrl,
      nftId: collectionDisplayNftId,
    })
  );

  const onPressItem = () => {
    if (collection.metadataCollectionId === ONE_COLLECTION_ID) {
      onPress({
        type: "NFT_ONE_COLLECTION",
        data: {
          title: "ONE Holders Chat",
          collectionId: collection.metadataCollectionId,
          nftMint: collectionDisplayNft?.mint,
        },
      });
      return;
    }

    if (collection.itemIds.length === 1) {
      if (!collectionDisplayNft.name || !collectionDisplayNft.id) {
        throw new Error("invalid NFT data");
      }

      // If there is only one item in the collection, link straight to its detail page
      onPress({
        type: "NFT_SINGLE",
        data: {
          nftName: collectionDisplayNft.name || "",
          nftId: collectionDisplayNft.id,
          publicKey,
          connectionUrl,
        },
      });
    } else {
      onPress({
        type: "NFT_COLLECTION",
        data: {
          collectionId: collection.id,
          publicKey,
          connectionUrl,
        },
      });
    }
  };

  return (
    <BaseCard
      onPress={onPressItem}
      imageUrl={collectionDisplayNft.imageUrl}
      subtitle={{
        name: collectionDisplayNft.name,
        length: collection.itemIds.length,
      }}
    />
  );
}

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

function SectionHeader({ title }: { title: string }): JSX.Element {
  const theme = useTheme();
  return (
    <Text
      style={[
        // styles.sectionHeaderTitle,
        {
          fontSize: 14,
          color: theme.custom.colors.fontColor,
          backgroundColor: "#FFF",
        },
      ]}
    >
      {title}
    </Text>
  );
}

export function NFTCollectionListScreen({ navigation }): JSX.Element {
  const theme = useTheme();
  const activeWallet = useActiveWallet();
  const { contents, state } = useRecoilValueLoadable(nftCollectionsWithIds);
  const allWalletCollections: NftCollectionsWithId[] =
    (state === "hasValue" && contents) || [];
  const isLoading = state === "loading";

  // const nftCount = allWalletCollections
  //   ? allWalletCollections
  //       .map((c: any) => c.collections)
  //       .flat()
  //       .reduce((acc, c) => (c === null ? acc : c.itemIds.length + acc), 0)
  //   : 0;
  //
  // const isEmpty = nftCount === 0 && !isLoading;

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#eee",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const data =
    allWalletCollections.find((c) => c.publicKey === activeWallet.publicKey)
      ?.collections || [];

  const onSelectItem = ({ type, data }) => {
    switch (type) {
      case "NFT_ONE_COLLECTION": {
        const { title, collectionId, nftMint } = data;
        Alert.alert(JSON.stringify(title, collectionId, nftMint));
        break;
      }

      case "NFT_SINGLE": {
        const { nftName, nftId, publicKey, connectionUrl } = data;
        navigation.push("NFTDetail", {
          title: nftName,
          nftId,
          publicKey,
          connectionUrl,
        });
        break;
      }

      case "NFT_COLLECTION": {
        const { collectionId, publicKey, connectionUrl } = data;
        navigation.push("NFTCollectionDetail", {
          title: "Collection",
          collectionId,
          publicKey,
          connectionUrl,
        });
        break;
      }
      default:
    }
  };

  return (
    <Screen>
      <View
        style={{
          backgroundColor: theme.custom.colors.nav,
          borderRadius: 12,
          flex: 1,
          padding: 4,
        }}
      >
        <TableHeader
          blockchain={activeWallet.blockchain}
          onPress={console.log}
          visible
          rightSide={<CopyButtonIcon text={activeWallet.publicKey} />}
          subtitle={
            <WalletPickerButton
              name={activeWallet.name}
              onPress={() => {
                navigation.navigate("wallet-picker");
              }}
            />
          }
        />
        <FlatList
          data={data}
          numColumns={2}
          ListEmptyComponent={NoNFTsEmptyState}
          keyExtractor={(collection) => collection.id}
          renderItem={({ item: collection }) => {
            return (
              <NftCollectionCard
                publicKey={activeWallet.publicKey}
                collection={collection}
                onPress={onSelectItem}
              />
            );
          }}
        />
      </View>
    </Screen>
  );
}

function NFTCollectionDetailScreen({ navigation, route }): JSX.Element | null {
  const { collectionId, publicKey, connectionUrl } = route.params;
  const { contents, state } = useRecoilValueLoadable<
    UnwrapRecoilValue<typeof nftCollectionsWithIds>
  >(nftCollectionsWithIds);
  const c = (state === "hasValue" && contents) || null;
  const collection = !c
    ? null
    : c
        .map((c: any) => c.collections!)
        .flat()
        .find((c: any) => c.id === collectionId);

  console.log({ contents, c, collection });

  // Hack: id can be undefined due to framer-motion animation, and
  // collection can be undefined when looking at a collection not in current
  // wallet.
  if (collectionId === undefined || !collection) {
    return null;
  }

  return (
    <FlatList
      style={{ padding: 8 }}
      initialNumToRender={8}
      data={collection.itemIds}
      numColumns={2}
      renderItem={({ item }) => {
        return (
          <NFTCard
            nftId={item}
            connectionUrl={connectionUrl}
            publicKey={publicKey}
            onPress={() => {
              navigation.push("NFTDetail", {
                nftId: item.id,
                publicKey,
                connectionUrl,
              });
            }}
          />
        );
      }}
    />
  );
}

export type NftStackParamList = {
  NFTCollectionList: undefined;
  NFTCollectionDetail: {
    title: string;
    collectionId: string;
    publicKey: string;
    connectionUrl: string;
  };
  NFTDetail: {
    title: string;
    nftId: string;
    publicKey: string;
    connectionUrl: string;
  };
  SendNFT: undefined;
};

const Stack = createStackNavigator<NftStackParamList>();
export function NFTCollectiblesNavigator(): JSX.Element {
  return (
    <Stack.Navigator
      initialRouteName="NFTCollectionList"
      screenOptions={{ presentation: "modal" }}
    >
      <Stack.Group screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="NFTCollectionList"
          component={NFTCollectionListScreen}
        />
      </Stack.Group>
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
