import type { Blockchain } from "@coral-xyz/common";
import { explorerUrl } from "@coral-xyz/common";
import { EmptyState, isFirstLastListItemStyle } from "@coral-xyz/react-common";
import {
  useBlockchainConnectionUrl,
  useBlockchainExplorer,
  useBlockchainLogo,
  useRecentTransactions,
} from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { CallMade, Check, Clear } from "@mui/icons-material";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import { List, ListItem, Typography } from "@mui/material";

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
    color: theme.custom.colors.icon,
    backgroundColor: "transparent",
    borderRadius: "12px",
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
  // Load transactions if not passed in as a prop
  const transactions = _transactions
    ? _transactions
    : useRecentTransactions(blockchain!, address!, contractAddresses!);

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
        {transactions.map((tx: any, idx: number) => {
          <SolanaTransactionListItem
            key={idx}
            transaction={tx}
            isFirst={idx === 0}
            isLast={idx === transactions.length - 1}
          />;
        })}
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
}: any) {
  const classes = useStyles();
  const theme = useCustomTheme();
  const explorer = useBlockchainExplorer(transaction.blockchain);
  const connectionUrl = useBlockchainConnectionUrl(transaction.blockchain);
  const blockchainLogo = useBlockchainLogo(transaction.blockchain);
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
            <Check className={classes.recentActivityListItemIcon} />
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
              {transaction.timestamp}
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
        icon={(props: any) => <FormatListBulletedIcon {...props} />}
        title={"No Recent Activity"}
        subtitle={
          "Your transactions and app activity will show up here when you start using Backpack!"
        }
        onClick={() => window.open("https://xnft.gg")}
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
