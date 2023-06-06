import { type ReactNode, Suspense, useCallback, useMemo } from "react";
import { SectionList, type SectionListRenderItem } from "react-native";
import { useActiveWallet } from "@coral-xyz/recoil";
import { RoundedContainerGroup } from "@coral-xyz/tamagui";

import { gql } from "../../../apollo";
import type { GetTokenBalancesQuery } from "../../../apollo/graphql";
import { usePolledSuspenseQuery } from "../../../hooks";

import { BalancesTableRow } from "./BalancesTableRow";

const DEFAULT_POLLING_INTERVAL = 60000;

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
                address
                displayAmount
                marketData {
                  id
                  percentChange
                  value       
                }
                token
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

export type ResponseTokenBalance = NonNullable<
  NonNullable<
    NonNullable<
      NonNullable<GetTokenBalancesQuery["user"]>["wallet"]
    >["balances"]
  >["tokens"]
>["edges"][number]["node"];

export type BalancesTableProps = {
  loaderComponent?: ReactNode;
  onItemClick?: (args: { tokenAccount: string; symbol: string }) => void;
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
  onItemClick,
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
  const balances: ResponseTokenBalance[] = useMemo(
    () => data.user?.wallet?.balances?.tokens?.edges.map((e) => e.node) ?? [],
    [data.user]
  );

  /**
   * Returns the child component key for an item.
   * @param {ResponseTokenBalance} item
   * @returns {string}
   */
  const keyExtractor = useCallback((item: ResponseTokenBalance) => item.id, []);

  /**
   * Returns a renderable component for an individual item in a list.
   * @param {{ item: ResponseTokenBalance, section: SectionListData<ResponseTokenBalance, { data: ResponseTokenBalance[] }>, index: number }} args
   * @returns {ReactElement}
   */
  const renderItem: SectionListRenderItem<
    ResponseTokenBalance,
    { data: ResponseTokenBalance[] }
  > = useCallback(
    ({ item, section, index }) => {
      const first = index === 0;
      const last = index === section.data.length - 1;
      return (
        <RoundedContainerGroup
          disableBottomRadius={!last}
          disableTopRadius={!first}
        >
          <BalancesTableRow balance={item} onClick={onItemClick} />
        </RoundedContainerGroup>
      );
    },
    [onItemClick]
  );

  return (
    <SectionList
      style={{ marginHorizontal: 16, marginBottom: 24 }}
      stickySectionHeadersEnabled={false}
      showsVerticalScrollIndicator={false}
      sections={[{ data: balances }]}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
    />
  );
}
