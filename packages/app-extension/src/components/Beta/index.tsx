import { useCustomTheme } from "@coral-xyz/themes";
import { Box } from "@mui/material";
import { createPopup } from "@typeform/embed";
import fetch from "isomorphic-fetch";
import { useState, useCallback } from "react";
import { PrimaryButton, TextField } from "../common";

import "@typeform/embed/build/css/popup.css";

export function BetaInviteLocked() {
  const theme = useCustomTheme();
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState(false);
  const typeform = createPopup("PCnBjycW");

  const handleCodeSubmit = useCallback(async () => {
    try {
      const resp = await fetch(`https://invites.backpack.app/${inviteCode}`);
      const respJson = await resp.json();
      console.log(respJson);

      // TODO: push to onboarding
    } catch (err) {
      console.error(err);
      setError(true);
    }
  }, [inviteCode]);

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
      <Box sx={{}}>
        <form onSubmit={handleCodeSubmit} noValidate>
          <Box sx={{ margin: "0 12px 12px 12px" }}>
            <TextField
              autoFocus
              type="text"
              placeholder="Invite Code"
              isError={error}
              value={inviteCode}
              setValue={setInviteCode}
            />
          </Box>
          <Box sx={{ mx: "12px" }}>
            <PrimaryButton label="Submit" type="submit" />
          </Box>
        </form>
        <Box sx={{ mx: "12px" }}>
          <PrimaryButton label="Join the Waitlist!" onClick={typeform.open} />
        </Box>
      </Box>
    </Box>
  );
}
