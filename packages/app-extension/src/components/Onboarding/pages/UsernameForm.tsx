import { useCustomTheme } from "@coral-xyz/themes";
import { AlternateEmail } from "@mui/icons-material";
import { Box, InputAdornment } from "@mui/material";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Header, PrimaryButton, SubtextParagraph } from "../../common";
import { getWaitlistId } from "../../common/WaitingRoom";
import { TextInput } from "../../common/Inputs";

const MIN_LENGTH = 3;
const MAX_LENGTH = 15;

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

      const errorMessage = `Usernames should be between ${MIN_LENGTH}-${MAX_LENGTH} characters and can only contain numbers, letters, and underscores.`;

      try {
        if (username.length < MIN_LENGTH || username.length > MAX_LENGTH) {
          throw new Error(errorMessage);
        }
        const res = await fetch(`https://auth.xnfts.dev/users/${username}`, {
          headers: {
            "x-backpack-invite-code": String(inviteCode),
            "x-backpack-waitlist-id": getWaitlistId() || "",
          },
        });
        if (!res.ok) throw new Error(errorMessage);

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
                e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9_]/g, "")
                  .substring(0, MAX_LENGTH)
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
