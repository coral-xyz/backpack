import { auth } from "@coral-xyz/background";
import { useCustomTheme } from "@coral-xyz/themes";
import { Box, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { useState } from "react";
import { PrimaryButton, SubtextParagraph, TextField } from "../../common";
import { BackpackHeader } from "../BackpackHeader";

const useStyles = makeStyles(() => ({
  passwordFieldRoot: {
    margin: 0,
    width: "100%",
    marginBottom: "12px",
  },
}));

export function LoginAsExistingUser({
  onNext,
  showInviteCodeFlow,
}: {
  onNext: (username: string, password: string) => void;
  showInviteCodeFlow: any;
}) {
  const classes = useStyles();
  const theme = useCustomTheme();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();

  const next = async () => {
    try {
      await auth.signin(username, password);
      onNext(username, password);
    } catch (err: any) {
      setError(err.message);
      return;
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
        backgroundColor: theme.custom.colors.nav,
        textAlign: "center",
      }}
    >
      <Box>
        <BackpackHeader />
      </Box>

      <Box
        sx={{
          marginLeft: "16px",
          marginRight: "16px",
          marginBottom: "16px",
          textAlign: "center",
        }}
      >
        <Box style={{ marginBottom: 8 }}>
          <TextField
            inputProps={{ name: "username" }}
            placeholder="Username"
            type="text"
            value={username}
            setValue={setUsername}
            isError={error}
          />
          <TextField
            inputProps={{ name: "password" }}
            placeholder="Password"
            type="password"
            value={password}
            setValue={setPassword}
            rootClass={classes.passwordFieldRoot}
            isError={error}
          />
          {error && (
            <Typography sx={{ color: theme.custom.colors.negative }}>
              {error}
            </Typography>
          )}
        </Box>

        <PrimaryButton label="Unlock" onClick={next} />

        <Box onClick={showInviteCodeFlow}>
          <SubtextParagraph style={{ marginTop: "8px" }}>
            I have an invite code
          </SubtextParagraph>
        </Box>
      </Box>
    </Box>
  );
}
