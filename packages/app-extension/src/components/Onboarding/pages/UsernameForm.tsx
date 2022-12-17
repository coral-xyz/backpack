import { type FormEvent, useCallback, useEffect, useState } from "react";
import { PrimaryButton,TextInput } from "@coral-xyz/react-common";
import { useCustomTheme } from "@coral-xyz/themes";
import { AlternateEmail } from "@mui/icons-material";
import { Box, InputAdornment } from "@mui/material";

import { Header, SubtextParagraph } from "../../common";

export const UsernameForm = ({
  inviteCode,
  onNext,
}: {
  inviteCode: string;
  onNext: (username: string) => void;
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
        const res = await fetch(`https://auth.xnfts.dev/users/${username}`, {
          headers: {
            "x-backpack-invite-code": String(inviteCode),
          },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "There was an error");

        onNext(username);
      } catch (err: any) {
        setError(err.message);
      }
    },
    [username]
  );

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <Box style={{ margin: "24px" }}>
        <Header text="Claim your username" />
        <SubtextParagraph style={{ margin: "16px 0" }}>
          Others can see and find you by this username, and it will be
          associated with your primary wallet address.
          <br />
          <br />
          Choose wisely if you'd like to remain anonymous.
          <br />
          <br />
          Have fun!
        </SubtextParagraph>
      </Box>
      <Box
        style={{
          marginLeft: "16px",
          marginRight: "16px",
          marginBottom: "16px",
        }}
      >
        <Box style={{ marginBottom: "16px" }}>
          <TextInput
            inputProps={{
              name: "username",
              autoComplete: "off",
              spellCheck: "false",
              autoFocus: true,
            }}
            placeholder="Username"
            type="text"
            value={username}
            setValue={(e) => {
              setUsername(
                e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")
              );
            }}
            error={error ? true : false}
            errorMessage={error}
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
        </Box>
        <PrimaryButton label="Continue" type="submit" />
      </Box>
    </form>
  );
};
