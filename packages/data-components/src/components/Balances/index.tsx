import { type ReactElement, type ReactNode, Suspense, useMemo } from "react";
import type { Blockchain } from "@coral-xyz/common";
import { hiddenTokenAddresses } from "@coral-xyz/recoil";
import { YStack } from "@coral-xyz/tamagui";
import { useRecoilValue } from "recoil";

import { gql } from "../../apollo";
import type { ProviderId } from "../../apollo/graphql";
import { usePolledSuspenseQuery } from "../../hooks";
import type { DataComponentScreenProps } from "../common";

import type { BalanceDetailsProps } from "./BalanceDetails";
import { BalancesTable } from "./BalancesTable";
import {
  BalanceSummary,
  BalanceSummaryLoader,
  type BalanceSummaryProps,
} from "./BalanceSummary";
import type { ResponseBalanceSummary, ResponseTokenBalance } from "./utils";

export type { ResponseBalanceSummary, ResponseTokenBalance };
export { BalanceDetails, type BalanceDetailsProps } from "./BalanceDetails";

const DEFAULT_POLLING_INTERVAL_SECONDS = 60;

export { GET_TRANSACTIONS_FOR_TOKEN } from "./BalanceDetails";
export const GET_TOKEN_BALANCES_QUERY = gql(`
  query GetTokenBalances($address: String!, $providerId: ProviderID!) {
    wallet(address: $address, providerId: $providerId) {
      id
      balances {
        id
        aggregate {
          id
          percentChange
          value
          valueChange
        }
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
    }
  }
`);

export type TokenBalancesProps = DataComponentScreenProps & {
  address: string;
  onItemClick?: (args: {
    id: string;
    balance: BalanceDetailsProps["balance"];
    displayAmount: string;
    symbol: string;
    token: string;
    tokenAccount: string;
  }) => void | Promise<void>;
  providerId: ProviderId;
  summaryStyle?: BalanceSummaryProps["style"];
  tableFooterComponent?: ReactElement;
  tableLoaderComponent: ReactNode;
  widgets?: ReactNode;
};

export const TokenBalances = ({
  tableLoaderComponent,
  ...rest
}: TokenBalancesProps) => (
  <Suspense
    fallback={
      <YStack
        alignItems="center"
        gap={30}
        marginHorizontal={16}
        marginVertical={20}
      >
        <BalanceSummaryLoader />
        {tableLoaderComponent}
      </YStack>
    }
  >
    <_TokenBalances {...rest} />
  </Suspense>
);

function _TokenBalances({
  address,
  fetchPolicy,
  onItemClick,
  pollingIntervalSeconds,
  providerId,
  summaryStyle,
  tableFooterComponent,
  widgets,
}: Omit<TokenBalancesProps, "tableLoaderComponent">) {
  const hidden = useRecoilValue(
    hiddenTokenAddresses(providerId.toLowerCase() as Blockchain)
  );

  const { data } = usePolledSuspenseQuery(
    pollingIntervalSeconds ?? DEFAULT_POLLING_INTERVAL_SECONDS,
    GET_TOKEN_BALANCES_QUERY,
    {
      fetchPolicy,
      errorPolicy: "all",
      variables: {
        address,
        providerId,
      },
    }
  );

  /**
   * Memoized value of the individual wallet token balances that
   * returned from the GraphQL query for the page. Also calculates the
   * monetary value and value change to be omitted from the total balance
   * aggregation based on the user's hidden token settings.
   */
  const { balances, omissions } = useMemo<{
    balances: ResponseTokenBalance[];
    omissions: { value: number; valueChange: number };
  }>(() => {
    let balances =
      data?.wallet?.balances?.tokens?.edges.map((e) => e.node) ?? [];

    const omissions = { value: 0, valueChange: 0 };
    if (hidden && hidden.length > 0) {
      balances = balances.filter((b) => {
        if (hidden.includes(b.token)) {
          omissions.value += b.marketData?.value ?? 0;
          omissions.valueChange += b.marketData?.valueChange ?? 0;
          return false;
        }
        return true;
      });
    }

    return { balances, omissions };
  }, [data, hidden]);

  /**
   * Memoized value of the inner balance summary aggregate
   * returned from the GraphQL query for the page.
   */
  const aggregate: ResponseBalanceSummary = useMemo(() => {
    const aggregate = data?.wallet?.balances?.aggregate
      ? { ...data.wallet.balances.aggregate }
      : {
          id: "",
          percentChange: 0,
          value: 0,
          valueChange: 0,
        };
    aggregate.value -= omissions.value;
    aggregate.valueChange -= omissions.valueChange;
    return aggregate;
  }, [data, omissions]);

  return (
    <YStack alignItems="center" gap={20} marginVertical={16}>
      <BalanceSummary style={summaryStyle} {...aggregate} />
      {widgets}
      <BalancesTable
        balances={balances}
        footerComponent={tableFooterComponent}
        onItemClick={onItemClick}
      />
    </YStack>
  );
}
