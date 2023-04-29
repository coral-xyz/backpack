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

import {
  ListItemSentReceived,
  ListItemTokenSwap,
  // ListItemNotification,
  ListItemActivity,
  // ListItemFriendRequest,
} from "~components/ListItem";
import { EmptyState, Screen, RoundedContainerGroup } from "~components/index";
type ListItem = any;

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

function RowItem({
  item,
  handlePress,
}: {
  item: ListItem;
  handlePress: (item: ListItem) => void;
}): JSX.Element {
  switch (item.type) {
    case "SWAP": {
      return (
        <ListItemTokenSwap
          grouped
          title="Token Swap"
          caption="USDC -> SOL"
          sent="-5.00 USDC"
          received="+0.2423 SOL"
        />
      );
    }
    case "TRANSFER": {
      return (
        <ListItemSentReceived
          address="5iM4...F5To"
          action="Sent"
          amount="4 USDC"
          iconUrl="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png"
        />
      );
    }
    case "UNKNOWN":
    default: {
      return (
        <ListItemActivity
          grouped={false}
          onPress={console.log}
          topLeftText="Mad Lads #452"
          bottomLeftText="Minted"
          topRightText="-24.50 SOL"
          bottomRightText="-$2,719.08"
          iconUrl="https://swr.xnfts.dev/1min/https://madlist-images.s3.us-west-2.amazonaws.com/backpack_dev.png"
        />
      );
    }
  }
}

const GET_RECENT_TRANSACTIONS = gql`
  query WalletTransactions($chainId: ChainID!, $address: String!) {
    wallet(chainId: $chainId, address: $address) {
      transactions {
        edges {
          node {
            id
            description
            block
            fee
            feePayer
            hash
            source
            type
            timestamp
          }
        }
      }
    }
  }
`;

function Container({ navigation }: any): JSX.Element {
  const activeWallet = useActiveWallet();
  const { data } = useSuspenseQuery_experimental(GET_RECENT_TRANSACTIONS, {
    variables: {
      // TODO add blockchain_uppercase so we don't have to keep adding this everywhere
      // alternatively make the graphql enum return lowercase if possible
      chainId: activeWallet.blockchain.toUpperCase(),
      address: activeWallet.publicKey,
    },
  });

  const handlePressItem = useCallback(
    (item: ListItem) => {
      navigation.push("ActivityDetail", {
        id: item.key,
        title: item.title,
      });
    },
    [navigation]
  );

  const rows = data;
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

export function RecentActivityScreen({ navigation }: any): JSX.Element {
  return (
    <ErrorBoundary fallbackRender={({ error }) => <Text>{error.message}</Text>}>
      <Suspense fallback={<ActivityIndicator size="large" />}>
        <Container navigation={navigation} />
      </Suspense>
    </ErrorBoundary>
  );
}
