import { Suspense, useState } from "react";
import { Typography, List, ListItem, IconButton } from "@mui/material";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { CallMade, Check, Clear, Bolt } from "@mui/icons-material";
import { explorerUrl, Blockchain } from "@coral-xyz/common";
import {
  useSolanaExplorer,
  useActiveWallet,
  useRecentTransactions,
  useSolanaConnectionUrl,
} from "@coral-xyz/recoil";
import { Loading } from "../../common";
import { WithDrawer, CloseButton } from "../../common/Layout/Drawer";
import {
  NavStackEphemeral,
  NavStackScreen,
} from "../../common/Layout/NavStack";
import { isFirstLastListItemStyle } from "../../common/List";
import { EmptyState } from "../../common/EmptyState";

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
  // TODO multichain recent activity view
  return (
    <RecentActivityList
      blockchain={Blockchain.SOLANA}
      address={wallet.publicKey.toString()}
    />
  );
}

export function RecentActivityList({
  blockchain,
  address,
  style,
  minimize,
}: any) {
  return (
    <Suspense fallback={<RecentActivityLoading />}>
      <_RecentActivityList
        blockchain={blockchain}
        style={style}
        address={address}
        minimize={minimize}
      />
    </Suspense>
  );
}

function RecentActivityLoading() {
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

export function _RecentActivityList({
  blockchain,
  address,
  style,
  minimize,
}: any) {
  const transactions = useRecentTransactions(blockchain, address);

  if (!style) {
    style = {};
  }

  return transactions.length > 0 ? (
    <List
      style={{
        marginTop: "16px",
        paddingTop: 0,
        paddingBottom: 0,
        marginLeft: "16px",
        marginRight: "16px",
        borderRadius: "12px",
        marginBottom: "16px",
        ...style,
      }}
    >
      {transactions.map((tx: any, idx: number) => (
        <RecentActivityListItem
          key={tx.transaction.signatures[0]}
          transaction={tx}
          isFirst={idx === 0}
          isLast={idx === transactions.length - 1}
        />
      ))}
    </List>
  ) : (
    <NoRecentActivityLabel minimize={minimize} />
  );
}

function RecentActivityListItem({ transaction, isFirst, isLast }: any) {
  const classes = useStyles();
  const theme = useCustomTheme();
  const explorer = useSolanaExplorer();
  const connectionUrl = useSolanaConnectionUrl();

  const txSig = transaction.transaction.signatures[0];
  const unixTimestamp = transaction.blockTime;
  const date = new Date(unixTimestamp * 1000);
  const dateStr = date.toLocaleDateString();

  const onClick = () => {
    window.open(explorerUrl(explorer, txSig, connectionUrl));
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
        buttonText={"Browse the xNFT Library"}
        onClick={() => window.open("https://xnft.gg")}
        contentStyle={{
          marginBottom: minimize !== true ? "64px" : 0, // Tab height offset.
          color: minimize ? theme.custom.colors.secondary : "inherit",
        }}
        minimize={minimize}
      />
    </div>
  );
}
