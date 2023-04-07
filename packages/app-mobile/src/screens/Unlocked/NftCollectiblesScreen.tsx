import type { Nft, NftCollection } from "@coral-xyz/common";
import type { StackScreenProps } from "@react-navigation/stack";
import type { UnwrapRecoilValue } from "recoil";

import { FlatList, View, ActivityIndicator } from "react-native";

import * as Linking from "expo-linking";

import { parseNftName } from "@coral-xyz/common";
import {
  nftCollectionsWithIds,
  useActiveWallet,
  nftById,
  useAllWallets,
  useBlockchainConnectionUrl,
} from "@coral-xyz/recoil";
import { MaterialIcons } from "@expo/vector-icons";
import { createStackNavigator } from "@react-navigation/stack";
import { useRecoilValue, useRecoilValueLoadable } from "recoil";

import { NftErrorBoundary } from "~components/ErrorBoundary";
import { NFTCard, BaseCard } from "~components/NFTCard";
import { NavHeader } from "~components/NavHeader";
import { Screen, EmptyState, CopyButtonIcon } from "~components/index";
import { useTheme } from "~hooks/useTheme";
import { WalletPickerButton } from "~screens/Unlocked/components/Balances";
import { TableHeader } from "~screens/Unlocked/components/index";

import { NftDetailScreen, NftDetailSendScreen } from "./NftDetailScreen";

type NftCollectionsWithId = {
  publicKey: string;
  collections: NftCollection[];
};

type SingleNftData = {
  title: string;
  nftId: string;
  publicKey: string;
  connectionUrl: string;
};

type CollectionNftData = {
  title: string;
  collectionId: string;
  publicKey: string;
  connectionUrl: string;
};

function NftCollectionCard({
  publicKey,
  collection,
  onPress,
}: {
  publicKey: string;
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
  const theme = useTheme();
  const activeWallet = useActiveWallet();
  const { contents, state } = useRecoilValueLoadable(nftCollectionsWithIds);
  const allWalletCollections: NftCollectionsWithId[] =
    (state === "hasValue" && contents) || [];
  const isLoading = state === "loading";

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
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
                onPress={navigation.push}
              />
            );
          }}
        />
      </View>
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

type NftStackParamList = {
  NftCollectionList: undefined;
  NftCollectionDetail: {
    title: string;
    collectionId: string;
    publicKey: string;
    connectionUrl: string;
  };
  NftDetail: {
    title: string;
    nftId: string;
    publicKey: string;
    connectionUrl: string;
  };
  SendNFT: {
    nft: Nft;
  };
};

const Stack = createStackNavigator<NftStackParamList>();
export function NftCollectiblesNavigator(): JSX.Element {
  const theme = useTheme();
  return (
    <Stack.Navigator
      initialRouteName="NftCollectionList"
      screenOptions={{ header: NavHeader }}
    >
      <Stack.Screen
        name="NftCollectionList"
        component={NftCollectionListScreen}
        options={{
          title: "Collectibles",
          headerTintColor: theme.custom.colors.fontColor,
        }}
      />
      <Stack.Screen
        name="NftCollectionDetail"
        component={NftCollectionDetailScreen}
        options={({ route }) => ({
          title: route.params.title,
          headerTintColor: theme.custom.colors.fontColor,
        })}
      />
      <Stack.Screen
        name="NftDetail"
        component={NftDetailScreen}
        options={({ route }) => ({
          title: route.params.title,
          headerTintColor: theme.custom.colors.fontColor,
        })}
      />
      <Stack.Screen
        name="SendNFT"
        component={NftDetailSendScreen}
        options={({ route }) => {
          const name = parseNftName(route.params.nft);
          return {
            title: `Send ${name}`,
            headerTintColor: theme.custom.colors.fontColor,
          };
        }}
      />
    </Stack.Navigator>
  );
}
