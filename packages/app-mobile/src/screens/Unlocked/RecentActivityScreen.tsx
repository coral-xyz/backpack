import type { Blockchain } from "@coral-xyz/common";

import { Suspense, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Linking } from "expo-linking";

import { EmptyState, Screen } from "@components";
import { explorerUrl } from "@coral-xyz/common";
import {
  useActiveEthereumWallet,
  useActiveSolanaWallet,
  useBlockchainConnectionUrl,
  useBlockchainExplorer,
  useRecentEthereumTransactions,
  useRecentSolanaTransactions,
  useRecentTransactions,
} from "@coral-xyz/recoil";
import { MaterialIcons } from "@expo/vector-icons";
import { useBlockchainLogo, useTheme } from "@hooks";



export function RecentActivityScreen() {
  return (
    <Screen>
      <RecentActivity />
    </Screen>
  );
}

export function RecentActivity() {
  const activeEthereumWallet = useActiveEthereumWallet();
  const activeSolanaWallet = useActiveSolanaWallet();

  const recentEthereumTransactions = activeEthereumWallet
    ? useRecentEthereumTransactions({
        address: activeEthereumWallet.publicKey,
      })
    : [];
  const recentSolanaTransactions = activeSolanaWallet
    ? useRecentSolanaTransactions({
        address: activeSolanaWallet.publicKey,
      })
    : [];

  const mergedTransactions = [
    ...recentEthereumTransactions,
    ...recentSolanaTransactions,
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <Suspense fallback={<RecentActivityLoading />}>
      <_RecentActivityList transactions={mergedTransactions} />
    </Suspense>
  );
}

export function RecentActivityList({
  blockchain,
  address,
  contractAddresses,
  transactions,
  style,
  minimize = false,
}: {
  blockchain?: Blockchain;
  address?: string;
  contractAddresses?: string[];
  transactions?: any[];
  style?: any;
  minimize?: boolean;
}) {
  return (
    <Suspense fallback={<RecentActivityLoading />}>
      <_RecentActivityList
        blockchain={blockchain}
        address={address}
        contractAddresses={contractAddresses}
        transactions={transactions}
        style={style}
        minimize={minimize}
      />
    </Suspense>
  );
}

function RecentActivityLoading() {
  return (
    <View
      style={{
        height: 68,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Loading...</Text>
    </View>
  );
}

export function _RecentActivityList({
  blockchain,
  address,
  contractAddresses,
  transactions: _transactions,
  style,
  minimize,
}: {
  blockchain?: Blockchain;
  address?: string;
  contractAddresses?: string[];
  transactions?: any[];
  style?: any;
  minimize?: boolean;
}) {
  // const theme = useTheme();
  // Load transactions if not passed in as a prop
  const transactions = _transactions
    ? _transactions
    : useRecentTransactions(blockchain!, address!, contractAddresses!);

  if (!style) {
    style = {};
  }

  return (
    <FlatList
      contentContainerStyle={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
      data={transactions}
      ListEmptyComponent={<NoRecentActivityLabel minimize={!!minimize} />}
      renderItem={({ item }) => {
        return <RecentActivityListItem transaction={item} />;
      }}
    />
  );
}

function RecentActivityListItem({ transaction, isFirst, isLast }: any) {
  const theme = useTheme();
  const explorer = useBlockchainExplorer(transaction.blockchain);
  const connectionUrl = useBlockchainConnectionUrl(transaction.blockchain);
  const blockchainLogo = useBlockchainLogo(transaction.blockchain);

  const onPress = () => {
    Linking.openURL(
      explorerUrl(explorer!, transaction.signature, connectionUrl!)
    );
  };

  return (
    <Pressable
      onPress={() => onPress()}
      style={{
        height: 68,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: theme.custom.colors.nav,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        // borderBottom: isLast
        //   ? undefined
        //   : `solid 1pt ${theme.custom.colors.border}`,
        // ...isFirstLastListItemStyle(isFirst, isLast, 12),
      }}
    >
      <View style={{ flexDirection: "row" }}>
        <RecentActivityListItemIcon transaction={transaction} />
        <View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image
              style={{
                width: 12,
                borderRadius: 2,
                marginRight: 10,
              }}
              source={blockchainLogo}
            />
            <Text
              style={{
                color: theme.custom.colors.fontColor,
                fontSize: 16,
                fontWeight: "500",
                lineHeight: 24,
              }}
            >
              {transaction.signature.slice(0, 4)}...
              {transaction.signature.slice(transaction.signature.length - 5)}
            </Text>
          </View>
          <Text
            style={{
              color: theme.custom.colors.secondary,
              fontSize: 12,
              fontWeight: "500",
              lineHeight: 24,
            }}
          >
            {transaction.date.toString()}
          </Text>
        </View>
      </View>
      <MaterialIcons
        name="call-made"
        size={24}
        color={theme.custom.colors.icon}
      />
    </Pressable>
  );
}

function RecentActivityListItemIcon({ transaction }: any) {
  const theme = useTheme();
  return (
    <View style={styles.recentActivityListItemIconContainer}>
      {transaction.didError ? (
        <MaterialIcons
          name="clear"
          color={theme.custom.colors.negative}
          size={24}
        />
      ) : (
        <MaterialIcons
          name="check"
          color={theme.custom.colors.positive}
          size={24}
        />
      )}
    </View>
  );
}

function NoRecentActivityLabel({ minimize }: { minimize: boolean }) {
  const theme = useTheme();
  return (
    <View
      style={{
        display: minimize ? "none" : undefined,
      }}
    >
      <EmptyState
        minimize={minimize}
        icon={(props: any) => <MaterialIcons name="bolt" {...props} />}
        title="No Recent Activity"
        subtitle="Get started by adding your first xNFT"
        buttonText="Browse the xNFT Library"
        onPress={() => Linking.openURL("https://xnft.gg")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  recentActivityListItemIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    justifyContent: "center",
  },
});
