import { type CSSProperties, useMemo } from "react";
import { useSuspenseQuery_experimental } from "@apollo/client";
import { XNFT_GG_LINK } from "@coral-xyz/common";
import { EmptyState } from "@coral-xyz/react-common";
import { useActiveWallet } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";
import List from "@mui/material/List";

import { gql } from "../../../graphql";
import { ChainId } from "../../../graphql/graphql";

import { TransactionListItem } from "./TransactionListItem";

const GET_TRANSACTIONS = gql(`
  query GetTransactions($address: String!, $filters: TransactionFiltersInput) {
    user {
      id
      wallet(address: $address) {
        id
        chainId
        transactions(filters: $filters) {
          edges {
            node {
              id
              description
              error
              hash
              source
              timestamp
              type
            }
          }
        }
      }
    }
  }
`);

export function TransactionList({
  contractOrMint,
  minimize,
  style,
}: {
  contractOrMint?: string;
  minimize?: boolean;
  style?: CSSProperties;
}) {
  const theme = useCustomTheme();
  const activeWallet = useActiveWallet();

  const { data } = useSuspenseQuery_experimental(GET_TRANSACTIONS, {
    variables: {
      address: activeWallet.publicKey,
      filters: {
        token: contractOrMint,
      },
    },
  });

  const wallet = useMemo(() => data.user?.wallet, [data.user]);
  const transactions = useMemo(
    () => wallet?.transactions?.edges.map((e) => e.node) ?? [],
    [wallet]
  );

  return transactions.length > 0 ? (
    <div style={{ paddingBottom: "16px" }}>
      <List
        style={{
          border: theme.custom.colors.borderFull,
          borderRadius: "14px",
          marginTop: "16px",
          marginLeft: "16px",
          marginRight: "16px",
          paddingTop: 0,
          paddingBottom: 0,
          ...style,
        }}
      >
        {transactions.map((tx, idx) => (
          <TransactionListItem
            key={tx.id}
            blockchain={wallet?.chainId ?? ChainId.Solana}
            transaction={tx}
            isFirst={idx === 0}
            isLast={idx === transactions.length - 1}
          />
        ))}
      </List>
    </div>
  ) : (
    <NoTransactionsLabel minimize={minimize} />
  );
}

function NoTransactionsLabel({ minimize }: { minimize?: boolean }) {
  const theme = useCustomTheme();
  return (
    <div
      style={{
        height: "100%",
        display: minimize ? "none" : undefined,
      }}
    >
      <EmptyState
        icon={(props: any) => <FormatListBulletedRoundedIcon {...props} />}
        title="No Recent Activity"
        subtitle="Your transactions and app activity will show up here when you start using Backpack!"
        onClick={() => window.open(XNFT_GG_LINK)}
        contentStyle={{
          color: minimize ? theme.custom.colors.secondary : "inherit",
        }}
        innerStyle={{
          marginBottom: minimize !== true ? "64px" : 0, // Tab height offset.
        }}
        minimize={minimize}
      />
    </div>
  );
}
