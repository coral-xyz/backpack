import {
  makeStyles,
  Button,
  Typography,
  List,
  ListItem,
  ListItemIcon,
} from "@material-ui/core";
import { useBlockchainTokenAccount } from "../../../hooks/useBlockchainBalances";
import { useRecentTokenTransactions } from "../../../hooks/useRecentTransactions";

const useStyles = makeStyles((theme: any) => ({
  tokenHeaderContainer: {
    marginBottom: "38px",
  },
  balanceContainer: {
    marginTop: "24px",
  },
  tokenHeaderButtonContainer: {
    width: "208px",
    display: "flex",
    justifyContent: "space-between",
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: "20px",
  },
  headerButton: {
    borderRadius: "12px",
    width: "100px",
    height: "40px",
    backgroundColor: theme.custom.colors.nav,
    color: theme.custom.colors.fontColor,
    "&:hover": {
      backgroundColor: theme.custom.colors.nav,
    },
  },
  positivePercent: {
    color: theme.custom.colors.positive,
  },
  negativePercent: {
    color: theme.custom.colors.negative,
  },
  nativeBalanceLabel: {
    color: theme.custom.colors.secondary,
    fontSize: "20px",
    fontWeight: 500,
    textAlign: "center",
  },
  usdBalanceLabel: {
    color: theme.custom.colors.fontColor,
    fontWeight: 500,
    fontSize: "14px",
    textAlign: "center",
    marginTop: "6px",
  },
  recentActivityLabel: {
    color: theme.custom.colors.fontColor,
    fontWeight: 500,
    fontSize: "14px",
  },
  allWalletsLabel: {
    fontWeight: 500,
    fontSize: "12px",
    color: theme.custom.colors.secondary,
  },
}));

export function Token({ blockchain, address }: any) {
  return (
    <div>
      <TokenHeader blockchain={blockchain} address={address} />
      <TokenRecentActivity address={address} />
    </div>
  );
}

function TokenHeader({ blockchain, address }: any) {
  const classes = useStyles();
  const token = useBlockchainTokenAccount(blockchain, address);
  const percentClass =
    token.recentPercentChange > 0
      ? classes.positivePercent
      : classes.negativePercent;
  return (
    <div className={classes.tokenHeaderContainer}>
      <div className={classes.balanceContainer}>
        <Typography className={classes.nativeBalanceLabel}>
          {token.nativeBalance.toLocaleString()} {token.ticker}
        </Typography>
        <Typography className={classes.usdBalanceLabel}>
          ${parseFloat(token.usdBalance.toFixed(2)).toLocaleString()}{" "}
          <span className={percentClass}>({token.recentPercentChange}%)</span>
        </Typography>
      </div>
      <div className={classes.tokenHeaderButtonContainer}>
        <Button
          disableElevation
          variant="contained"
          className={classes.headerButton}
          disableRipple
        >
          Deposit
        </Button>
        <Button
          disableElevation
          variant="contained"
          className={classes.headerButton}
          disableRipple
        >
          Send
        </Button>
      </div>
    </div>
  );
}

function TokenRecentActivity({ address }: any) {
  const classes = useStyles();
  const actions: any = useRecentTokenTransactions(address);
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginLeft: "12px",
          marginRight: "12px",
        }}
      >
        <div>
          <Typography className={classes.recentActivityLabel}>
            Recent Actvitiy
          </Typography>
        </div>
        <div>
          <Typography className={classes.allWalletsLabel}>
            All Wallets
          </Typography>
        </div>
      </div>
      <List>
        {actions.map((action: any) => (
          <ListItem>
            <ListItemIcon>{JSON.stringify(action)}</ListItemIcon>
            <div></div>
          </ListItem>
        ))}
      </List>
    </div>
  );
}
