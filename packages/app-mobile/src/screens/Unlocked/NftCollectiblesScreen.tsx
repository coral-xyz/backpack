import type { Nft, NftCollection } from "@coral-xyz/common";

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

import { Blockchain } from "@coral-xyz/common";
import {
  // isAggregateWallets,
  nftCollectionsWithIds,
  // useActiveWallet,
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
import { useRecoilValueLoadable } from "recoil";

import { EmptyState, Margin, NFTCard } from "@components/index";
import { useTheme } from "@hooks/useTheme";

import { NFTDetailScreen, NFTDetailSendScreen } from "./NFTDetailScreen";

const Stack = createStackNavigator();
type NftCollectionsWithId = {
  publicKey: string;
  collections: NftCollection[];
};

// export type NftCollection = {
//   id: string;
//   metadataCollectionId: string;
//   symbol: string;
//   tokenType: string;
//   totalSupply: string;
//   itemIds: Array<string>;
//   items?: { [id: string]: Nft }; // Not expected to be defined. Eth only.
// };
//
// export type Nft = {
//   id: string;
//   blockchain: Blockchain;
//   name: string;
//   description: string;
//   externalUrl: string;
//   imageUrl: string;
//   imageData?: string;
//   attributes?: NftAttribute[];
//   mint?: string;
//   collectionName: string;
//   metadataCollectionId?: string;
//   tokenId?: string; // Ethereum only.
//   contractAddress?: string; // Ethereum only.
// };

// function TableHeader({
//   onPress,
//   visible,
//   name,
// }: {
//   onPress: () => void;
//   visible: boolean;
//   name: string;
// }): JSX.Element {
//   return (
//     <Pressable onPress={onPress} style={styles.header}>
//       <View style={{ flexDirection: "row", alignItems: "center" }}>
//         <Text>{name}</Text>
//       </View>
//       <MaterialIcons
//         name={visible ? "keyboard-arrow-up" : "keyboard-arrow-down"}
//         size={24}
//         color="black"
//       />
//     </Pressable>
//   );
// }

function NftCollectionCard({
  publicKey,
  collection,
  onPress,
}: {
  publicKey: string;
  collection: NftCollection;
  onPress: (collectionId: string) => void;
}): JSX.Element {
  const wallets = useAllWallets();
  const wallet = wallets.find((wallet) => wallet.publicKey === publicKey);
  const blockchain = wallet?.blockchain!;
  const connectionUrl = useBlockchainConnectionUrl(blockchain);

  // Display the first NFT in the collection as the thumbnail in the grid
  const collectionDisplayNftId = collection.itemIds?.find((nftId) => !!nftId)!;
  const { contents, state } = useRecoilValueLoadable(
    nftById({
      publicKey,
      connectionUrl,
      nftId: collectionDisplayNftId,
    })
  );

  const collectionDisplayNft = state === "hasValue" ? contents : {};
  console.log("nft:collectionDisplayNft", collectionDisplayNft);
  if (state === "loading") {
    return null;
  }

  const onPressItem = () => {
    console.log("pressed:collection", collection);
    // if (collection.metadataCollectionId === ONE_COLLECTION_ID) {
    // push({
    //   title: "ONE Holders Chat",
    //   componentId: NAV_COMPONENT_NFT_CHAT,
    //   componentProps: {
    //     collectionId: collection.metadataCollectionId,
    //     //@ts-ignore
    //     nftMint: collectionDisplayNft?.mint,
    //     title: "ONE Holders Chat",
    //   },
    // });
    // return;
    // }

    if (collection.itemIds.length === 1) {
      if (!collectionDisplayNft.name || !collectionDisplayNft.id) {
        throw new Error("invalid NFT data");
      }
      // If there is only one item in the collection, link straight to its detail page
      // push({
      //   title: collectionDisplayNft.name || "",
      //   componentId: NAV_COMPONENT_NFT_DETAIL,
      //   componentProps: {
      //     nftId: collectionDisplayNft.id,
      //     publicKey,
      //     connectionUrl,
      //   },
      // });
    } else {
      // Multiple items in connection, display a grid
      // push({
      //   title: collectionDisplayNft.collectionName,
      //   componentId: NAV_COMPONENT_NFT_COLLECTION,
      //   componentProps: {
      //     id: collection.id,
      //     publicKey,
      //     connectionUrl,
      //   },
      // });
    }
  };

  return (
    <Pressable
      style={{
        width: "50%",
        padding: 8,
        borderRadius: 8,
        overflow: "hidden",
        position: "relative",
      }}
      onPress={onPressItem}
    >
      <Image
        source={{ uri: collectionDisplayNft.imageUrl }}
        style={{ borderRadius: 8, aspectRatio: 1 }}
      />
      <View
        style={{
          position: "absolute",
          bottom: 8,
          left: 8,
          right: 8,
          backgroundColor: "#FFF",
          borderRadius: 8,
          padding: 4,
          margin: 8,
        }}
      >
        <Text numberOfLines={1}>{collectionDisplayNft.name}</Text>
        <Text numberOfLines={1}>({collection.itemIds.length})</Text>
      </View>
    </Pressable>
  );
}

// function NFTTable({
//   blockchain,
//   collection,
//   initialState,
//   onSelectItem,
// }: {
//   blockchain: Blockchain;
//   collection: NftCollection[];
//   initialState?: boolean;
//   onSelectItem: (collectionId: string, blockchain: Blockchain) => void;
// }): JSX.Element {
//   const [visible, setVisible] = React.useState(initialState);
//   const onPress = () => {
//     setVisible(!visible);
//   };
//
//   return (
//     <View style={{ backgroundColor: "#fff", borderRadius: 8 }}>
//       <TableHeader name={blockchain} onPress={onPress} visible={visible} />
//
//       {visible ? (
//         <FlatList
//           style={{ padding: 8 }}
//           initialNumToRender={4}
//           scrollEnabled={false}
//           data={collection}
//           numColumns={2}
//           renderItem={({ item: collection }) => {
//             const preview = collection.items[0];
//             return (
//               <NftCollectionCard
//                 collection={collection.id}
//                 onPress={(collectionId) =>
//                   onSelectItem(collectionId, blockchain)
//                 }
//                 name={preview.name}
//                 imageUrl={preview.imageUrl}
//               />
//             );
//           }}
//         />
//       ) : null}
//     </View>
//   );
// }
//
// function NoNFTsEmptyState() {
//   return (
//     <EmptyState
//       icon={(props: any) => <MaterialIcons name="image" {...props} />}
//       title="No NFTs"
//       subtitle="Get started with your first NFT"
//       buttonText="Browse Magic Eden"
//       onPress={() => Linking.openURL("https://magiceden.io")}
//     />
//   );
// }

function buildSectionList(collections: NftCollectionsWithId[] = []): {
  title: string;
  publicKey: string;
  data: NftCollection[];
}[] {
  return collections.map(({ publicKey, collections }) => ({
    publicKey,
    title: publicKey,
    data: collections,
  }));
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
  // const activeWallet = useActiveWallet();
  // const wl = useRecoilValueLoadable(allWalletsDisplayed);
  // const wallets = wl.state === "hasValue" ? wl.contents : [];
  // const _isAggregateWallets = useRecoilValue(isAggregateWallets);
  const [expandedSections, setExpandedSections] = useState(new Set());
  const { contents, state } = useRecoilValueLoadable(nftCollectionsWithIds);
  const allWalletCollections: NftCollectionsWithId[] =
    (state === "hasValue" && contents) || [];
  const isLoading = state === "loading";
  const sections = buildSectionList(allWalletCollections);

  const nftCount = allWalletCollections
    ? allWalletCollections
        .map((c: any) => c.collections)
        .flat()
        .reduce((acc, c) => (c === null ? acc : c.itemIds.length + acc), 0)
    : 0;

  const isEmpty = nftCount === 0 && !isLoading;

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

  const handleToggle = (blockchain: Blockchain) => {
    const newExpandedSections = new Set(expandedSections);
    if (newExpandedSections.has(blockchain)) {
      newExpandedSections.delete(blockchain);
    } else {
      newExpandedSections.add(blockchain);
    }

    setExpandedSections(newExpandedSections);
  };

  console.log("nft:isEmpty", isEmpty);
  console.log("nft:contents", isLoading, contents);

  if (isEmpty) {
    return <Text>NO NFTS</Text>;
  }

  console.log({
    // contents,
    // isLoading,
    // activeWallet,
    // wallets,
    allWalletCollections,
    // collections,
  });

  // const onSelectItem = (id: string, blockchain: Blockchain) => {
  //   const collection = collections[blockchain].find((c) => c.id === id);
  //
  //   if (!collection) {
  //     Alert.alert(`${blockchain}:${id} not working`);
  //   }
  //
  //   const hasMultipleItems = collection.items.length > 1;
  //
  //   if (hasMultipleItems) {
  //     navigation.push("NFTCollectionDetail", {
  //       title: collection.name,
  //       collectionId: collection.id,
  //     });
  //   } else {
  //     const collectionDisplayNft = collection.items[0];
  //     navigation.push("NFTDetail", {
  //       title: collectionDisplayNft.name || "",
  //       nftId: collectionDisplayNft.id,
  //     });
  //   }
  // };
  // const styles = {
  //   flex: 1,
  // };
  //
  // if (allWalletCollections.length === 0) {
  //   // @ts-ignore
  //   styles.justifyContent = "center";
  //   // @ts-ignore
  //   styles.alignItems = "center";
  // }

  return (
    <SectionList
      style={{
        backgroundColor: "white",
        borderRadius: 12,
        marginHorizontal: 12,
      }}
      sections={sections}
      extraData={expandedSections}
      scrollEnabled={allWalletCollections.length > 0}
      // keyExtractor={(item, index) => item + index}
      renderSectionHeader={({ section: { title } }) => {
        const visible = !expandedSections.has(title);
        return (
          <TableHeader
            blockchain={Blockchain.SOLANA}
            subtitle={
              <WalletPickerButton
                name="Wallet 1"
                onPress={() => {
                  navigation.navigate("wallet-picker");
                }}
              />
            }
            rightSide={
              <Pressable onPress={() => handleToggle(title)}>
                <MaterialIcons
                  name={visible ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                  size={18}
                  color={theme.custom.colors.fontColor}
                />
              </Pressable>
            }
          />
        );
      }}
      renderItem={({ section, item: collection, index }) => {
        const isExpanded = expandedSections.has(section.title);
        if (!isExpanded) {
          return null;
        }

        return (
          <FlatList
            data={section.data}
            numColumns={2}
            renderItem={({ item: collection }) => {
              return (
                <NftCollectionCard
                  publicKey={section.title}
                  collection={collection}
                  onPress={console.log}
                />
              );
            }}
          />
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 30,
    padding: 8,
  },
});

function NFTCollectionDetailScreen({ navigation, route }): JSX.Element {
  const { collectionId } = route.params;

  const collections = [];

  // const [collections, _] = useLoader(nftCollections, {
  //   [Blockchain.SOLANA]: [] as NftCollection[],
  //   [Blockchain.ETHEREUM]: [] as NftCollection[],
  // });

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
