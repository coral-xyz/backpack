import { Suspense, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import * as Linking from "expo-linking";

import { EmptyState, Screen } from "@components";
import { Blockchain, explorerUrl } from "@coral-xyz/common";
import {
  useActiveWallet,
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

function RecentSolanaActivity({ address }: { address: string }): JSX.Element {
  const recentTransactions = useRecentSolanaTransactions({
    address,
  });

  const mergedTransactions = [...recentTransactions].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  return <_RecentActivityList transactions={mergedTransactions} />;
}

function RecentEthereumActivity({ address }: { address: string }): JSX.Element {
  const recentTransactions = useRecentEthereumTransactions({
    address,
  });

  const mergedTransactions = [...recentTransactions].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  return <_RecentActivityList transactions={mergedTransactions} />;
}

export function RecentActivity() {
  const activeWallet = useActiveWallet();

  return (
    <Suspense fallback={<RecentActivityLoading />}>
      {activeWallet.blockchain === Blockchain.SOLANA ? (
        <RecentSolanaActivity address={activeWallet.publicKey} />
      ) : (
        <RecentEthereumActivity address={activeWallet.publicKey} />
      )}
    </Suspense>
  );
}

export function RecentActivityList({
  blockchain,
  address,
  contractAddresses,
  transactions,
  minimize = false,
}: {
  blockchain?: Blockchain;
  address?: string;
  contractAddresses?: string[];
  transactions: any[];
  minimize?: boolean;
}) {
  return (
    <Suspense fallback={<RecentActivityLoading />}>
      <_RecentActivityList
        blockchain={blockchain}
        address={address}
        contractAddresses={contractAddresses}
        transactions={transactions}
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
  transactions,
  minimize,
}: {
  blockchain?: Blockchain;
  address?: string;
  contractAddresses?: string[];
  transactions: any[];
  minimize?: boolean;
}) {
  const styles = {
    flex: 1,
  };

  if (transactions.length === 0) {
    // @ts-ignore
    styles.justifyContent = "center";
    // @ts-ignore
    styles.alignItems = "center";
  }

  return (
    <FlatList
      contentContainerStyle={styles}
      data={transactions}
      ListEmptyComponent={<NoRecentActivityLabel minimize={!!minimize} />}
      scrollEnabled={transactions.length > 0}
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
