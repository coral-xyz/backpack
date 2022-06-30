import { Suspense, useState } from "react";
import { Typography, List, ListItem, IconButton } from "@mui/material";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { Check, Clear, Bolt } from "@mui/icons-material";
import { explorerUrl } from "@coral-xyz/common";
import { useActiveWallet, useRecentTransactions } from "@coral-xyz/recoil";
import { Loading } from "../../common";
import { WithEphemeralNavDrawer } from "../../Layout/Drawer";

const useStyles = styles((theme) => ({
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
    borderBottom: `solid 1pt ${theme.custom.colors.border}`,
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
  networkSettingsButtonContainer: {
    display: "flex",
    flexDirection: "row-reverse",
    width: "38px",
  },
  networkSettingsButton: {
    padding: 0,
    width: "24px",
    "&:hover": {
      background: "transparent",
    },
  },
  networkSettingsIcon: {
    color: theme.custom.colors.secondary,
    backgroundColor: "transparent",
    borderRadius: "12px",
  },
}));

export function RecentActivityButton() {
  const classes = useStyles();
  const [openDrawer, setOpenDrawer] = useState(false);
  return (
    <div className={classes.networkSettingsButtonContainer}>
      <IconButton
        disableRipple
        className={classes.networkSettingsButton}
        onClick={() => setOpenDrawer(true)}
        size="large"
      >
        <Bolt className={classes.networkSettingsIcon} />
      </IconButton>
      <WithEphemeralNavDrawer
        openDrawer={openDrawer}
        setOpenDrawer={setOpenDrawer}
        title={"Recent Activity"}
      >
        <RecentActivity />
      </WithEphemeralNavDrawer>
    </div>
  );
}

export function RecentActivity() {
  const wallet = useActiveWallet();
  return (
    <div>
      <RecentActivityList address={wallet.publicKey.toString()} />
    </div>
  );
}

export function RecentActivitySmall({ address }: any) {
  const theme = useCustomTheme();
  return (
    <div>
      <RecentActivitySmallHeader />
      <RecentActivityList
        address={address}
        style={{ borderTop: `solid 1pt ${theme.custom.colors.border}` }}
      />
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

export function RecentActivityList({ address, style }: any) {
  return (
    <Suspense fallback={<RecentActivityLoading />}>
      <_RecentActivityList style={style} address={address} />
    </Suspense>
  );
}

function RecentActivityLoading() {
  const classes = useStyles();
  const theme = useCustomTheme();
  return (
    <div
      className={classes.listItem}
      style={{
        height: "40px",
        borderTop: `solid 1pt ${theme.custom.colors.border}`,
      }}
    >
      <div
        style={{ display: "block", marginLeft: "auto", marginRight: "auto" }}
      >
        <Loading iconStyle={{ width: "25px", height: "25px" }} />
      </div>
    </div>
  );
}

export function _RecentActivityList({ address, style }: any) {
  if (!style) {
    style = {};
  }
  const transactions = useRecentTransactions(address);
  return (
    <List style={{ ...style, paddingTop: 0, paddingBottom: 0 }}>
      {transactions.length > 0 ? (
        transactions.map((tx: any) => (
          <RecentActivityListItem
            key={tx.transaction.signatures[0]}
            transaction={tx}
          />
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
