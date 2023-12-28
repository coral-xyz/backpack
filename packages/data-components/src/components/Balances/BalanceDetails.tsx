import { type ReactNode, Suspense, useCallback, useMemo } from "react";
import { SectionList, type SectionListRenderItem } from "react-native";
import { useSuspenseQuery } from "@apollo/client";
import {
  formatUsd,
  toDisplayBalance,
  UNKNOWN_ICON_SRC,
} from "@coral-xyz/common";
import {
  useActiveWallet,
  useBlockchainConnectionUrl,
  useBlockchainExplorer,
} from "@coral-xyz/recoil";
import { explorerUrl } from "@coral-xyz/secure-background/legacyCommon";
import {
  ListItemCore,
  ListItemIconCore,
  openUrl,
  QuestionIcon,
  RoundedContainerGroup,
  StyledText,
  XStack,
  YStack,
} from "@coral-xyz/tamagui";

import { gql } from "../../apollo";
import {
  type GetTransactionsForTokenQuery,
  ProviderId,
} from "../../apollo/graphql";
import { _TransactionListItemBasic } from "../TransactionHistory/TransactionListItem";
import { TransactionListItemIconDefault } from "../TransactionHistory/TransactionListItemIcon";

import { type BalanceSummaryProps, PercentChange } from "./BalanceSummary";
import { ErrorMessage } from "./ErrorMessage";
import type { ResponseBalanceSummary } from "./utils";

export const GET_TRANSACTIONS_FOR_TOKEN = gql(`
  query GetTransactionsForToken(
    $address: String!, 
    $providerId: ProviderID!, 
    $transactionFilters: TransactionFiltersInput!
  ) {
    wallet(address: $address, providerId: $providerId) {
      id
      provider {
        providerId
      }
      balances {
        tokens {
          edges {
            node {
              id
              address
              displayAmount
              marketData {
                id
                percentChange
                value
                valueChange
              }
              token
              tokenListEntry {
                id
                address
                logo
                name
                symbol
              }
            }
          }
        }
      }
      transactions(filters: $transactionFilters) {
        edges {
          node {
            id
            hash
            provider {
              id
              providerId
            }
            timestamp
          }
        }
      }
    }
  }
`);

type _ResponseTokenTransaction = NonNullable<
  NonNullable<GetTransactionsForTokenQuery["wallet"]>["transactions"]
>["edges"][number]["node"];

type _ResponseToken = NonNullable<
  NonNullable<GetTransactionsForTokenQuery["wallet"]>["balances"]
>["tokens"]["edges"][number]["node"];

export type BalanceDetailsProps = {
  amount: string;
  balance: Omit<ResponseBalanceSummary, "__typename" | "id">;
  emptyTransactionsComponent?: ReactNode;
  loaderComponent?: ReactNode;
  symbol: string;
  token: string;
  widgets?: ReactNode;
};

export function BalanceDetails({
  emptyTransactionsComponent,
  loaderComponent,
  token: tokenMint,
  widgets,
}: BalanceDetailsProps) {
  const activeWallet = useActiveWallet();
  const { data } = useSuspenseQuery(GET_TRANSACTIONS_FOR_TOKEN, {
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
    variables: {
      address: activeWallet.publicKey,
      transactionFilters: {
        token: tokenMint,
      },
      providerId: activeWallet.blockchain.toUpperCase() as ProviderId,
    },
  });

  const token: _ResponseToken | undefined = useMemo(
    () =>
      data?.wallet?.balances?.tokens?.edges.find(
        (e) => e.node.token === tokenMint
      )?.node,
    [data?.wallet, tokenMint]
  );

  const transactions: _ResponseTokenTransaction[] = useMemo(
    () => data?.wallet?.transactions?.edges.map((e) => e.node) ?? [],
    [data?.wallet]
  );

  if (!token) {
    return (
      <YStack padding="$4">
        <ErrorMessage
          icon={QuestionIcon}
          title="Unknown Token"
          body={`Token ${tokenMint} not found.`}
        />
      </YStack>
    );
  }

  return (
    <YStack gap={20}>
      <XStack justifyContent="center" marginTop={15}>
        <ListItemIconCore
          image={token.tokenListEntry?.logo ?? UNKNOWN_ICON_SRC}
          radius="$circular"
          size={75}
        />
      </XStack>
      <TokenBalanceSummary
        amount={token.displayAmount}
        symbol={token.tokenListEntry?.symbol ?? ""}
        percentChange={token.marketData?.percentChange ?? 0}
        value={token.marketData?.value ?? 0}
        valueChange={token.marketData?.valueChange ?? 0}
      />
      {widgets}
      <Suspense fallback={loaderComponent}>
        <TokenTransactionList
          emptyStateComponent={emptyTransactionsComponent}
          transactions={transactions}
          providerId={data?.wallet?.provider.providerId ?? ProviderId.Solana}
        />
      </Suspense>
    </YStack>
  );
}

