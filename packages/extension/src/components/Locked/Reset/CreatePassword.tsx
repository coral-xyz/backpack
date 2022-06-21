import { useEffect, useState } from "react";
import makeStyles from "@mui/styles/makeStyles";
import { useEphemeralNav } from "@coral-xyz/recoil";
import { Box, Checkbox, Typography } from "@mui/material";
import {
  Header,
  SubtextParagraph,
  PrimaryButton,
  TextField,
} from "../../common";
import {
  getBackgroundClient,
  DerivationPath,
  UI_RPC_METHOD_KEYRING_STORE_CREATE,
} from "@coral-xyz/common";
import { SetupComplete } from "./SetupComplete";

const useStyles = makeStyles((theme: any) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    justifyContent: "space-between",
    color: theme.custom.colors.nav,
  },
  passwordFieldRoot: {
    margin: 0,
    width: "100%",
    marginBottom: "16px",
  },
  termsContainer: {
    display: "flex",
    marginTop: "8px",
  },
  checkBox: {
    padding: 0,
    color: theme.custom.colors.onboardButton,
  },
  checkBoxChecked: {
    color: `${theme.custom.colors.onboardButton} !important`,
  },
  errorMsg: {
    color: "red",
    textAlign: "left",
    marginTop: "8px",
  },
}));

export function CreatePassword({
  mnemonic,
  accountIndices,
  closeDrawer,
}: {
  mnemonic: string;
  accountIndices: number[];
  closeDrawer: () => void;
}) {
  const classes = useStyles();
  const nav = useEphemeralNav();
  const [checked, setChecked] = useState(true);
  const [password, setPassword] = useState("");
  const [passwordDup, setPasswordDup] = useState("");
  const [error, setError] = useState<null | string>(null);

  const derivationPath = DerivationPath.Bip44Change;

  const next = async () => {
    if (password.length < 8) {
      setError("Password must be longer than 8 characters");
      return;
    } else if (password !== passwordDup) {
      setError(`Passwords don't match`);
      return;
    }
    const background = getBackgroundClient();
    await background.request({
      method: UI_RPC_METHOD_KEYRING_STORE_CREATE,
      params: [mnemonic, derivationPath, password, accountIndices],
    });
    nav.push(<SetupComplete closeDrawer={closeDrawer} />);
  };

  return (
    <Box className={classes.root}>
      <Box>
        <Header text="Create a password" />
        <SubtextParagraph>
          You’ll need this to unlock Backpack.
        </SubtextParagraph>
        <div>
          <TextField
            inputProps={{ name: "password" }}
            placeholder="Enter your password..."
            type="password"
            value={password}
            setValue={setPassword}
            rootClass={classes.passwordFieldRoot}
          />
          <TextField
            inputProps={{ name: "password-confirmation" }}
            placeholder="Confirm your password..."
            type="password"
            value={passwordDup}
            setValue={setPasswordDup}
            rootClass={classes.passwordFieldRoot}
          />
        </div>
        {error && <Typography className={classes.errorMsg}>{error}</Typography>}
        <div className={classes.termsContainer}>
          <Checkbox
            className={classes.checkBox}
            checked={checked}
            onChange={() => setChecked(!checked)}
            classes={{
              checked: classes.checkBoxChecked,
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              marginLeft: "10px",
            }}
          >
            <SubtextParagraph>I agree to the terms of service</SubtextParagraph>
          </div>
        </div>
      </Box>
      <Box>
        <PrimaryButton label="Next" onClick={next} />
      </Box>
    </Box>
  );
}
