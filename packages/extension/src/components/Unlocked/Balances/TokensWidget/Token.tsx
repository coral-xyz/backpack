import { useState } from "react";
import { Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { Button } from "@200ms/anchor-ui-renderer";
import type { SearchParamsFor } from "@200ms/recoil";
import { useBlockchainTokenAccount } from "@200ms/recoil";
import { RecentActivitySmall } from "../RecentActivity";
import { SendButton } from "./Send";
import { DepositButton } from "./Deposit";
import { WithDrawer } from "../../../Layout/Drawer";

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
  headerButtonLabel: {
    color: theme.custom.colors.fontColor,
    fontSize: "14px",
    lineHeight: "24px",
    fontWeight: 500,
  },
}));

export function Token({ blockchain, address }: SearchParamsFor.Token["props"]) {
  return (
    <div>
      <TokenHeader blockchain={blockchain} address={address} />
      <RecentActivitySmall address={address} />
    </div>
  );
}

function TokenHeader({ blockchain, address }: SearchParamsFor.Token["props"]) {
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
        <SendButton blockchain={blockchain} address={address} />
      </div>
    </div>
  );
}

export function WithHeaderButton({
  style,
  labelComponent,
  label,
  dialog,
  dialogTitle,
}: any) {
  const classes = useStyles();
  const [openDrawer, setOpenDrawer] = useState(false);
  return (
    <>
      <Button style={style} onClick={() => setOpenDrawer(true)}>
        {labelComponent ? (
          labelComponent
        ) : (
          <Typography className={classes.headerButtonLabel}>{label}</Typography>
        )}
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
