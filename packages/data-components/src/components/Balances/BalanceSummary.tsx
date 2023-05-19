import { Suspense, useMemo } from "react";
import { useSuspenseQuery_experimental } from "@apollo/client";
import { useActiveWallet } from "@coral-xyz/recoil";
import {
  BalanceSummary,
  BalanceSummaryLoader,
  type ViewStyleWithPseudos,
} from "@coral-xyz/tamagui";

import { gql } from "../../apollo";

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
  style?: ViewStyleWithPseudos;
};

export function BalanceSummaryWidget({ style }: BalanceSummaryWidgetProps) {
  return (
    <Suspense fallback={<BalanceSummaryLoader />}>
      <_BalanceSummaryWidget style={style} />
    </Suspense>
  );
}

function _BalanceSummaryWidget({ style }: BalanceSummaryWidgetProps) {
  const activeWallet = useActiveWallet();
  const { data } = useSuspenseQuery_experimental(GET_BALANCE_SUMMARY, {
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

  return <BalanceSummary {...aggregate} style={style} />;
}
