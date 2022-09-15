import { useCustomTheme } from "@coral-xyz/themes";
import { AlternateEmailSharp } from "@mui/icons-material";
import { Box, InputAdornment, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { useEffect, useState } from "react";
import { supabase } from "../../../supabase";
import {
  CheckboxForm,
  Header,
  PrimaryButton,
  SubtextParagraph,
  TextField,
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

type Props = {
  inviteCode: string;
  onNext: (username: string, password: string) => void;
};

export function CreatePassword({ inviteCode, onNext }: Props) {
  const classes = useStyles();
  const theme = useCustomTheme();
  const [checked, setChecked] = useState(false);
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
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

    const {
      data: { user, session },
      error,
    } = await supabase.auth.signUp({
      email: `${username}@example.com`,
      password,
      options: {
        data: {
          invitation_code: inviteCode,
        },
      },
    });
    await supabase
      .from("invitations")
      .update({ user_id: user?.id })
      .eq("id", inviteCode);

    // console.log({ user, session, error });

    if (error) {
      setUsernameError(error.message);
      return;
    }

    onNext(username, password);
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
          <Header text="Claim your username" />
          <SubtextParagraph style={{ marginTop: "8px", marginBottom: "40px" }}>
            Others can see and find you by this username, so choose wisely if
            you'd like to remain anonymous. You will not be able to change this
            later.
          </SubtextParagraph>
        </Box>
        <Box
          sx={{
            marginLeft: "16px",
            marginRight: "16px",
            marginBottom: "32px",
          }}
        >
          <TextField
            inputProps={{
              name: "username",
              autoComplete: false,
              spellCheck: false,
            }}
            placeholder="Username"
            type="text"
            value={username}
            setValue={setUsername}
            rootClass={classes.passwordFieldRoot}
            isError={usernameError}
            startAdornment={
              <InputAdornment position="start">
                <AlternateEmailSharp
                  style={{ color: theme.custom.colors.secondary }}
                />
              </InputAdornment>
            }
          />
          {usernameError && (
            <Typography sx={{ color: theme.custom.colors.negative }}>
              {usernameError}
            </Typography>
          )}
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
            label={
              <>
                I agree to the{" "}
                <span
                  onClick={() => window.open("https://backpack.app/terms")}
                  style={{ color: theme.custom.colors.brandColor }}
                >
                  terms of service
                </span>
              </>
            }
          />
        </Box>
        <PrimaryButton disabled={isNextDisabled} label="Next" onClick={next} />
      </Box>
    </Box>
  );
}
