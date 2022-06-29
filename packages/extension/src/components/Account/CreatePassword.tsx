import { useState } from "react";
import makeStyles from "@mui/styles/makeStyles";
import { Box, Typography } from "@mui/material";
import {
  Header,
  SubtextParagraph,
  PrimaryButton,
  TextField,
  CheckboxForm,
} from "../common";

const useStyles = makeStyles(() => ({
  passwordFieldRoot: {
    margin: 0,
    width: "100%",
    marginBottom: "16px",
  },
}));
import { useEphemeralNav } from "@coral-xyz/recoil";
import type { NavEphemeralContext } from "@coral-xyz/recoil";

export function CreatePassword({
  onNext,
}: {
  onNext: (nav: NavEphemeralContext, password: string) => void;
}) {
  const classes = useStyles();
  const [checked, setChecked] = useState(true);
  const [password, setPassword] = useState("");
  const [passwordDup, setPasswordDup] = useState("");
  const [error, setError] = useState<null | string>(null);
  const nav = useEphemeralNav();

  const next = async () => {
    if (password.length < 8) {
      setError("Password must be longer than 8 characters");
      return;
    } else if (password !== passwordDup) {
      setError(`Passwords don't match`);
      return;
    }
    onNext(nav, password);
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
      <Box
        sx={{
          marginTop: "24px",
        }}
      >
        <Box
          sx={{
            marginLeft: "24px",
            marginRight: "24px",
          }}
        >
          <Header text="Create a password" />
          <SubtextParagraph>
            You’ll need this to unlock Backpack.
          </SubtextParagraph>
        </Box>
        <Box
          sx={{
            marginLeft: "16px",
            marginRight: "16px",
          }}
        >
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
          {error && (
            <Typography sx={{ color: "red", mt: "8px" }}>{error}</Typography>
          )}
          <CheckboxForm
            checked={checked}
            setChecked={setChecked}
            label="I agree to the terms of service"
          />
        </Box>
      </Box>
      <Box
        sx={{
          marginLeft: "16px",
          marginRight: "16px",
          marginBottom: "16px",
        }}
      >
        <PrimaryButton label="Next" onClick={next} />
      </Box>
    </Box>
  );
}
