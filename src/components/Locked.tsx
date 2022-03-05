import { useState } from "react";
import { makeStyles, Typography, TextField } from "@material-ui/core";
import { WithContinue } from "./Onboarding/CreateNewWallet";
import { Logo } from "./Onboarding";

export const useStyles = makeStyles((theme: any) => ({
  passwordField: {
    backgroundColor: theme.custom.colors.offText,
  },
}));

export function Locked() {
  const classes = useStyles();
  const [password, setPassword] = useState("");
  const onUnlock = () => {};
  return (
    <WithContinue buttonLabel={"Unlock"} canContinue={true} next={onUnlock}>
      <Logo />
      <Typography variant="h4">Enter your password</Typography>
      <TextField
        placeholder="Password"
        variant="outlined"
        margin="dense"
        className={classes.passwordField}
        required
        fullWidth
        type="password"
        InputLabelProps={{
          shrink: false,
        }}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
    </WithContinue>
  );
}
