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

// Used since Solana transactions have a timestamp and Ethereum transactions have a date.
const extractTime = (tx: any) => {
  if (tx?.timestamp) {
    return tx.timestamp;
  } else if (tx?.date) {
    return tx.date.getTime();
  }

  return 0;
};

const formatTransactions = (transactions: RecentTransaction[]) => {
  return [...transactions].sort((a, b) =>
    extractTime(a) > extractTime(b) ? -1 : 1
  );
};

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

  const transactions = formatTransactions(recentTransactions);
  return <_RecentActivityList transactions={transactions} />;
}

function RecentEthereumActivity({ address }: { address: string }): JSX.Element {
  const recentTransactions = useRecentEthereumTransactions({
    address,
  });

  const transactions = formatTransactions(recentTransactions);
  return <_RecentActivityList transactions={transactions} />;
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
          backgroundColor: theme.custom.colors.nav,
        },
        style,
      ]}
      contentContainerStyle={styles}
      data={transactions}
      ListEmptyComponent={<NoRecentActivityEmptyState />}
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
            {
              // TODO: Standardize the parsed ethereum and solana transactions
              //       so that `transaction.date` can be used for both of them
              (
                (transaction.date
                  ? // ethereum transactions provide a date
                    transaction.date
                  : // solana transactions provide a timestamp in seconds
                    new Date(transaction.timestamp * 1000)) as Date
              ).toLocaleString()
            }
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
  title,
  subtitle,
  buttonText,
}: {
  title?: string;
  subtitle?: string;
  buttonText?: string;
}): JSX.Element {
  return (
    <EmptyState
      icon={(props: any) => <MaterialIcons name="bolt" {...props} />}
      title={title || "No Recent Activity"}
      subtitle={subtitle || "Get started by adding your first xNFT"}
      buttonText={buttonText || "Browse the xNFT Library"}
      onPress={() => {
        Linking.openURL(XNFT_GG_LINK);
      }}
    />
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
