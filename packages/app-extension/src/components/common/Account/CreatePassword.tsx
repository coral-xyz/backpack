import { useState } from "react";
import makeStyles from "@mui/styles/makeStyles";
import { Box, Typography } from "@mui/material";
import {
  Header,
  SubtextParagraph,
  PrimaryButton,
  TextField,
  CheckboxForm,
} from "../../common";

const useStyles = makeStyles(() => ({
  passwordFieldRoot: {
    margin: 0,
    width: "100%",
    marginBottom: "12px",
  },
}));

export function CreatePassword({
  onNext,
}: {
  onNext: (password: string) => void;
}) {
  const classes = useStyles();
  const [checked, setChecked] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordDup, setPasswordDup] = useState("");
  const [error, setError] = useState<null | string>(null);

  const next = async () => {
    if (password.length < 8) {
      setError("Password must be longer than 8 characters");
      return;
    } else if (password !== passwordDup) {
      setError(`Passwords don't match`);
      return;
    }
    onNext(password);
  };

  const isNextDisabled =
    password.length < 8 || password !== passwordDup || !checked;

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
          <SubtextParagraph style={{ marginTop: "8px", marginBottom: "40px" }}>
            Your password should be at least 8 characters. You’ll need this to
            unlock Backpack.
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
            placeholder="Password"
            type="password"
            value={password}
            setValue={setPassword}
            rootClass={classes.passwordFieldRoot}
          />
          <TextField
            inputProps={{ name: "password-confirmation" }}
            placeholder="Confirm Password"
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
        <PrimaryButton disabled={isNextDisabled} label="Next" onClick={next} />
      </Box>
    </Box>
  );
}
