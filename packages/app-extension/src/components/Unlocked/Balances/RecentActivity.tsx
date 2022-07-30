import { Suspense, useState } from "react";
import { Typography, List, ListItem, IconButton } from "@mui/material";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { CallMade, Check, Clear, Bolt } from "@mui/icons-material";
import { explorerUrl } from "@coral-xyz/common";
import {
  useSolanaExplorer,
  useActiveWallet,
  useRecentTransactions,
} from "@coral-xyz/recoil";
import { Loading } from "../../common";
import { WithDrawer, CloseButton } from "../../Layout/Drawer";
import { NavStackEphemeral, NavStackScreen } from "../../Layout/NavStack";

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
    fontSize: "16px",
    padding: "16px",
    textAlign: "center",
    color: theme.custom.colors.secondary,
  },
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
  const theme = useCustomTheme();
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
      <WithDrawer openDrawer={openDrawer} setOpenDrawer={setOpenDrawer}>
        <div
          style={{ height: "100%", background: theme.custom.colors.background }}
        >
          <NavStackEphemeral
            initialRoute={{ name: "root" }}
            options={(_args) => ({ title: "Recent Activity" })}
            style={{
              borderBottom: `solid 1pt ${theme.custom.colors.border}`,
            }}
            navButtonRight={
              <CloseButton onClick={() => setOpenDrawer(false)} />
            }
          >
            <NavStackScreen
              name={"root"}
              component={(props: any) => <RecentActivity {...props} />}
            />
          </NavStackEphemeral>
        </div>
      </WithDrawer>
    </div>
  );
}

export function RecentActivity() {
  const wallet = useActiveWallet();
  return (
    <div style={{ marginTop: "16px" }}>
      <RecentActivityList address={wallet.publicKey.toString()} />
    </div>
  );
}

export function RecentActivitySmall({ address }: any) {
  const theme = useCustomTheme();
  return (
    <div>
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
          Recent Activity
        </Typography>
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
  return (
    <div
      className={classes.listItem}
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

export function _RecentActivityList({ address, style }: any) {
  const theme = useCustomTheme();
  const transactions = useRecentTransactions(address);

  if (!style) {
    style = {};
  }

  return (
    <List
      style={{
        paddingTop: 0,
        paddingBottom: 0,
        backgroundColor: theme.custom.colors.nav,
        marginLeft: "16px",
        marginRight: "16px",
        borderRadius: "12px",
        marginBottom: "16px",
        ...style,
      }}
    >
      {transactions.length > 0 ? (
        transactions.map((tx: any, idx: number) => (
          <RecentActivityListItem
            key={tx.transaction.signatures[0]}
            transaction={tx}
            isLast={idx === transactions.length - 1}
          />
        ))
      ) : (
        <NoRecentActivityLabel />
      )}
    </List>
  );
}

function RecentActivityListItem({ transaction, isLast }: any) {
  const classes = useStyles();
  const theme = useCustomTheme();
  const explorer = useSolanaExplorer();
  const txSig = transaction.transaction.signatures[0];
  const unixTimestamp = transaction.blockTime;
  const date = new Date(unixTimestamp * 1000);
  const dateStr = date.toLocaleDateString();

  const onClick = () => {
    window.open(explorerUrl(explorer, txSig));
  };

  console.log("tx", transaction.meta.status.Ok);

  return (
    <ListItem
      button
      disableRipple
      className={classes.listItem}
      onClick={onClick}
      style={{
        paddingLeft: "12px",
        paddingRight: "12px",
        paddingTop: "10px",
        paddingBottom: "10px",
        display: "flex",
        height: "68px",
        borderBottom: isLast
          ? undefined
          : `solid 1pt ${theme.custom.colors.border}`,
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
            <RecentActivityListItemIcon transaction={transaction} />
          </div>
          <div>
            <Typography className={classes.txSig}>
              {txSig.slice(0, 4)}...{txSig.slice(txSig.length - 5)}
            </Typography>
            <Typography className={classes.txDate}>{dateStr}</Typography>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <CallMade style={{ color: theme.custom.colors.secondary }} />
        </div>
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
