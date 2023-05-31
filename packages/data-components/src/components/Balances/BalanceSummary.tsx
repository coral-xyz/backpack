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
  style?: BalanceSummaryCoreProps["style"];
};

export const BalanceSummaryWidget = ({ style }: BalanceSummaryWidgetProps) => (
  <ErrorBoundary
    fallbackRender={(x) => <StyledText>{JSON.stringify(x.error)}</StyledText>} // FIXME:
  >
    <Suspense fallback={<BalanceSummaryCoreLoader />}>
      <_BalanceSummaryWidget style={style} />
    </Suspense>
  </ErrorBoundary>
);

function _BalanceSummaryWidget({ style }: BalanceSummaryWidgetProps) {
  const activeWallet = useActiveWallet();
  const { data } = usePolledSuspenseQuery(20000, GET_BALANCE_SUMMARY, {
    variables: {
      address: activeWallet.publicKey,
    },
  });

  const aggregate = useMemo(
    () =>
      data.user?.wallet?.balances?.aggregate ?? {
        percentChange: 0,
        value: 0,
        valueChange: 0,
      },
    [data.user]
  );

  return <BalanceSummaryCore {...aggregate} style={style} />;
}
