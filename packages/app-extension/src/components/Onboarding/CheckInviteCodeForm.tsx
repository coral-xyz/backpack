import { useCustomTheme } from "@coral-xyz/themes";
import { Box, Typography } from "@mui/material";
import { FormEvent, useEffect, useState } from "react";
import { PrimaryButton, SubtextParagraph, TextField } from "../common";

const CheckInviteCodeForm = ({ setInviteCode }: any) => {
  const [value, setValue] = useState("");
  const [hasAccount, setHasAccount] = useState(false);
  const [error, setError] = useState<string>();
  const theme = useCustomTheme();

  // reset textfield value when switching between enter invite code or username
  useEffect(() => {
    setValue("");
  }, [hasAccount]);

  // reset error when textfield value or the form changes
  useEffect(() => {
    setError(undefined);
  }, [value, hasAccount]);

  const ob = hasAccount
    ? {
        linkText: "I have an Invite Code",
        inputName: "username",
        placeholder: "Username",
        buttonText: "Continue",
        url: `https://auth.backpack.workers.dev/users/${value}`, // not live yet
        setVal: (v: string) => setValue(v.replace(/[^a-z0-9_]/g, "")),
      }
    : {
        linkText: "I already have an account",
        inputName: "inviteCode",
        placeholder: "Invite Code",
        buttonText: "Go",
        url: `https://invites.backpack.workers.dev/check/${value}`,
        setVal: (v: string) => setValue(v.replace(/[^a-zA-Z0-9\\-]/g, "")),
      };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(ob.url);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setInviteCode(value);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box style={{ marginBottom: 8 }}>
        <TextField
          inputProps={{
            name: ob.inputName,
            autoComplete: false,
            spellCheck: false,
          }}
          placeholder={ob.placeholder}
          type="text"
          value={value}
          setValue={ob.setVal}
          isError={error}
          auto
        />
        {error && (
          <Typography sx={{ color: theme.custom.colors.negative }}>
            {error}
          </Typography>
        )}
      </Box>
      <PrimaryButton disabled={!value} label={ob.buttonText} type="submit" />

      <Box
        style={{ marginTop: 16, cursor: "pointer" }}
        onClick={() => alert("open application form")}
      >
        <SubtextParagraph>Apply for an Invite Code</SubtextParagraph>
      </Box>

      <Box
        onClick={() => setHasAccount(!hasAccount)}
        style={{ marginTop: 16, cursor: "pointer" }}
      >
        <SubtextParagraph>{ob.linkText}</SubtextParagraph>
      </Box>
    </form>
  );
};

export default CheckInviteCodeForm;
