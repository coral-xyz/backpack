import { useCustomTheme } from "@coral-xyz/themes";
import { Box, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { useState } from "react";
import { supabase } from "../../../supabase";
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
    const {
      data: { user, session },
      error,
    } = await supabase.auth.signInWithPassword({
      email: `${username}@example.com`,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    onNext(username, password);
  };

  return (
    <Box
      sx={{
        backgroundColor: theme.custom.colors.nav,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
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
        }}
      >
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

        <PrimaryButton label="Unlock" onClick={next} />
      </Box>

      <Box onClick={showInviteCodeFlow}>
        <SubtextParagraph style={{ marginTop: "8px", marginBottom: "40px" }}>
          I have an invite code
        </SubtextParagraph>
      </Box>
    </Box>
  );
}
