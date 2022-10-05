import { useCustomTheme } from "@coral-xyz/themes";
import { AlternateEmail } from "@mui/icons-material";
import { Box, InputAdornment, Typography } from "@mui/material";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Header,
  PrimaryButton,
  SubtextParagraph,
  TextField,
} from "../../common";
import { getWaitlistId } from "../../common/WaitingRoom";

const MIN_LENGTH = 3;
const MAX_LENGTH = 15;

export const UsernameForm = () => {
  const { inviteCode } = useParams();
  const { pathname } = useLocation();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const theme = useCustomTheme();
  const navigate = useNavigate();

  useEffect(() => {
    setError("");
  }, [username]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      try {
        if (username.length < MIN_LENGTH) {
          throw new Error(
            `The username must be at least ${MIN_LENGTH} characters.`
          );
        } else if (username.length > MAX_LENGTH) {
          throw new Error(
            `The username must not be longer than ${MAX_LENGTH} characters.`
          );
        }
        const res = await fetch(`https://auth.xnfts.dev/users/${username}`, {
          headers: {
            "x-backpack-invite-code": String(inviteCode),
            "x-backpack-waitlist-id": getWaitlistId() || "",
          },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message);

        navigate(`${pathname}/${username}`);
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
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "0 16px 16px",
      }}
    >
      <Box style={{ padding: 8, flex: 1 }}>
        <Header text="Claim your username" />
        <SubtextParagraph style={{ margin: "16px 0" }}>
          Others can see and find you by this username.
          <br />
          <br />
          It will also be associated with your primary wallet address, so choose
          wisely if you’d like to remain anonymous.
          <br />
          <br />
          It should be {[MIN_LENGTH, MAX_LENGTH].join("-")} characters and it
          can contain letters, numbers and underscores.
          <br />
          <br />
          You will not be able to change it yet.
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
            setUsername(
              v
                .toLowerCase()
                .replace(/[^a-z0-9_]/g, "")
                .substring(0, MAX_LENGTH)
            );
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
