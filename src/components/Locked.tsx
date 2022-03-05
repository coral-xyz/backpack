import { useState } from "react";
import { makeStyles, Typography, TextField } from "@material-ui/core";
import { WithContinue } from "./Onboarding/CreateNewWallet";
import { getBackgroundClient } from "../background/client";
import { UI_RPC_METHOD_KEYRING_STORE_UNLOCK } from "../common";

export const useStyles = makeStyles((theme: any) => ({
  passwordField: {
    backgroundColor: theme.custom.colors.offText,
    borderRadius: "4px",
  },
  passwordLabel: {
    textAlign: "center",
  },
  errorLabel: {
    color: "red",
  },
}));

export function Locked() {
  const classes = useStyles();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<null | string>(null);
  const onUnlock = () => {
    const background = getBackgroundClient();
    background
      .request({
        method: UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
        params: [password],
      })
      .catch(setError);
  };
  return (
    <WithContinue buttonLabel={"Unlock"} canContinue={true} next={onUnlock}>
      <Typography className={classes.passwordLabel} variant="h5">
        Enter your password
      </Typography>
      <TextField
        placeholder="Password"
        variant="outlined"
        margin="dense"
        required
        fullWidth
        type="password"
        inputProps={{
          className: classes.passwordField,
        }}
        InputLabelProps={{
          shrink: false,
        }}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <Typography className={classes.errorLabel}>{error}</Typography>}
    </WithContinue>
  );
}
