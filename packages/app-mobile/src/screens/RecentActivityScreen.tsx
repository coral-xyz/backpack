import { Suspense, useCallback } from "react";
import { View, Text, ActivityIndicator, SectionList } from "react-native";

import * as Linking from "expo-linking";

import { gql, useSuspenseQuery_experimental } from "@apollo/client";
import { walletAddressDisplay } from "@coral-xyz/common";
import { useActiveWallet } from "@coral-xyz/recoil";
import { MaterialIcons } from "@expo/vector-icons";
import { ErrorBoundary } from "react-error-boundary";

import {
  SectionHeader,
  SectionSeparator,
  ListItemSentReceived,
  ListItemTokenSwap,
  // ListItemNotification,
  ListItemActivity,
  // ListItemFriendRequest,
} from "~components/ListItem";
import { EmptyState, Screen, RoundedContainerGroup } from "~components/index";
import { convertTransactionDataToSectionList } from "~lib/RecentActivityUtils";
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
  const formattedDescription = removeLastPeriod(item.description);
  switch (item.type) {
    case "SWAP": {
      const { sent, received, display } = parseSwap(formattedDescription);
      return (
        <ListItemTokenSwap
          grouped
          title="Token Swap"
          caption={display}
          sent={sent}
          received={received}
        />
      );
    }
    case "TRANSFER": {
      const { to, amount, action } = parseTransfer(formattedDescription);
      return (
        <ListItemSentReceived
          grouped
          address={to}
          action={action}
          amount={amount}
          iconUrl="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png"
        />
      );
    }
    case "NFT_LISTING": {
      const { nft, amount, marketplace } =
        parseNftListing(formattedDescription);
      return (
        <ListItemActivity
          grouped
          onPress={console.log}
          topLeftText={nft}
          bottomLeftText={`Listed on ${marketplace}`}
          bottomRightText={amount} // TODO amount in USD
          topRightText={amount}
          // nft image sold
          iconUrl="https://swr.xnfts.dev/1min/https://madlist-images.s3.us-west-2.amazonaws.com/backpack_dev.png"
        />
      );
    }
    case "NFT_SALE": {
      const { nft, amount, marketplace } = parseNftSold(formattedDescription);
      return (
        <ListItemActivity
          grouped
          onPress={console.log}
          topLeftText={nft}
          bottomLeftText={`Sold on ${marketplace}`}
          bottomRightText={amount} // TODO amount in USD
          topRightText={amount}
          // nft image sold
          iconUrl="https://swr.xnfts.dev/1min/https://madlist-images.s3.us-west-2.amazonaws.com/backpack_dev.png"
        />
      );
    }
    case "UNKNOWN":
    default: {
      return (
        <ListItemActivity
          grouped
          onPress={console.log}
          topLeftText="App Interaction"
          bottomLeftText={walletAddressDisplay(item.hash)}
          bottomRightText=""
          topRightText=""
          // green checkmark
          iconUrl="https://swr.xnfts.dev/1min/https://madlist-images.s3.us-west-2.amazonaws.com/backpack_dev.png"
        />
      );
    }
  }
}

const GET_RECENT_TRANSACTIONS = gql`
  query WalletTransactions($chainId: ChainID!, $address: String!) {
    wallet(chainId: $chainId, address: $address) {
      id
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
            image(width: 60, height: 60)
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
        id: item.id,
        title: item.title,
      });
    },
    [navigation]
  );

  const sections = convertTransactionDataToSectionList(
    data?.wallet?.transactions.edges
  );

  const keyExtractor = (item: ListItem) => item.id;
  const renderItem = useCallback(
    ({ item, section, index }: { item: ListItem }) => {
      const isFirst = index === 0;
      const isLast = index === section.data.length - 1;
      return (
        <RoundedContainerGroup
          disableTopRadius={!isFirst}
          disableBottomRadius={!isLast}
        >
          <RowItem item={item} handlePress={handlePressItem} />
        </RoundedContainerGroup>
      );
    },
    [handlePressItem]
  );

  const renderSectionHeader = useCallback(({ section }: any) => {
    return <SectionHeader title={section.title} />;
  }, []);

  return (
    <Screen>
      <SectionList
        sections={sections}
        ListEmptyComponent={NoNFTsEmptyState}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        SectionSeparatorComponent={SectionSeparator}
        stickySectionHeadersEnabled={false}
      />
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
