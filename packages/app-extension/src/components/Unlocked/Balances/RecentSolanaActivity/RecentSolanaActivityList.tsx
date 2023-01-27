import { useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import { useRecentTransactions } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { List } from "@mui/material";

import { SolanaTransactionListItem } from "./ListItem";
import { NoRecentActivityLabel } from "./NoRecentActivity";
import { TransactionDetail } from "./TransactionDetail";

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

  return transactions?.length > 0 ? (
    <div
      style={{
        paddingBottom: "16px",
      }}
    >
      <List
        style={{
          marginTop: "16px",
          paddingTop: 0,
          paddingBottom: 0,
          marginLeft: "16px",
          marginRight: "16px",
          borderRadius: "14px",
          border: `${theme.custom.colors.borderFull}`,
          ...style,
        }}
      >
        {transactions.map((tx: any, idx: number) => (
          <SolanaTransactionListItem
            key={idx}
            transaction={tx}
            isFirst={idx === 0}
            isLast={idx === transactions.length - 1}
            setTransactionDetail={setTransactionDetail}
          />
        ))}
      </List>
    </div>
  ) : (
    <NoRecentActivityLabel minimize={!!minimize} />
  );
}
