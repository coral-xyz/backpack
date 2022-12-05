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
import { Margin, NFTCard, Screen } from "@components";
import type { NftCollection } from "@coral-xyz/common";
import { Blockchain, toTitleCase } from "@coral-xyz/common";
import {
  nftCollections,
  useActiveWallets,
  useEnabledBlockchains,
  useLoader,
} from "@coral-xyz/recoil";
import { MaterialIcons } from "@expo/vector-icons";
import { createStackNavigator } from "@react-navigation/stack";
import { NFTDetailScreen, NFTDetailSendScreen } from "./NFTDetailScreen";
// import { useIsONELive, useTheme } from "@hooks";

const Stack = createStackNavigator();
const DEV_COLLECTIONS = {
  solana: [
    {
      id: "Ai trippin mushroom ",
      name: "Ai trippin mushroom ",
      symbol: "mushroom",
      tokenType: "",
      totalSupply: "",
      items: [
        {
          id: "5ZWJcdubk2hUju6voN8byyFvjDyBZi4k36fRarNTGbtn",
          blockchain: "solana",
          publicKey: "5ZWJcdubk2hUju6voN8byyFvjDyBZi4k36fRarNTGbtn",
          mint: "A2z5PbGfqxoLA4eAynjTesbnkWZurf8oBgVzfjn4kNYq",
          name: "Ai trippin mushroom #318",
          description: "333 trippin mushrooms in mushroom lands made by AI.",
          externalUrl: "",
          imageUrl:
            "https://nftstorage.link/ipfs/bafybeierzfo6p7qfw4wyo37fuzyfkhlcyv4srfvtv5rpxnir5pond2syru/318.png",
          attributes: [],
        },
        {
          id: "HxZ5iaKqCHkXKJpqPkbq6P3pQJdkEAMDFgXEmYc3CfCe",
          blockchain: "solana",
          publicKey: "HxZ5iaKqCHkXKJpqPkbq6P3pQJdkEAMDFgXEmYc3CfCe",
          mint: "EdjyZqGTsJZNSuKvFvqfVf1gjMfPAaEucW3GdRX1Vuct",
          name: "Ai trippin mushroom #92",
          description: "333 trippin mushrooms in mushroom lands made by AI.",
          externalUrl: "",
          imageUrl:
            "https://nftstorage.link/ipfs/bafybeierzfo6p7qfw4wyo37fuzyfkhlcyv4srfvtv5rpxnir5pond2syru/92.png",
          attributes: [],
        },
      ],
    },
    {
      id: "DeGods",
      name: "DeGods",
      symbol: "DGOD",
      tokenType: "",
      totalSupply: "",
      items: [
        {
          id: "Arvwe543tmggWL9ycQbrwZwXHgMGyQ5KewjWyCpqja7G",
          blockchain: "solana",
          publicKey: "Arvwe543tmggWL9ycQbrwZwXHgMGyQ5KewjWyCpqja7G",
          mint: "9QDoTNp5z7htaWu3AJGL9E7RSuwdqyD8TwTj2JocabzQ",
          name: "DeGod #1764",
          description:
            "A collection of 10,000 of the most degenerate gods in the universe.",
          externalUrl: "https://degods.com",
          imageUrl:
            "https://arweave.net/vCLN06ZKU5cCCGz_9FQj_LW9ZCVI5E3gfvHvlhcpo_8?ext=png",
          attributes: [
            {
              traitType: "background",
              value: "Teal",
            },
            {
              traitType: "skin",
              value: "Leopard",
            },
            {
              traitType: "specialty",
              value: "God of War",
            },
            {
              traitType: "clothes",
              value: "Bleached Tee",
            },
            {
              traitType: "neck",
              value: "None",
            },
            {
              traitType: "head",
              value: "God Dome",
            },
            {
              traitType: "eyes",
              value: "None",
            },
            {
              traitType: "mouth",
              value: "None",
            },
            {
              traitType: "version",
              value: "DeadGod",
            },
          ],
        },
      ],
    },
    {
      id: "Hypersphere",
      name: "Hypersphere",
      symbol: "HYPE",
      tokenType: "",
      totalSupply: "",
      items: [
        {
          id: "91tQAnZ6AMrLX3FPPuYWwPLYYHksE5h5vs1WHJN7gmbK",
          blockchain: "solana",
          publicKey: "91tQAnZ6AMrLX3FPPuYWwPLYYHksE5h5vs1WHJN7gmbK",
          mint: "J1YiDsv5p9B2rrKBKrEFxg7MLPweCGDNRq3KexM1righ",
          name: "Hypersphere",
          description:
            "Hyperspace Test NFT. Testing in prod with Cardinal royalty enforcement protection.",
          imageUrl:
            "https://arweave.net/w-hu8VClsjDoSkXsi8XvATg7T5vGc8iekZRlz_bh7e0?ext=png",
          attributes: [
            {
              traitType: "rings",
              value: "single",
            },
          ],
        },
      ],
    },
    {
      id: "No Collection",
      name: "No Collection",
      symbol: "",
      tokenType: "",
      totalSupply: "",
      items: [
        {
          id: "GYqqo3sSHPaeWaZZC6XyrUwqQ9UeYtreFFg6JrQAcFQv",
          blockchain: "solana",
          publicKey: "GYqqo3sSHPaeWaZZC6XyrUwqQ9UeYtreFFg6JrQAcFQv",
          mint: "8Rup8H7JG63DAeLXmdppnTGC1bLtv1keEE6Vuf3WfExy",
          name: "Degods",
          description: "View and stake your Degods directly in your Backpack.",
          externalUrl: "https://stake.deadgods.com/",
          imageUrl:
            "https://xnfts.s3.us-west-2.amazonaws.com/i2HP4KaZ2zXKwLZVyTkDK3itCRugt6Npb5Zn7t28yR5/icon/degods.png",
        },
      ],
    },
  ],
  ethereum: [
    {
      id: "Ai trippin mushroom ",
      name: "Ai trippin mushroom ",
      symbol: "mushroom",
      tokenType: "",
      totalSupply: "",
      items: [
        {
          id: "6x5ZWJcdubk2hUju6voN8byyFvjDyBZi4k36fRarNTGbtn",
          blockchain: "solana",
          publicKey: "6x5ZWJcdubk2hUju6voN8byyFvjDyBZi4k36fRarNTGbtn",
          mint: "6xA2z5PbGfqxoLA4eAynjTesbnkWZurf8oBgVzfjn4kNYq",
          name: "Ai trippin mushroom #318",
          description: "333 trippin mushrooms in mushroom lands made by AI.",
          externalUrl: "",
          imageUrl:
            "https://nftstorage.link/ipfs/bafybeierzfo6p7qfw4wyo37fuzyfkhlcyv4srfvtv5rpxnir5pond2syru/318.png",
          attributes: [],
        },
        {
          id: "HxZ5iaKqCHkXKJpqPkbq6P3pQJdkEAMDFgXEmYc3CfCe",
          blockchain: "solana",
          publicKey: "HxZ5iaKqCHkXKJpqPkbq6P3pQJdkEAMDFgXEmYc3CfCe",
          mint: "EdjyZqGTsJZNSuKvFvqfVf1gjMfPAaEucW3GdRX1Vuct",
          name: "Ai trippin mushroom #92",
          description: "333 trippin mushrooms in mushroom lands made by AI.",
          externalUrl: "",
          imageUrl:
            "https://nftstorage.link/ipfs/bafybeierzfo6p7qfw4wyo37fuzyfkhlcyv4srfvtv5rpxnir5pond2syru/92.png",
          attributes: [],
        },
      ],
    },
  ],
};

