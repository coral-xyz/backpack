import { useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import { BubbleTopLabel } from "@coral-xyz/react-common";
import { useRecentTransactions } from "@coral-xyz/recoil";
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
  const [metadata, setMetadata] = useState(null);

  // Load transactions if not passed in as a prop
  const transactions = _transactions
    ? _transactions
    : useRecentTransactions({
        blockchain: blockchain!,
        address: address!,
        contractAddresses: contractAddresses!,
      });

  if (transactionDetail) {
    return (
      <TransactionDetail
        metadata={metadata}
        transaction={transactionDetail}
        setMetadata={setMetadata}
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
          <div
            key={i}
            style={{
              marginLeft: "16px",
              marginTop: "16px",
              marginRight: "16px",
            }}
          >
            <BubbleTopLabel
              text={formatTimestampListView(group[0].timestamp)}
            />
            <List
              style={{
                marginTop: "5px",
                paddingTop: 0,
                paddingBottom: 0,
                borderRadius: "14px",
                border: `${theme.custom.colors.borderFull}`,
                ...style,
              }}
            >
              {group.map((tx: HeliusParsedTransaction, idx: number) => (
                <SolanaTransactionListItem
                  key={idx}
                  transaction={tx}
                  isFirst={idx === 0}
                  isLast={idx === group.length - 1}
                  setMetadata={setMetadata}
                  setTransactionDetail={setTransactionDetail}
                />
              ))}
            </List>
          </div>
        );
      })}
    </div>
  ) : (
    <NoRecentActivityLabel minimize={!!minimize} />
  );
}
