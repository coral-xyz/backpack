import { useCustomTheme } from "@coral-xyz/themes";
import { AlternateEmail } from "@mui/icons-material";
import { Box, InputAdornment, Typography } from "@mui/material";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  Header,
  PrimaryButton,
  SubtextParagraph,
  TextField,
} from "../../common";
import { getWaitlistId } from "../../common/WaitingRoom";

export const RecoverAccountUsernameForm = ({
  onNext,
}: {
  onNext: (username: string, publickey: string) => void;
}) => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const theme = useCustomTheme();

  useEffect(() => {
    setError("");
  }, [username]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      try {
        const res = await fetch(
          `http://127.0.0.1:8787/users/${username}/info`,
          {
            headers: {
              "x-backpack-waitlist-id": getWaitlistId() || "",
            },
          }
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json.message);
        onNext(username, json.pubkey);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      }
    },
    [username]
  );

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "0 16px 16px",
      }}
    >
      <Box style={{ padding: 8, flex: 1 }}>
        <Header text="Username recovery" />
        <SubtextParagraph style={{ margin: "16px 0" }}>
          Enter your username below, you will then be asked for your secret
          recovery phrase to verify that you own the public key that was
          initially associated with it.
        </SubtextParagraph>
      </Box>
      <Box style={{ flex: 1 }}>
        <TextField
          inputProps={{
            name: "username",
            autoComplete: "off",
            spellCheck: "false",
            autoFocus: true,
          }}
          placeholder="Username"
          type="text"
          value={username}
          setValue={(v: string) => {
            setUsername(v.toLowerCase().replace(/[^a-z0-9_]/g, ""));
          }}
          isError={error}
          auto
          startAdornment={
            <InputAdornment position="start">
              <AlternateEmail
                style={{
                  color: theme.custom.colors.secondary,
                  fontSize: 18,
                  marginRight: -2,
                  userSelect: "none",
                }}
              />
            </InputAdornment>
          }
        />
        {error && (
          <Typography sx={{ color: theme.custom.colors.negative }}>
            {error}
          </Typography>
        )}
      </Box>
      <Box>
        <PrimaryButton
          label="Continue"
          type="submit"
          style={{ marginTop: 8 }}
        />
      </Box>
    </form>
  );
};
