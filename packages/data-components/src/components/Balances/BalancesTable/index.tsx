import { type ReactNode, Suspense, useMemo } from "react";
import { useActiveWallet } from "@coral-xyz/recoil";

import { gql } from "../../../apollo";
import type { GetTokenBalancesQuery } from "../../../apollo/graphql";
import { usePolledSuspenseQuery } from "../../../hooks";

const DEFAULT_POLLING_INTERVAL = 30000;

const GET_TOKEN_BALANCES = gql(`
  query GetTokenBalances($address: String!) {
    user {
      id
      wallet(address: $address) {
        id
        balances {
          id
          tokens {
            edges {
              node {
                id
                displayAmount
                marketData {
                  id
                  value
                  valueChange
                }
                tokenListEntry {
                  id
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
  }
`);

export type ResponseTokenBalances = NonNullable<
  NonNullable<
    NonNullable<
      NonNullable<GetTokenBalancesQuery["user"]>["wallet"]
    >["balances"]
  >["tokens"]
>["edges"][number]["node"];

export type BalancesTableProps = {
  loaderComponent?: ReactNode;
  pollingInterval?: number;
};

export const BalancesTable = ({
  loaderComponent,
  ...rest
}: BalancesTableProps) => (
  <Suspense fallback={loaderComponent}>
    <_BalancesTable {...rest} />
  </Suspense>
);

function _BalancesTable({
  pollingInterval,
}: Omit<BalancesTableProps, "loaderComponent">) {
  const activeWallet = useActiveWallet();
  const { data } = usePolledSuspenseQuery(
    pollingInterval ?? DEFAULT_POLLING_INTERVAL,
    GET_TOKEN_BALANCES,
    {
      variables: {
        address: activeWallet.publicKey,
      },
    }
  );

  /**
   * Memoized value for the extracted list of token balance nodes from
   * the GraphQL query response object.
   */
  const balances: ResponseTokenBalances[] = useMemo(
    () => data.user?.wallet?.balances?.tokens?.edges.map((e) => e.node) ?? [],
    [data.user]
  );

  console.log(balances);

  return <div />; // TODO:
}
