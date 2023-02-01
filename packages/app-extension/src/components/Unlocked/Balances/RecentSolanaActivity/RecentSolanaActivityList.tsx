import { Fragment, useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
<<<<<<< HEAD
import { useRecentTransactions } from "@coral-xyz/recoil";
=======
import {
  useActiveWallet,
  useRecentSolanaTransactions,
} from "@coral-xyz/recoil";
>>>>>>> bf8f909f (fix incorrect tokenData bug, refactor into function)
import { useCustomTheme } from "@coral-xyz/themes";
import { List } from "@mui/material";

import { formatTimestampListView, groupTxnsByDate } from "./detail-parser";
import { SolanaTransactionListItem } from "./ListItem";
import { NoRecentActivityLabel } from "./NoRecentActivity";
import { TransactionDetail } from "./TransactionDetail";
import type { HeliusParsedTransaction } from "./types";

export function _RecentSolanaActivityList({
  blockchain,
  address,
  contractAddresses,
  transactions: _transactions,
  style,
  minimize,
}: {
  blockchain?: Blockchain;
  address?: string;
  contractAddresses?: Array<string>;
  transactions?: Array<any>;
  style?: any;
  minimize?: boolean;
}) {
  const theme = useCustomTheme();
  const [transactionDetail, setTransactionDetail] = useState(null);
  // Load transactions if not passed in as a prop
  const transactions = _transactions
    ? _transactions
    : useRecentTransactions(blockchain!, address!, contractAddresses!);

  if (!style) {
    style = {};
  }

  if (transactionDetail) {
    return (
      <TransactionDetail
        transaction={transactionDetail}
        setTransactionDetail={setTransactionDetail}
      />
    );
  }
  const txnsGroupedByDate = groupTxnsByDate(transactions);

  return transactions?.length > 0 ? (
    <div
      style={{
        paddingBottom: "16px",
      }}
    >
      {txnsGroupedByDate.map((group: HeliusParsedTransaction[], i: number) => {
        return (
          <Fragment key={i}>
            <div
              style={{
                fontSize: "16px",
                color: theme.custom.colors.alpha,
                lineHeight: "24px",
                marginLeft: "28px",
                marginTop: "16px",
              }}
            >
              {formatTimestampListView(group[0].timestamp)}
            </div>
            <List
              style={{
                marginTop: "5px",
                paddingTop: 0,
                paddingBottom: 0,
                marginLeft: "16px",
                marginRight: "16px",
                borderRadius: "14px",
                border: `${theme.custom.colors.borderFull}`,
                ...style,
              }}
            >
              {group.map((tx: HeliusParsedTransaction, idx: number) => {
                return (
                  <SolanaTransactionListItem
                    key={idx}
                    transaction={tx}
                    isFirst={idx === 0}
                    isLast={idx === group.length - 1}
                    setTransactionDetail={setTransactionDetail}
                  />
                );
              })}
            </List>
          </Fragment>
        );
      })}
    </div>
  ) : (
    <NoRecentActivityLabel minimize={!!minimize} />
  );
}
