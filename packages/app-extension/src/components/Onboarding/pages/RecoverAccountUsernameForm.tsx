import { type FormEvent, useCallback, useEffect, useState } from "react";
import type { ServerPublicKey } from "@coral-xyz/common";
import { BACKEND_API_URL } from "@coral-xyz/common";
import { PrimaryButton, TextInput } from "@coral-xyz/react-common";
import { useCustomTheme } from "@coral-xyz/themes";
import { AlternateEmail } from "@mui/icons-material";
import { Box, InputAdornment } from "@mui/material";

import { Header, SubtextParagraph } from "../../common";

export const RecoverAccountUsernameForm = ({
  onNext,
}: {
  onNext: (
    userId: string,
    username: string,
    serverPublicKeys: Array<ServerPublicKey>
  ) => void;
}) => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const theme = useCustomTheme();

  useEffect(() => {
    // Clear error on username changes
    setError("");
  }, [username]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      try {
        const response = await fetch(`${BACKEND_API_URL}/users/${username}`);
        const json = await response.json();
        if (!response.ok) throw new Error(json.msg);
        // Use the first found public key
        onNext(json.id, username, json.publicKeys);
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
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <Box style={{ margin: "24px" }}>
        <Header text="Username recovery" />
        <SubtextParagraph style={{ margin: "16px 0" }}>
          Enter your username below, you will then be asked for your secret
          recovery phrase to verify that you own the public key that was
          initially associated with it.
        </SubtextParagraph>
      </Box>
      <Box
        style={{
          marginLeft: "16px",
          marginRight: "16px",
          marginBottom: "16px",
        }}
      >
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
          setValue={(e: any) => {
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
        <PrimaryButton
          label="Continue"
          type="submit"
          style={{ marginTop: 8 }}
          disabled={username.length < 3}
        />
      </Box>
    </form>
  );
};
