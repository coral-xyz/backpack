import { useState } from "react";
import { Lock } from "@material-ui/icons";
import { makeStyles, Divider, Typography, Button } from "@material-ui/core";
import { TextField } from "./common";
import { getBackgroundClient } from "../background/client";
import { UI_RPC_METHOD_KEYRING_STORE_UNLOCK } from "../common";

export const NAV_BAR_HEIGHT = 56;

export const useStyles = makeStyles((theme: any) => ({
  container: {
    backgroundColor: theme.custom.colors.background,
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  nav: {
    backgroundColor: theme.custom.colors.nav,
    height: `${NAV_BAR_HEIGHT}px`,
    borderBottom: `solid 1pt ${theme.custom.colors.border}`,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  navTitle: {
    fontSize: "18px",
    lineHeight: "24px",
    color: theme.custom.colors.fontColor,
    fontWeight: 500,
    textAlign: "center",
  },
  header: {
    lineHeight: "24px",
    height: "188px",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
  },
  passwordRootNegative: {
    "& .MuiOutlinedInput-root": {
      border: `solid 1pt ${theme.custom.colors.negative}`,
    },
  },
  passwordLabel: {
    textAlign: "center",
  },
  errorLabel: {
    color: theme.custom.colors.negative,
  },
  content: {
    borderTopLeftRadius: "12px",
    borderTopRightRadius: "12px",
    background: "linear-gradient(180deg, #292C33 0%, rgba(41, 44, 51, 0) 100%)",
    height: "258px",
  },
  unlockButton: {
    backgroundColor: theme.custom.colors.onboardButton,
    width: "351px",
    height: "48px",
    color: theme.custom.colors.fontColor,
    borderRadius: "12px",
  },
  headerIcon: {
    color: theme.custom.colors.onboardButton,
  },
  headerTitle: {
    color: theme.custom.colors.fontColor,
    fontSize: "20px",
    fontWeight: 500,
    marginTop: "10px",
    marginBottom: "3px",
  },
  headerSubtitle: {
    lineHeight: "20px",
    color: theme.custom.colors.secondary,
    fontSize: "14px",
    fontWeight: 500,
  },
  lockIcon: {
    color: theme.custom.colors.activeNavButton,
    marginLeft: "auto",
    marginRight: "auto",
    width: "100%",
    height: "30px",
  },
  divider: {
    backgroundColor: theme.custom.colors.border,
    width: "91.5px",
  },
  forgotContainer: {
    display: "flex",
    marginLeft: "12px",
    marginRight: "12px",
    marginTop: "38px",
  },
  forgotButtonTitle: {
    color: theme.custom.colors.secondary,
    textTransform: "none",
    fontSize: "12px",
    fontWeight: 500,
    marginLeft: "18px",
    marginRight: "18px",
  },
  recoverButton: {
    position: "absolute",
    background: theme.custom.colors.nav,
    width: "351px",
    height: "48px",
    left: "12px",
    bottom: "80px",
    borderRadius: "12px",
  },
  recoverTitle: {
    color: theme.custom.colors.fontColor,
    fontWeight: 500,
    textTransform: "none",
    fontSize: "16px",
  },
}));

export function Locked() {
  const classes = useStyles();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<boolean>(false);
  const onUnlock = () => {
    const background = getBackgroundClient();
    background
      .request({
        method: UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
        params: [password],
      })
      .catch(() => setError(true));
  };
  return (
    <div className={classes.container}>
      <div className={classes.nav}>
        <Typography className={classes.navTitle}>200ms</Typography>
      </div>
      <div className={classes.header}>
        <Lock className={classes.lockIcon} />
        <Typography className={classes.headerTitle}>Unlock Wallet</Typography>
        <Typography className={classes.headerSubtitle}>
          Enter your password to unlock wallet.
        </Typography>
      </div>
      <div className={classes.content}>
        <TextField
          isError={error}
          placeholder={"Password"}
          type={"password"}
          value={password}
          setValue={setPassword}
        />
        <Button
          onClick={onUnlock}
          disableElevation
          variant="contained"
          className={classes.unlockButton}
        >
          <Typography style={{ fontWeight: 500, textTransform: "none" }}>
            Unlock
          </Typography>
        </Button>
        <div style={{ visibility: error ? undefined : "hidden" }}>
          <div className={classes.forgotContainer}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <Divider className={classes.divider} />
            </div>
            <Typography className={classes.forgotButtonTitle}>
              Forgot your password?
            </Typography>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <Divider className={classes.divider} />
            </div>
          </div>
          <Button
            disableRipple
            disableElevation
            className={classes.recoverButton}
          >
            <Typography className={classes.recoverTitle}>
              Recover Wallet with Secret Phrase
            </Typography>
          </Button>
        </div>
      </div>
    </div>
  );
}