type TokenTransactionListProps = {
  emptyStateComponent?: ReactNode;
  transactions: _ResponseTokenTransaction[];
  providerId: ProviderId;
};

function TokenTransactionList({
  emptyStateComponent,
  transactions,
  providerId,
}: TokenTransactionListProps) {
  const activeWallet = useActiveWallet();
  const connection = useBlockchainConnectionUrl(activeWallet.blockchain);
  const explorer = useBlockchainExplorer(activeWallet.blockchain);

  /**
   * Returns the child component key for an item.
   * @param {_ResponseTokenTransaction} item
   * @returns {string}
   */
  const keyExtractor = useCallback(
    (item: _ResponseTokenTransaction) => item.id,
    []
  );

  /**
   * Returns a renderable component for an individual item in a list.
   * @param {{ item: _ResponseTokenTransaction, section: SectionListData<_ResponseTokenTransaction, { data: _ResponseTokenTransaction[] }>, index: number }} args
   * @returns {ReactElement}
   */
  const renderItem: SectionListRenderItem<
    _ResponseTokenTransaction,
    { data: _ResponseTokenTransaction[] }
  > = useCallback(
    ({ item, section, index }) => {
      const first = index === 0;
      const last = index === section.data.length - 1;
      return (
        <RoundedContainerGroup
          disableBottomRadius={!last}
          disableTopRadius={!first}
        >
          <ListItemCore
            style={{
              backgroundColor: "$baseBackgroundL1",
              cursor: "pointer",
              hoverTheme: true,
            }}
            icon={
              <TransactionListItemIconDefault size={30} containerSize={44} />
            }
            onClick={() =>
              openUrl(explorerUrl(explorer, item.hash, connection))
            }
          >
            <_TransactionListItemBasic
              blockchain={providerId}
              transaction={{
                ...item,
                address: activeWallet.publicKey,
                type: "BASIC",
              }}
            />
          </ListItemCore>
        </RoundedContainerGroup>
      );
    },
    [activeWallet.publicKey, connection, transactions, explorer]
  );

  return transactions.length === 0 && emptyStateComponent ? (
    <YStack style={{ marginBottom: 16 }}>{emptyStateComponent}</YStack>
  ) : (
    <SectionList
      style={{ marginHorizontal: 16, marginBottom: 16 }}
      stickySectionHeadersEnabled={false}
      showsVerticalScrollIndicator={false}
      sections={[{ data: transactions }]}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
    />
  );
}

type TokenBalanceSummaryProps = BalanceSummaryProps & {
  amount: string;
  symbol: string;
};

function TokenBalanceSummary({
  amount,
  percentChange,
  style,
  value,
}: TokenBalanceSummaryProps) {
  return (
    <YStack alignItems="center" gap={2} justifyContent="center" {...style}>
      <XStack alignItems="center" gap={4}>
        <StyledText fontSize="$3xl" fontWeight="700">
          {toDisplayBalance(amount, 0, true, true)}
        </StyledText>
      </XStack>
      <XStack alignItems="center" gap={2}>
        <StyledText color="$baseTextMedEmphasis">{formatUsd(value)}</StyledText>
        <PercentChange removeBackground value={percentChange} />
      </XStack>
    </YStack>
  );
}
