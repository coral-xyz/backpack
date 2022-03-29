import { useState } from "react";
import { makeStyles, Button, Typography } from "@material-ui/core";
import { useBlockchainTokenAccount } from "../../../hooks/useBlockchainBalances";
import { RecentActivitySmall } from "./Network/RecentActivity";
import { SendButton } from "./Send";
import { DepositButton } from "./Deposit";
import { WithDrawer } from "../../Layout/Drawer";

const useStyles = makeStyles((theme: any) => ({
  tokenHeaderContainer: {
    marginBottom: "38px",
  },
  balanceContainer: {
    marginTop: "24px",
  },
  tokenHeaderButtonContainer: {
    width: "316px",
    display: "flex",
    justifyContent: "space-between",
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: "20px",
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
    lineHeight: "24px",
  },
  usdBalanceLabel: {
    color: theme.custom.colors.fontColor,
    fontWeight: 500,
    fontSize: "14px",
    textAlign: "center",
    marginTop: "6px",
    lineHeight: "24px",
  },
  headerButton: {
    borderRadius: "12px",
    width: "100px",
    height: "40px",
    backgroundColor: theme.custom.colors.nav,
    "&:hover": {
      backgroundColor: theme.custom.colors.nav,
    },
  },
  headerButtonLabel: {
    color: theme.custom.colors.fontColor,
    fontSize: "14px",
    lineHeight: "24px",
    fontWeight: 500,
    textTransform: "none",
  },
}));

export function Token({ blockchain, address }: any) {
  return (
    <div>
      <TokenHeader blockchain={blockchain} address={address} />
      <RecentActivitySmall address={address} />
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
        <DepositButton token={token} />
        <SendButton token={token} />
        <CheckButton token={token} />
      </div>
    </div>
  );
}

export function WithHeaderButton({ label, dialog, dialogTitle }: any) {
  const classes = useStyles();
  const [openDrawer, setOpenDrawer] = useState(false);
  return (
    <>
      <Button
        disableElevation
        variant="contained"
        className={classes.headerButton}
        disableRipple
        onClick={() => setOpenDrawer(true)}
      >
        <Typography className={classes.headerButtonLabel}>{label}</Typography>
      </Button>
      <WithDrawer
        openDrawer={openDrawer}
        setOpenDrawer={setOpenDrawer}
        title={dialogTitle}
      >
        {dialog(setOpenDrawer)}
      </WithDrawer>
    </>
  );
}

function CheckButton({ token }: any) {
  return (
    <WithHeaderButton
      label={"Check"}
      dialogTitle={`${token.ticker} / Check`}
      dialog={(setOpenDrawer: any) => (
        <Check onCancel={() => setOpenDrawer(false)} token={token} />
      )}
    />
  );
}

function Check({ onCancel, token }: any) {
  return <div>this is a check</div>;
}
