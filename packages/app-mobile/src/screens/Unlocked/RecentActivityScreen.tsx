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
  SectionList,
} from "react-native";

import * as Linking from "expo-linking";

import {
  reverseScientificNotation,
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
  useRecentTransactionData,
  useRecentTransactionsGroupedByDate,
  isNFTTransaction,
  isUserTxnSender,
  parseSwapTransaction,
} from "@coral-xyz/recoil";
import { ListItem2, YGroup } from "@coral-xyz/tamagui";
import { MaterialIcons } from "@expo/vector-icons";
import { Source, TransactionType } from "helius-sdk/dist/types";
import { ErrorBoundary } from "react-error-boundary";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState, Screen, StyledText } from "~components/index";
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
    <ErrorBoundary fallbackRender={({ error }) => <Text>{error.message}</Text>}>
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
    </ErrorBoundary>
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

function FailedTransaction() {
  return <Text style={styles.caption}>Failed</Text>;
}

function SwapTransaction({ transaction, tokenData }) {
  const [input, output] = parseSwapTransaction(transaction, tokenData);

  return (
    <>
      <Text style={styles.textReceived}>+{output.amountWithSymbol}</Text>
      <Text style={styles.textSecondary}>-{input.amountWithSymbol}</Text>
    </>
  );
}

function BurnTransaction({ transaction }) {
  return (
    <Text style={styles.textSecondary}>
      {transaction?.tokenTransfers[0]?.tokenAmount}
    </Text>
  );
}

function NFTTransaction() {
  return null;
}

function TransferTransaction({ transaction, tokenData, metadata }) {
  const activeWallet = useActiveWallet();

  const isSender = isUserTxnSender(transaction, activeWallet);

  if (transaction.source === Source.SYSTEM_PROGRAM) {
    const amount = transaction?.nativeTransfers[0]?.amount / 10 ** 9;
    const value = reverseScientificNotation(amount);

    if (isSender) {
      return <Text style={styles.textSent}>-{value} SOL</Text>;
    } else {
      return <Text style={styles.textReceived}>+{value} SOL</Text>;
    }
  } else {
    // const amount = new Number(
    //   transaction?.tokenTransfers?.[0]?.tokenAmount.toFixed(5)
    // );

    const amount = "0";
    console.log("debug3:else:amount", amount);
    // const symbol =
    //   tokenData[0]?.symbol ||
    //   metadata?.onChainMetadata?.metadata?.data?.symbol ||
    //   "";

    const symbol = "TODO";
    console.log("debug3:else:symbol", amount);

    if (isSender) {
      return (
        <Text style={styles.textSent}>
          -{amount} {symbol}
        </Text>
      );
    } else {
      return (
        <Text style={styles.textReceived}>
          +{amount} {symbol}
        </Text>
      );
    }
  }
}

function RecentActivityListItemData({ transaction, tokenData, metadata }) {
  if (transaction?.transactionError) {
    return <FailedTransaction />;
  }

  if (transaction.type === TransactionType.SWAP) {
    return <SwapTransaction transaction={transaction} tokenData={tokenData} />;
  }

  if (
    transaction?.type === TransactionType.BURN ||
    transaction?.type === TransactionType.BURN_NFT
  ) {
    return <BurnTransaction transaction={transaction} />;
  }

  if (isNFTTransaction(transaction)) {
    return <NFTTransaction />;
  }

  if (transaction.type === TransactionType.TRANSFER) {
    return (
      <TransferTransaction
        transaction={transaction}
        tokenData={tokenData}
        metadata={metadata}
      />
    );
  }

  return null;
}

function ActivityItem({ transaction }) {
  const t = useRecentTransactionData(transaction);

  return (
    <ListItem2 multiLine title={t.description} subTitle={t.type}>
      <StyledText>{t.title}</StyledText>
      <StyledText>{t.caption}</StyledText>
      <RecentActivityListItemData
        transaction={transaction}
        tokenData={t.tokenData}
        metadata={t.metadata}
      />
    </ListItem2>
  );
}

export function _RecentActivityList({
  blockchain,
  address,
  contractAddresses,
  transactions: _transactions,
}: {
  blockchain?: Blockchain;
  address?: string;
  contractAddresses?: string[] | undefined;
  transactions?: RecentTransaction[];
  minimize?: boolean;
  style?: StyleProp<ViewStyle>;
}): JSX.Element {
  const sections = useRecentTransactionsGroupedByDate({
    blockchain: blockchain!,
    address: address!,
    contractAddresses: contractAddresses!,
    transactions: _transactions,
  });

  const renderItem = ({ item, section }: { item: HeliusParsedTransaction }) => {
    if (section.data.length > 1) {
      return (
        <YGroup>
          <YGroup.Item>
            <ActivityItem transaction={item} numItems={section.data.length} />
          </YGroup.Item>
        </YGroup>
      );
    }
    return <ActivityItem transaction={item} numItems={section.data.length} />;
  };

  return (
    <SectionList
      stickySectionHeadersEnabled={false}
      sections={sections}
      keyExtractor={(item) => item.signature}
      renderItem={renderItem}
      renderSectionHeader={({ section }) => <Text>{section.title}</Text>}
      ListEmptyComponent={<NoRecentActivityEmptyState />}
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
  caption: {
    color: "gray",
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 24,
    whiteSpace: "nowrap",
    overflow: "hidden",
  },
  textReceived: {
    fontSize: 16,
    color: "green",
    lineHeight: 24,
    textAlign: "right",
  },
  textSent: {
    fontSize: 16,
    color: "red",
    lineHeight: 24,
    textAlign: "right",
  },
  textSecondary: {
    fontSize: 16,
    color: "red",
    lineHeight: 24,
    textAlign: "right",
  },
  lineDataWrapper: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
});
