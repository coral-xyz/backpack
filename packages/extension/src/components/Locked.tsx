import { useState } from "react";
import { makeStyles, Divider, Typography, Button } from "@material-ui/core";
import { getBackgroundClient } from "@200ms/recoil";
import { UI_RPC_METHOD_KEYRING_STORE_UNLOCK } from "@200ms/common";
import { TextField } from "./common";
import { OnboardButton } from "./common";

export const NAV_BAR_HEIGHT = 56;

const useStyles = makeStyles((theme: any) => ({
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
  content: {
    borderTopLeftRadius: "12px",
    borderTopRightRadius: "12px",
    background: "linear-gradient(180deg, #292C33 0%, rgba(41, 44, 51, 0) 100%)",
    height: "258px",
  },
  lockIcon: {
    color: theme.custom.colors.activeNavButton,
    marginLeft: "auto",
    marginRight: "auto",
    height: "120px",
    width: "120px",
    borderRadius: "30px",
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
  passwordRoot: {
    marginTop: "24px",
    marginBottom: "24px",
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
      <div className={classes.nav}>
        <Typography className={classes.navTitle}>Backpack</Typography>
      </div>
      <div className={classes.header}>
        <img src="/anchor.png" className={classes.lockIcon} alt="logo" />
      </div>
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
            <OnboardButton label="Unlock" type="submit" />
          </div>
        </form>
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
