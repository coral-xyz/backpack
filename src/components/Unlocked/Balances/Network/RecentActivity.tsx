import { Suspense } from "react";
import { makeStyles, Typography, List, ListItem } from "@material-ui/core";
import { Check, Clear } from "@material-ui/icons";
import { explorerUrl } from "../../../../common/explorer";
import { useSolanaWallet } from "../../../../context/Wallet";
import { useRecentTransactions } from "../../../../hooks/useRecentTransactions";
import { UnlockedLoading } from "../../../Unlocked";

const useStyles = makeStyles((theme: any) => ({
  recentActivityLabel: {
    color: theme.custom.colors.fontColor,
    fontWeight: 500,
    fontSize: "14px",
    lineHeight: "24px",
  },
  allWalletsLabel: {
    fontWeight: 500,
    fontSize: "12px",
    color: theme.custom.colors.secondary,
  },
  noRecentActivityLabel: {
    fontWeight: 500,
    fontSize: "14px",
    color: theme.custom.colors.fontColor,
  },
  listItem: {
    backgroundColor: theme.custom.colors.nav,
    paddingLeft: "12px",
    paddingRight: "12px",
    paddingTop: "10px",
    paddingBottom: "10px",
    display: "flex",
    height: "68px",
  },
  recentActivityListItemIconContainer: {
    width: "44px",
    height: "44px",
    borderRadius: "22px",
    marginRight: "12px",
    border: `solid 1pt ${theme.custom.colors.border}`,
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
  },
  recentActivityListItemIcon: {
    color: theme.custom.colors.secondary,
    marginLeft: "auto",
    marginRight: "auto",
  },
  recentActivityListItemIconNegative: {
    color: theme.custom.colors.negative,
    marginLeft: "auto",
    marginRight: "auto",
  },
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
  const wallet = useSolanaWallet();
  return (
    <div>
      <RecentActivityList address={wallet.publicKey.toString()} />
    </div>
  );
}

export function RecentActivitySmall({ address }: any) {
  return (
    <div>
      <RecentActivitySmallHeader />
      <RecentActivityList address={address} />
    </div>
  );
}

export function RecentActivitySmallHeader() {
  const classes = useStyles();
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginLeft: "12px",
        marginRight: "12px",
        paddingBottom: "8px",
      }}
    >
      <div>
        <Typography className={classes.recentActivityLabel}>
          Recent Actvitiy
        </Typography>
      </div>
      <div>
        <Typography className={classes.allWalletsLabel}>All Wallets</Typography>
      </div>
    </div>
  );
}

export function RecentActivityList({ address }: any) {
  return (
    <Suspense fallback={<RecentActivityLoading />}>
      <_RecentActivityList address={address} />
    </Suspense>
  );
}

function RecentActivityLoading() {
  const classes = useStyles();
  return (
    <div className={classes.listItem} style={{ height: "40px" }}>
      <div
        style={{ display: "block", marginLeft: "auto", marginRight: "auto" }}
      >
        <UnlockedLoading iconStyle={{ width: "25px", height: "25px" }} />
      </div>
    </div>
  );
}

export function _RecentActivityList({ address }: any) {
  const transactions = useRecentTransactions(address);
  return (
    <List style={{ paddingTop: 0, paddingBottom: 0 }}>
      {transactions.length > 0 ? (
        transactions.map((tx: any) => (
          <RecentActivityListItem transaction={tx} />
        ))
      ) : (
        <NoRecentActivityLabel />
      )}
    </List>
  );
}

function RecentActivityListItem({ transaction }: any) {
  const classes = useStyles();
  const txSig = transaction.transaction.signatures[0];
  const unixTimestamp = transaction.blockTime;
  const date = new Date(unixTimestamp * 1000);
  const dateStr = date.toLocaleDateString();
  const onClick = () => {
    window.open(explorerUrl(txSig));
  };
  return (
    <ListItem
      button
      disableRipple
      className={classes.listItem}
      onClick={onClick}
    >
      <RecentActivityListItemIcon transaction={transaction} />
      <div>
        <Typography className={classes.txSig}>
          {txSig.slice(0, 4)}...{txSig.slice(txSig.length - 5)}
        </Typography>
        <Typography className={classes.txDate}>{dateStr}</Typography>
      </div>
    </ListItem>
  );
}

function RecentActivityListItemIcon({ transaction }: any) {
  const classes = useStyles();
  return (
    <div className={classes.recentActivityListItemIconContainer}>
      {transaction.transaction.err ? (
        <Clear className={classes.recentActivityListItemIconNegative} />
      ) : (
        <Check className={classes.recentActivityListItemIcon} />
      )}
    </div>
  );
}

function NoRecentActivityLabel() {
  const classes = useStyles();
  return (
    <div>
      <Typography className={classes.noRecentActivityLabel}>
        No Recent Activity
      </Typography>
    </div>
  );
}
