import { useEffect, useState } from "react";
import makeStyles from "@mui/styles/makeStyles";
import { Box, Typography } from "@mui/material";
import { useCustomTheme } from "@coral-xyz/themes";
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

enum PasswordError {
  TOO_SHORT,
  NO_MATCH,
}

export function CreatePassword({
  onNext,
}: {
  onNext: (password: string) => void;
}) {
  const classes = useStyles();
  const theme = useCustomTheme();
  const [checked, setChecked] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordDup, setPasswordDup] = useState("");
  const [error, setError] = useState<PasswordError | null>(null);

  useEffect(() => {
    setError(null);
  }, [password, passwordDup]);

  const next = async () => {
    if (password.length < 8) {
      setError(PasswordError.TOO_SHORT);
      return;
    } else if (password !== passwordDup) {
      setError(PasswordError.NO_MATCH);
      return;
    }
    onNext(password);
  };

  const isNextDisabled = !checked;

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
            It should be at least 8 characters.
            <br />
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
            placeholder="Password"
            type="password"
            value={password}
            setValue={setPassword}
            rootClass={classes.passwordFieldRoot}
            isError={error === PasswordError.TOO_SHORT}
          />
          <TextField
            inputProps={{ name: "password-confirmation" }}
            placeholder="Confirm Password"
            type="password"
            value={passwordDup}
            setValue={setPasswordDup}
            rootClass={classes.passwordFieldRoot}
            isError={error === PasswordError.NO_MATCH}
          />
          {error !== null && (
            <Typography sx={{ color: theme.custom.colors.negative }}>
              {
                {
                  [PasswordError.TOO_SHORT]:
                    "Your password must be at least 8 characters.",
                  [PasswordError.NO_MATCH]: "Your passwords do not match.",
                }[error]
              }
            </Typography>
          )}
        </Box>
      </Box>
      <Box
        sx={{
          marginLeft: "16px",
          marginRight: "16px",
          marginBottom: "16px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "30px",
          }}
        >
          <CheckboxForm
            checked={checked}
            setChecked={setChecked}
            label="I agree to the terms of service"
          />
        </Box>
        <PrimaryButton disabled={isNextDisabled} label="Next" onClick={next} />
      </Box>
    </Box>
  );
}
