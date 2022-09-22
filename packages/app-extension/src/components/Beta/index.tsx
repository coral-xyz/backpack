import { useCustomTheme } from "@coral-xyz/themes";
import { Box } from "@mui/material";
import { PopupButton } from "@typeform/embed-react";
import { type CSSProperties, useState } from "react";
import { TextField } from "../common";

export function BetaInviteLocked() {
  const theme = useCustomTheme();
  const [inviteCode, setInviteCode] = useState("");

  return (
    <Box
      sx={{
        padding: "12px",
        backgroundColor: theme.custom.colors.nav,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box>
        <TextField
          autoFocus
          placeholder="Invite Code"
          type="text"
          value={inviteCode}
          setValue={setInviteCode}
        />
      </Box>
      <PopupButton id="PCnBjycW" style={btnStyles}>
        Join the Waitlist!
      </PopupButton>
    </Box>
  );
}

const btnStyles: CSSProperties = {
  border: "none",
  borderRadius: 12,
  height: 48,
  width: "100%",
};
