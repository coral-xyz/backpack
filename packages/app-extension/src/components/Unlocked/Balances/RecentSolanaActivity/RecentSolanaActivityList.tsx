import { useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import { EmptyState, isFirstLastListItemStyle } from "@coral-xyz/react-common";
import {
  SOL_LOGO_URI,
  useActiveWallet,
  useRecentTransactions,
} from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { Bolt, CallMade, Check, Clear } from "@mui/icons-material";
import { List, ListItem, Typography } from "@mui/material";

import {
  getTransactionCaption,
  getTransactionTitle,
  isNFTTransaction,
} from "./detail-parser";
import { TransactionDetail } from "./TransactionDetail";

const useStyles = styles((theme) => ({
  recentActivityListItemIconContainer: {
    width: "44px",
    height: "44px",
    borderRadius: "22px",
    marginRight: "12px",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
  },
  recentActivityListItemIcon: {
    color: theme.custom.colors.positive,
    marginLeft: "auto",
    marginRight: "auto",
  },
  recentActivityListItemIconNegative: {
    color: theme.custom.colors.negative,
    marginLeft: "auto",
    marginRight: "auto",
  },
  title: {
    color: theme.custom.colors.fontColor,
    fontSize: "16px",
    fontWeight: 500,
    lineHeight: "24px",
  },
  caption: {
    color: theme.custom.colors.secondary,
    fontSize: "12px",
    fontWeight: 500,
    lineHeight: "24px",
  },
}));

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

  return transactions.length > 0 ? (
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
export function SolanaTransactionListItem({
  transaction,
  isFirst,
  isLast,
  setTransactionDetail,
}: any) {
  const classes = useStyles();
  const theme = useCustomTheme();
  const activeWallet = useActiveWallet();
  // const explorer = useBlockchainExplorer(transaction.blockchain);
  // const connectionUrl = useBlockchainConnectionUrl(transaction.blockchain);
  // const blockchainLogo = useBlockchainLogo(transaction.blockchain);
  const onClick = () => {
    setTransactionDetail(transaction);
    // use this later when adding link in transaction detail button
    // window.open(explorerUrl(explorer!, transaction.signature, connectionUrl!));
  };

  const isNFT = isNFTTransaction(transaction);

  return (
    <ListItem
      button
      disableRipple
      onClick={onClick}
      style={{
        paddingLeft: "12px",
        paddingRight: "12px",
        paddingTop: "10px",
        paddingBottom: "10px",
        display: "flex",
        height: "68px",
        backgroundColor: theme.custom.colors.nav,
        borderBottom: isLast
          ? undefined
          : `solid 1pt ${theme.custom.colors.border}`,
        ...isFirstLastListItemStyle(isFirst, isLast, 12),
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div style={{ flex: 1, display: "flex" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {isNFT ? (
              <img
                style={{
                  borderRadius: "4px",
                  width: "44px",
                  height: "44px",
                  marginRight: "5px",
                }}
                src={transaction?.metaData?.offChainData?.image}
              />
            ) : (
              <img
                style={{
                  borderRadius: "22px",
                  width: "44px",
                  height: "44px",
                  marginRight: "5px",
                }}
                src={SOL_LOGO_URI}
              />
            )}
          </div>
          <div>
            <Typography className={classes.title}>
              {getTransactionTitle(transaction)}
            </Typography>
            <Typography className={classes.caption}>
              {getTransactionCaption(transaction) || transaction.timestamp}
            </Typography>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <CallMade style={{ color: theme.custom.colors.icon }} />
        </div>
      </div>
    </ListItem>
  );
}

function RecentActivityListItemIcon({ transaction }: any) {
  const classes = useStyles();
  return (
    <div className={classes.recentActivityListItemIconContainer}>
      {transaction.didError ? (
        <Clear className={classes.recentActivityListItemIconNegative} />
      ) : (
        <Check className={classes.recentActivityListItemIcon} />
      )}
    </div>
  );
}

function NoRecentActivityLabel({ minimize }: { minimize: boolean }) {
  const theme = useCustomTheme();

  return (
    <div
      style={{
        height: "100%",
        display: minimize ? "none" : undefined,
      }}
    >
      <EmptyState
        icon={(props: any) => <Bolt {...props} />}
        title={"No Recent Activity"}
        subtitle={"Get started by adding your first xNFT"}
        onClick={() => window.open("https://xnft.gg")}
        buttonText={"Browse the xNFT Library"}
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
