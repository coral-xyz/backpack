import { type ReactNode, useMemo } from "react";
import { useSuspenseQuery } from "@apollo/client";
import {
  formatUsd,
  toDisplayBalance,
  UNKNOWN_ICON_SRC,
} from "@coral-xyz/common";
import { useActiveWallet } from "@coral-xyz/recoil";
import {
  ArrowUpRightIcon,
  ListItemIconCore,
  QuestionIcon,
  StyledText,
  TableCore,
  type TableCoreProps,
  TableRowCore,
  XStack,
  YStack,
} from "@coral-xyz/tamagui";

import { gql } from "../../apollo";
import type {
  GetTransactionsForTokenQuery,
  ProviderId,
} from "../../apollo/graphql";
import {
  TransactionHistory,
  type TransactionHistoryProps,
} from "../TransactionHistory";
import { _TransactionListItemBasic } from "../TransactionHistory/TransactionListItem";

import { type BalanceSummaryProps, PercentChange } from "./BalanceSummary";
import { ErrorMessage } from "./ErrorMessage";

export const GET_TRANSACTIONS_FOR_TOKEN = gql(`
  query GetTransactionsForToken($address: String!, $providerId: ProviderID!) {
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
                marketId
                marketUrl
                percentChange
                price
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
    }
  }
`);

type _ResponseToken = NonNullable<
  NonNullable<GetTransactionsForTokenQuery["wallet"]>["balances"]
>["tokens"]["edges"][number]["node"];

export type BalanceDetailsProps = {
  loaderComponent?: ReactNode;
  onMarketLinkClick: (url: string) => void;
  onTransactionItemClick?: TransactionHistoryProps["onItemClick"];
  symbol: string;
  token: string;
  widgets?: ReactNode;
};

export function BalanceDetails({
  loaderComponent,
  onMarketLinkClick,
  onTransactionItemClick,
  token: tokenMint,
  widgets,
}: BalanceDetailsProps) {
  const activeWallet = useActiveWallet();
  const providerId = activeWallet.blockchain.toUpperCase() as ProviderId;
  const { data } = useSuspenseQuery(GET_TRANSACTIONS_FOR_TOKEN, {
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
    variables: {
      address: activeWallet.publicKey,
      transactionFilters: {
        token: tokenMint,
      },
      providerId,
    },
  });

  const token: _ResponseToken | undefined = useMemo(
    () =>
      data?.wallet?.balances?.tokens?.edges.find(
        (e) => e.node.token === tokenMint
      )?.node,
    [data?.wallet, tokenMint]
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
      <XStack justifyContent="center" marginTop={10}>
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
      {token.marketData && token.tokenListEntry ? (
        <TokenMarketInfoTable
          market={{
            id: token.marketData.marketId,
            link: token.marketData.marketUrl,
            price: token.marketData.price,
          }}
          name={token.tokenListEntry.name}
          onLinkClick={onMarketLinkClick}
          style={{ marginHorizontal: 16 }}
          symbol={token.tokenListEntry.symbol}
        />
      ) : null}
      <TransactionHistory
        address={activeWallet.publicKey}
        providerId={providerId}
        fetchPolicy="cache-and-network"
        limit={25}
        loaderComponent={loaderComponent}
        onItemClick={onTransactionItemClick}
        pollingIntervalSeconds="disabled"
        style={{ position: "relative" }}
        tokenMint={tokenMint}
      />
    </YStack>
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

type TokenMarketInfoTableProps = {
  market: {
    id: string;
    link: string;
    price: number;
  };
  name: string;
  onLinkClick: (url: string) => void;
  style?: TableCoreProps["style"];
  symbol: string;
};

export function TokenMarketInfoTable({
  market,
  name,
  onLinkClick,
  style,
  symbol,
}: TokenMarketInfoTableProps) {
  const tokenNameValue = useMemo(() => {
    return (
      <XStack ai="center" gap={4}>
        <StyledText color="$accentBlue" fontSize="$sm">
          {name} ({symbol})
        </StyledText>
        <ArrowUpRightIcon color="$accentBlue" size="$sm" />
      </XStack>
    );
  }, [market, name, symbol]);

  const priceValue = useMemo(() => {
    const formatted = market?.price ? formatUsd(market.price) : "-";
    return formatted === "$0.00" ? "< $0.01" : formatted;
  }, [market?.price]);

  return (
    <TableCore style={style}>
      <TableRowCore
        label="Token"
        value={tokenNameValue}
        onPress={market ? () => onLinkClick(market.link) : undefined}
      />
      <TableRowCore label="Price" value={priceValue} />
    </TableCore>
  );
}
