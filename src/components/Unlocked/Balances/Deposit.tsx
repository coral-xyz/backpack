import { useState } from "react";
import { makeStyles, Button, Typography } from "@material-ui/core";
import { WithHeaderButton } from "./Token";

const useStyles = makeStyles((theme: any) => ({
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

export function DepositButton({ token }: any) {
  return (
    <WithHeaderButton
      label={"Deposit"}
      dialogTitle={`${token.ticker} / Deposit`}
      dialog={(_setOpenDrawer: any) => <Deposit token={token} />}
    />
  );
}

function Deposit({ token }: any) {
  return <div>Deposit</div>;
}
