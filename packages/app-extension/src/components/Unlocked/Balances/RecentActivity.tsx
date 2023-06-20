import { Suspense } from "react";
import { Blockchain, explorerUrl } from "@coral-xyz/common";
import { isFirstLastListItemStyle, Loading } from "@coral-xyz/react-common";
import {
  getBlockchainLogo,
  useActiveWallet,
  useBlockchainConnectionUrl,
  useBlockchainExplorer,
  useRecentEthereumTransactions,
  useRecentSolanaTransactions,
  useRecentTransactions,
} from "@coral-xyz/recoil";
import { styles as makeStyles, useCustomTheme } from "@coral-xyz/themes";
import { CallMade } from "@mui/icons-material";
import { List, ListItem, Typography } from "@mui/material";

import { _RecentSolanaActivityList } from "./RecentSolanaActivity/RecentSolanaActivityList";

const useStyles = makeStyles((theme) => ({
  txSig: {
    color: theme.custom.colors.fontColor,
    fontSize: "16px",
    fontWeight: 500,
    lineHeight: "24px",
  },
  txDate: {
    color: theme.custom.colors.secondary,
    fontSize: "12px",
    fontWeight: 500,
    lineHeight: "24px",
  },
}));

export function RecentActivity() {
  const { blockchain, publicKey } = useActiveWallet();
  const opts =
    blockchain === Blockchain.SOLANA
      ? {
          component: _RecentSolanaActivityList,
          hook: useRecentSolanaTransactions,
        }
      : {
          component: _RecentActivityList,
          hook: useRecentEthereumTransactions,
        };
  return <RecentTransactions address={publicKey} {...opts} />;
}

function RecentTransactions({
  address,
  component: BlockchainActivityList,
  hook: useBlockchainTransactions,
}: {
  address: ReturnType<typeof useActiveWallet>["publicKey"];
  component: any;
  hook:
    | typeof useRecentSolanaTransactions
    | typeof useRecentEthereumTransactions;
}) {
  const recentTransactions = useBlockchainTransactions({ address }) ?? [];

  // Used since Solana transactions have a timestamp and Ethereum transactions have a date.
  const extractTime = (tx: any) => tx?.timestamp || tx?.date?.getTime() || 0;

  const sortedTransactions = [...recentTransactions].sort((a, b) =>
    extractTime(a) > extractTime(b) ? -1 : 1
  );

  return <BlockchainActivityList transactions={sortedTransactions} />;
}

export function RecentActivityList({
  blockchain,
  address,
  contractAddresses,
  transactions,
  style,
  minimize = false,
}: {
  blockchain?: Blockchain;
  address?: string;
  contractAddresses?: Array<string>;
  transactions?: Array<any>;
  style?: any;
  minimize?: boolean;
}) {
  return (
    <_RecentActivityList
      blockchain={blockchain}
      address={address}
      contractAddresses={contractAddresses}
      transactions={transactions}
      style={style}
      minimize={minimize}
    />
  );
}

export function RecentActivityLoading() {
  return (
    <div
      style={{
        height: "68px",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "block",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <Loading iconStyle={{ width: "35px", height: "35px" }} />
      </div>
    </div>
  );
}

function _RecentActivityList({
  blockchain,
  address,
  contractAddresses,
  transactions: _transactions,
  style,
}: {
  blockchain?: Blockchain;
  address?: string;
  contractAddresses?: Array<string>;
  transactions?: Array<any>;
  style?: any;
  minimize?: boolean;
}) {
  const theme = useCustomTheme();
  const transactions = useRecentTransactions({
    blockchain: blockchain!,
    address: address!,
    contractAddresses: contractAddresses!,
    transactions: _transactions,
  });

  if (!style) {
    style = {};
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
          <RecentActivityListItem
            // eslint-disable-next-line react/no-array-index-key
            key={idx}
            transaction={tx}
            isFirst={idx === 0}
            isLast={idx === transactions.length - 1}
          />
        ))}
      </List>
    </div>
  ) : null;
}

function RecentActivityListItem({ transaction, isFirst, isLast }: any) {
  const classes = useStyles();
  const theme = useCustomTheme();
  const explorer = useBlockchainExplorer(transaction.blockchain);
  const connectionUrl = useBlockchainConnectionUrl(transaction.blockchain);
  const blockchainLogo = getBlockchainLogo(transaction.blockchain);
  const onClick = () => {
    window.open(explorerUrl(explorer!, transaction.signature, connectionUrl!));
  };
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
            {/* <RecentActivityListItemIcon transaction={transaction} /> */}
            {null}
          </div>
          <div>
            <Typography className={classes.txSig}>
              <img
                style={{
                  width: "12px",
                  borderRadius: "2px",
                  marginRight: "10px",
                }}
                src={blockchainLogo}
              />
              {transaction.signature.slice(0, 4)}...
              {transaction.signature.slice(transaction.signature.length - 5)}
            </Typography>
            <Typography className={classes.txDate}>
              {
                // TODO: Standardize the parsed ethereum and solana transactions
                //       so that `transaction.date` can be used for both of them
                (
                  (transaction.date
                    ? // ethereum transactions provide a date
                      transaction.date
                    : // solana transactions provide a timestamp in seconds
                      new Date(transaction.timestamp * 1000)) as Date
                ).toLocaleString()
              }
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
