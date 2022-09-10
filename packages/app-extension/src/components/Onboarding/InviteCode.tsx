import { useCustomTheme } from "@coral-xyz/themes";
import { Box, Typography } from "@mui/material";
import { useState } from "react";
import { Header, PrimaryButton, SubtextParagraph, TextField } from "../common";

export const InviteCode = ({
  onNext,
}: {
  onNext: (inviteCode: string) => void;
}) => {
  const [code, setCode] = useState("");
  const [inviteCodeError, setInviteCodeError] = useState<string>();
  const theme = useCustomTheme();

  const handleSubmit = async () => {
    // TODO: check invite code is valid in background script
    if (code === "test") {
      onNext(code);
    } else {
      setInviteCodeError("Invalid invite code");
    }
  };

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
          <Header text="Enter your code" />
          <SubtextParagraph style={{ marginTop: "8px", marginBottom: "40px" }}>
            This is the invitation code that you received from Backpack.
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
            inputProps={{ name: "invite-code" }}
            placeholder="Invite code"
            type="text"
            value={code}
            setValue={setCode}
            isError={inviteCodeError}
          />
          {inviteCodeError && (
            <Typography sx={{ color: theme.custom.colors.negative }}>
              {inviteCodeError}
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
        <PrimaryButton disabled={!code} label="Next" onClick={handleSubmit} />

        <SubtextParagraph style={{ marginTop: "8px", marginBottom: "40px" }}>
          I already have an account
        </SubtextParagraph>
      </Box>
    </Box>
  );
};
