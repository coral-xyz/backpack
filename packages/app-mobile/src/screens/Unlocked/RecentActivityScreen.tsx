import { Suspense } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import * as Linking from "expo-linking";

import {
  Blockchain,
  explorerUrl,
  RecentTransaction,
  XNFT_GG_LINK,
} from "@coral-xyz/common";
import {
  useActiveWallet,
  useBlockchainConnectionUrl,
  useBlockchainExplorer,
  useRecentEthereumTransactions,
  useRecentSolanaTransactions,
  useRecentTransactions,
} from "@coral-xyz/recoil";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState, Screen } from "~components/index";
import { getBlockchainLogo, useTheme } from "~hooks/index";

export function RecentActivityScreen() {
  const insets = useSafeAreaInsets();
  return (
    <Screen style={{ marginBottom: insets.bottom }}>
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

function RecentActivity() {
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
  style,
}: {
  blockchain: Blockchain;
  address: string;
  contractAddresses: string[] | undefined;
  transactions?: RecentTransaction[];
  minimize?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Suspense fallback={<RecentActivityLoading />}>
      <_RecentActivityList
        blockchain={blockchain}
        address={address}
        contractAddresses={contractAddresses}
        transactions={transactions}
        minimize={minimize}
        style={style}
      />
    </Suspense>
  );
}

function RecentActivityLoading() {
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

export function _RecentActivityList({
  blockchain,
  address,
  contractAddresses,
  transactions: _transactions,
  minimize,
  style,
}: {
  blockchain?: Blockchain;
  address?: string;
  contractAddresses?: string[] | undefined;
  transactions?: RecentTransaction[];
  minimize?: boolean;
  style?: StyleProp<ViewStyle>;
}): JSX.Element {
  const transactions = useRecentTransactions({
    blockchain: blockchain!,
    address: address!,
    contractAddresses: contractAddresses!,
    transactions: _transactions,
  });

  const theme = useTheme();
  const styles = {
    flexGrow: 1,
  };

  if (transactions.length === 0) {
    // @ts-expect-error
    styles.justifyContent = "center";
    // @ts-expect-error
    styles.alignItems = "center";
  }

  return (
    <FlatList
      style={[
        {
          flex: 1,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: theme.custom.colors.borderFull,
        },
        style,
      ]}
      contentContainerStyle={styles}
      data={transactions}
      ListEmptyComponent={<NoRecentActivityEmptyState minimize={!!minimize} />}
      scrollEnabled={transactions.length > 0}
      renderItem={({ item }) => {
        return <RecentActivityListItem transaction={item} />;
      }}
    />
  );
}

function RecentActivityListItem({
  transaction,
}: {
  transaction: RecentTransaction;
}): JSX.Element {
  const theme = useTheme();
  const blockchainLogo = getBlockchainLogo(transaction.blockchain);
  const connectionUrl = useBlockchainConnectionUrl(transaction.blockchain);
  const explorer = useBlockchainExplorer(transaction.blockchain);

  return (
    <Pressable
      onPress={() => {
        Linking.openURL(
          explorerUrl(explorer!, transaction.signature, connectionUrl!)
        );
      }}
      style={{
        height: 68,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: theme.custom.colors.nav,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <View style={{ flexDirection: "row" }}>
        <RecentActivityListItemIcon transaction={transaction} />
        <View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image
              source={blockchainLogo}
              style={{
                aspectRatio: 1,
                width: 12,
                marginRight: 8,
              }}
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
            {transaction.date.toLocaleDateString()}
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

function RecentActivityListItemIcon({
  transaction,
}: {
  transaction: RecentTransaction;
}): JSX.Element {
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

function NoRecentActivityEmptyState({
  minimize,
}: {
  minimize: boolean;
}): JSX.Element {
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
        onPress={() => {
          Linking.openURL(XNFT_GG_LINK);
        }}
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
