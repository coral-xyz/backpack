import { useCustomTheme } from "@coral-xyz/themes";
import { Box, Typography } from "@mui/material";
import { useState } from "react";
import { supabase } from "../../supabase";
import { PrimaryButton, SubtextParagraph, TextField } from "../common";
import { BackpackHeader } from "../common/BackpackHeader";

const v4Regex = new RegExp(
  /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
);

export const InviteCode = ({
  onNext,
  showExistingUserFlow,
}: {
  onNext: (inviteCode: string) => void;
  showExistingUserFlow: any;
}) => {
  const [code, setCode] = useState("");
  const [inviteCodeError, setInviteCodeError] = useState<string>();
  const theme = useCustomTheme();

  const handleSubmit = async () => {
    try {
      const cleanCode = code.trim();

      if (!cleanCode.match(v4Regex)) throw new Error("Invalid invite code");

      const { data, error } = await supabase.rpc("invitation_exists", {
        id: cleanCode,
      });

      if (error) throw new Error(error.message);

      if (data) {
        onNext(cleanCode);
      } else {
        throw new Error("Invite code has been used or does not exist");
      }
    } catch (err: any) {
      setInviteCodeError(err.message);
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
            inputProps={{
              name: "invite-code",
              autoComplete: false,
              spellCheck: false,
            }}
            placeholder="Invite code"
            type="text"
            value={code}
            setValue={setCode}
            isError={inviteCodeError}
            auto
          />
          {inviteCodeError && (
            <Typography sx={{ color: theme.custom.colors.negative }}>
              {inviteCodeError}
            </Typography>
          )}
        </Box>

        <PrimaryButton disabled={!code} label="Go" onClick={handleSubmit} />

        <Box onClick={showExistingUserFlow}>
          <SubtextParagraph style={{ marginTop: "8px" }}>
            I already have an account
          </SubtextParagraph>
        </Box>
      </Box>
    </Box>
  );
};
