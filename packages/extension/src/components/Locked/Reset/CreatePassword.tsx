import { useState } from "react";
import makeStyles from "@mui/styles/makeStyles";
import { useEphemeralNav } from "@coral-xyz/recoil";
import { Box, Typography } from "@mui/material";
import {
  Header,
  SubtextParagraph,
  PrimaryButton,
  TextField,
  CheckboxForm,
} from "../../common";
import {
  getBackgroundClient,
  DerivationPath,
  UI_RPC_METHOD_KEYRING_STORE_CREATE,
} from "@coral-xyz/common";
import { SetupComplete } from "./SetupComplete";

const useStyles = makeStyles((theme: any) => ({
  passwordFieldRoot: {
    margin: 0,
    width: "100%",
    marginBottom: "16px",
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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <Box>
        <Header text="Create a password" />
        <SubtextParagraph>
          You’ll need this to unlock Backpack.
        </SubtextParagraph>
        <Box>
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
        </Box>
        {error && (
          <Typography sx={{ color: "red", mt: "8px" }}>{error}</Typography>
        )}
        <CheckboxForm
          checked={checked}
          setChecked={setChecked}
          label="I agree to the terms of service"
        />
      </Box>
      <Box>
        <PrimaryButton label="Next" onClick={next} />
      </Box>
    </Box>
  );
}
