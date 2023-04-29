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
import { YGroup } from "@coral-xyz/tamagui";
import { MaterialIcons } from "@expo/vector-icons";
import { Source, TransactionType } from "helius-sdk/dist/types";
import { ErrorBoundary } from "react-error-boundary";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  ListItemActivity,
  ListItemNotification,
  ListItemSentReceived,
  ListItemTokenSwap,
} from "~components/ListItem";
import { EmptyState, Screen, RoundedContainerGroup } from "~components/index";
import { getBlockchainLogo, useTheme } from "~hooks/index";
import { result__useRecentTransactionsGroupedByData } from "~hooks/recoil__FAKE_DATA";

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
  const sent = `-${input.amountWithSymbol}`;
  const received = `+${output.amountWithSymbol}`;

  return (
    <ListItemTokenSwap
      grouped
      title={transaction.title}
      caption={transaction.description}
      sent={sent}
      received={received}
    />
  );
}

function BurnTransaction({ transaction }) {
  const amount = transaction?.tokenTransfers[0]?.tokenAmount;

  return (
    <ListItemActivity
      grouped={false}
      onPress={console.log}
      topLeftText="App Interaction"
      bottomLeftText="Burned"
      topRightText={amount}
      bottomRightText=""
      iconUrl="https://swr.xnfts.dev/1min/https://madlist-images.s3.us-west-2.amazonaws.com/backpack_dev.png"
    />
  );

  // return (
  //   <Text style={styles.textSecondary}>
  //     {transaction?.tokenTransfers[0]?.tokenAmount}
  //   </Text>
  // );
}

function NFTTransaction() {
  return (
    <ListItemActivity
      grouped={false}
      onPress={console.log}
      topLeftText="Nokiamon"
      bottomLeftText="Minted"
      topRightText="-24.50SOL TODO"
      bottomRightText="+1 TODO"
      iconUrl="https://swr.xnfts.dev/1min/https://madlist-images.s3.us-west-2.amazonaws.com/backpack_dev.png"
    />
  );
}

function TransferTransaction({ transaction, tokenData, metadata }) {
  const activeWallet = useActiveWallet();

  const isSender = isUserTxnSender(transaction, activeWallet);
  const action = isSender ? "Sent" : "Received";

  if (transaction.source === Source.SYSTEM_PROGRAM) {
    const amount = transaction?.nativeTransfers[0]?.amount / 10 ** 9;
    const value = reverseScientificNotation(amount);

    // if (isSender) {
    //   return <Text style={styles.textSent}>-{value} SOL</Text>;
    // } else {
    //   return <Text style={styles.textReceived}>+{value} SOL</Text>;
    // }

    return (
      <ListItemSentReceived
        grouped
        address="abc xyz TODO"
        action={action}
        amount={value}
        iconUrl="https://swr.xnfts.dev/1min/https://madlist-images.s3.us-west-2.amazonaws.com/backpack_dev.png"
      />
    );
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

    // const symbol = "TODO";
    // console.log("debug3:else:symbol", amount);

    return (
      <ListItemSentReceived
        grouped
        address={transaction.signature}
        action={action}
        amount={amount}
        iconUrl="https://swr.xnfts.dev/1min/https://madlist-images.s3.us-west-2.amazonaws.com/backpack_dev.png"
      />
    );

    // if (isSender) {
    //   return (
    //     <Text style={styles.textSent}>
    //       -{amount} {symbol}
    //     </Text>
    //   );
    // } else {
    //   return (
    //     <Text style={styles.textReceived}>
    //       +{amount} {symbol}
    //     </Text>
    //   );
    // }
  }
}

// SWAP, BURN, BURN_NFT, NFT, TRANSFER, UNKNOWN, ERROR
// see helius types (follow isNFTTransaaction)

function RecentActivityItem({ transaction }) {
  const { tokenData, metadata } = useRecentTransactionData(transaction);
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

  if (transaction.type !== TransactionType.UNKNOWN) {
    console.log("debug3:rest", transaction.type, {
      transaction,
      tokenData,
      metadata,
    });
  }

  // Unknown type?
  return (
    <ListItemActivity
      grouped
      onPress={console.log}
      topLeftText={transaction.type}
      bottomLeftText="Minted"
      topRightText="-24.50 SOL"
      bottomRightText="-$2,719.08"
      iconUrl="https://swr.xnfts.dev/1min/https://madlist-images.s3.us-west-2.amazonaws.com/backpack_dev.png"
    />
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
  const sections = result__useRecentTransactionsGroupedByData;
  // const sections = useRecentTransactionsGroupedByDate({
  //   blockchain: blockchain!,
  //   address: address!,
  //   contractAddresses: contractAddresses!,
  //   transactions: _transactions,
  // });

  const renderItem = ({ item, section, index }: any) => {
    const isFirst = index === 0;
    const isLast = index === section.data.length - 1;

    return (
      <RoundedContainerGroup
        disableTopRadius={!isFirst}
        disableBottomRadius={!isLast}
      >
        <RecentActivityItem transaction={item} />
      </RoundedContainerGroup>
    );
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
