import { useState } from "react";
import { Typography, useTheme } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import {
  getBackgroundClient,
  UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
} from "@coral-xyz/common";
import { TextField, PrimaryButton } from "../common";
import { LockedMenu } from "./LockedMenu";

export const NAV_BAR_HEIGHT = 56;

const useStyles = makeStyles((theme: any) => ({
  container: {
    backgroundColor: theme.custom.colors.nav,
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  forgotContainer: {
    marginTop: "12px",
  },
  forgotButtonTitle: {
    color: theme.custom.colors.secondary,
    textTransform: "none",
    fontSize: "12px",
    fontWeight: 500,
    width: "100%",
    textAlign: "center",
  },
  passwordRoot: {
    marginTop: 0,
    marginBottom: "12px",
  },
  content: {
    position: "absolute",
    top: "400px",
  },
}));

export function Locked({ onUnlock }: { onUnlock?: () => Promise<void> }) {
  const classes = useStyles();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<boolean>(false);
  const _onUnlock = async (e: any) => {
    e.preventDefault();
    try {
      const background = getBackgroundClient();
      await background.request({
        method: UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
        params: [password],
      });

      if (onUnlock) {
        onUnlock();
      }
    } catch (err) {
      setError(true);
    }
  };
  return (
    <div className={classes.container}>
      <LockedMenu />
      <BackpackHeader />
      <div className={classes.content}>
        <form onSubmit={_onUnlock}>
          <TextField
            isError={error}
            placeholder={"Password"}
            type={"password"}
            value={password}
            setValue={setPassword}
            rootClass={classes.passwordRoot}
          />
          <div style={{ marginLeft: "12px", marginRight: "12px" }}>
            <PrimaryButton label="Unlock" type="submit" />
          </div>
        </form>
        <div className={classes.forgotContainer}>
          <Typography className={classes.forgotButtonTitle}>
            Forgot your password?
          </Typography>
        </div>
      </div>
    </div>
  );
}

export function BackpackHeader() {
  const theme = useTheme() as any;
  return (
    <div
      style={{
        marginTop: "66px",
        marginLeft: "auto",
        marginRight: "auto",
        display: "block",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row-reverse",
          marginBottom: "4px",
          marginRight: "-30px",
        }}
      >
        <AlphaLabel />
      </div>
      <img
        src="/backpack.svg"
        style={{
          width: "200px",
          display: "block",
        }}
      />
      <Typography
        style={{
          textAlign: "center",
          lineHeight: "24px",
          fontSize: "16px",
          fontWeight: "500",
          color: theme.custom.colors.secondary,
          marginTop: "16px",
        }}
      >
        Backpack.app
      </Typography>
    </div>
  );
}

function AlphaLabel() {
  const theme = useTheme() as any;
  return (
    <div
      style={{
        borderRadius: "10px",
        border: `solid 1pt ${theme.custom.colors.alpha}`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: "20px",
        width: "53px",
      }}
    >
      <Typography
        style={{
          color: theme.custom.colors.alpha,
          fontSize: "12px",
          lineHeight: "16px",
          textAlign: "center",
          fontWeight: 500,
        }}
      >
        Alpha
      </Typography>
    </div>
  );
}
