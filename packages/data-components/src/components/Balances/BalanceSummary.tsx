import { Suspense, useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useActiveWallet } from "@coral-xyz/recoil";
import {
  BalanceSummaryCore,
  BalanceSummaryCoreLoader,
  type BalanceSummaryCoreProps,
  StyledText,
} from "@coral-xyz/tamagui";

import { gql } from "../../apollo";
import { usePolledSuspenseQuery } from "../../hooks";

const DEFAULT_POLLING_INTERVAL = 60000;

const GET_BALANCE_SUMMARY = gql(`
  query GetBalanceSummary($address: String!) {
    user {
      id
      wallet(address: $address) {
        id
        balances {
          id
          aggregate {
            id
            percentChange
            value
            valueChange
          }
        }
      }
    }
  }
`);

export type BalanceSummaryWidgetProps = {
  pollingInterval?: number;
  style?: BalanceSummaryCoreProps["style"];
};

export const BalanceSummaryWidget = (props: BalanceSummaryWidgetProps) => (
  <ErrorBoundary
    fallbackRender={(x) => <StyledText>{JSON.stringify(x.error)}</StyledText>} // FIXME:
  >
    <Suspense fallback={<BalanceSummaryCoreLoader />}>
      <_BalanceSummaryWidget {...props} />
    </Suspense>
  </ErrorBoundary>
);

function _BalanceSummaryWidget({
  pollingInterval,
  style,
}: BalanceSummaryWidgetProps) {
  const activeWallet = useActiveWallet();
  const { data } = usePolledSuspenseQuery(
    pollingInterval ?? DEFAULT_POLLING_INTERVAL,
    GET_BALANCE_SUMMARY,
    {
      variables: {
        address: activeWallet.publicKey,
      },
    }
  );

  const aggregate = useMemo(
    () =>
      data.user?.wallet?.balances?.aggregate ?? {
        percentChange: 0,
        value: 0,
        valueChange: 0,
      },
    [data.user]
  );

  return (
    <BalanceSummaryCore {...aggregate} style={{ marginTop: 24, ...style }} />
  );
}
