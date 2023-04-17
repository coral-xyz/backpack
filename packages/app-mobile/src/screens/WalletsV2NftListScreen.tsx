import type {
  NftCollectionsWithId,
  SingleNftData,
  CollectionNftData,
  PublicKey,
} from "@@types/types";
import type { NftCollection } from "@coral-xyz/common";
import type { StackScreenProps } from "@react-navigation/stack";
import type { UnwrapRecoilValue } from "recoil";

import { FlatList, View, ActivityIndicator } from "react-native";

import * as Linking from "expo-linking";

import {
  nftCollectionsWithIds,
  useActiveWallet,
  nftById,
  useAllWallets,
  useBlockchainConnectionUrl,
} from "@coral-xyz/recoil";
import { MaterialIcons } from "@expo/vector-icons";
import { useRecoilValue, useRecoilValueLoadable } from "recoil";

import { NftErrorBoundary } from "~components/ErrorBoundary";
import { NFTCard, BaseCard } from "~components/NFTCard";
import { Screen, EmptyState, RoundedContainerGroup } from "~components/index";
import { useActiveWalletCollections } from "~hooks/recoil";
import { useTheme } from "~hooks/useTheme";

function NftCollectionCard({
  publicKey,
  collection,
  onPress,
}: {
  publicKey: PublicKey;
  collection: NftCollection;
  onPress: (route: string, data: SingleNftData | CollectionNftData) => void;
}): JSX.Element | null {
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
  ) || { name: "", collectionName: "", id: "", imageUrl: "", itemIds: [] };

  const onPressCollectionCard = () => {
    if (collection.itemIds.length === 1) {
      if (!collectionDisplayNft.collectionName || !collectionDisplayNft.id) {
        throw new Error("invalid NFT data");
      }

      // If there is only one item in the collection, link straight to its detail page
      onPress("NftDetail", {
        title: collectionDisplayNft.name || collectionDisplayNft.collectionName,
        nftId: collectionDisplayNft.id,
        publicKey,
        connectionUrl,
      });
    } else {
      // Link to the collection page and load another list
      onPress("NftCollectionDetail", {
        title: collectionDisplayNft.collectionName,
        collectionId: collection.id,
        publicKey,
        connectionUrl,
      });
    }
  };

  return (
    <NftErrorBoundary data={{ collection }}>
      <BaseCard
        onPress={onPressCollectionCard}
        imageUrl={collectionDisplayNft.imageUrl}
        subtitle={{
          name: collectionDisplayNft.collectionName,
          length: collection.itemIds.length,
        }}
      />
    </NftErrorBoundary>
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

export function NftCollectionListScreen({
  navigation,
}: StackScreenProps<NftStackParamList, "NftCollectionList">): JSX.Element {
  const activeWallet = useActiveWallet();
  const collections = useActiveWalletCollections();

  // if (isLoading) {
  //   return (
  //     <View
  //       style={{
  //         flex: 1,
  //         justifyContent: "center",
  //         alignItems: "center",
  //       }}
  //     >
  //       <ActivityIndicator size="large" />
  //     </View>
  //   );
  // }

  return (
    <Screen>
      <RoundedContainerGroup style={{ padding: 12 }}>
        <FlatList
          data={collections}
          numColumns={2}
          ListEmptyComponent={NoNFTsEmptyState}
          keyExtractor={(collection) => collection.id}
          renderItem={({ item: collection }) => {
            return (
              <NftCollectionCard
                publicKey={activeWallet.publicKey}
                collection={collection}
                onPress={navigation.push}
              />
            );
          }}
        />
      </RoundedContainerGroup>
    </Screen>
  );
}

function NftCollectionDetailScreen({
  navigation,
  route,
}: StackScreenProps<
  NftStackParamList,
  "NftCollectionDetail"
>): JSX.Element | null {
  const { title, collectionId, publicKey, connectionUrl } = route.params;
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
            onPress={(name) => {
              console.log("debug:name", name);
              navigation.push("NftDetail", {
                title: name,
                nftId: item,
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