function SectionHeader({ section: { title } }: any): JSX.Element {
  const onPress = () => {};
  const collapsed = false;
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <View style={{ flexDirection: "row" }}>
        <View
          style={{
            width: 12,
            height: 12,
            marginRight: 12,
          }}
        />
        <Text>{title}</Text>
      </View>
      <View style={{ width: 32, height: 32 }}>
        <Pressable onPress={onPress}>
          <MaterialIcons
            name={collapsed ? "keyboard-arrow-down" : "keyboard-arrow-up"}
            size={24}
            color="#333"
          />
        </Pressable>
      </View>
    </View>
  );
}

// export type NftCollection = {
//   id: string;
//   name: string;
//   symbol: string;
//   tokenType: string;
//   totalSupply: string;
//   items: Nft[];
// };

// export type Nft = {
//   id: string;
//   blockchain: Blockchain;
//   name: string;
//   description: string;
//   externalUrl: string;
//   imageUrl: string;
//   imageData?: string;
//   attributes?: NftAttribute[];
// };

function EmptyState() {
  return (
    <View style={{ backgroundColor: "blue" }}>
      <Text>NO NFTS go buy some</Text>
    </View>
  );
}

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
        <View style={styles.logoContainer}></View>
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

export function NFTCollectionListScreen({ navigation }): JSX.Element {
  // const isONELive = useIsONELive();
  const activeWallets = useActiveWallets();
  const enabledBlockchains = useEnabledBlockchains();

  const collections = DEV_COLLECTIONS;
  const [_collections, _, isLoading] = useLoader(
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
    <ScrollView style={{ flex: 1 }}>
      <View style={{ padding: 8, flex: 1 }}>
        {!hasCollections ? <EmptyState /> : null}
        {Object.entries(collections).map(([blockchain, collection]) => {
          return (
            <Margin key={blockchain} bottom={8}>
              <NFTTable
                blockchain={blockchain}
                collection={collection}
                initialState={true}
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
    <Stack.Navigator
      initialRouteName="NFTCollectionList"
      // screenOptions={{ headerShown: false }}
    >
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
