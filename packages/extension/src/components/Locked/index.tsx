import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useCustomTheme } from "@coral-xyz/themes";
import {
  getBackgroundClient,
  UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
} from "@coral-xyz/common";
import { TextField, PrimaryButton } from "../common";
import { LockedMenu } from "./LockedMenu";
import { WithEphemeralNav } from "../Layout/NavEphemeral";
import { useEphemeralNav } from "@coral-xyz/recoil";

export const NAV_BAR_HEIGHT = 56;

export function Locked({ onUnlock }: { onUnlock?: () => Promise<void> }) {
  const theme = useCustomTheme();
  return (
    <Box
      sx={{
        backgroundColor: theme.custom.colors.nav,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <WithEphemeralNav
        title=""
        navbarStyle={{
          borderBottom: "none",
        }}
      >
        <LockedInner />
      </WithEphemeralNav>
    </Box>
  );
}

function LockedInner({ onUnlock }: { onUnlock?: () => Promise<void> }) {
  const theme = useCustomTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<boolean>(false);
  const { setNavButtonRight } = useEphemeralNav();

  useEffect(() => {
    setNavButtonRight(
      <LockedMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
    );
  }, [menuOpen, setMenuOpen]);

  const _onUnlock = async (e: any) => {
    e.preventDefault();
    try {
      const background = getBackgroundClient();
      await background.request({
        method: UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
        params: [password],
      });

      if (onUnlock) {
        onUnlock();
      }
    } catch (err) {
      setError(true);
    }
  };
  return (
    <Box
      sx={{
        backgroundColor: theme.custom.colors.nav,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
      }}
    >
      <BackpackHeader />
      <Box sx={{ marginBottom: "84px" }}>
        <form onSubmit={_onUnlock}>
          <Box sx={{ mb: "12px " }}>
            <TextField
              isError={error}
              placeholder={"Password"}
              type={"password"}
              value={password}
              setValue={setPassword}
            />
          </Box>
          <Box sx={{ mx: "12px" }}>
            <PrimaryButton label="Unlock" type="submit" />
          </Box>
        </form>
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            display: error ? "block" : "none",
            mt: "12px",
          }}
        >
          <Typography
            sx={{
              color: theme.custom.colors.secondary,
              fontSize: "16px",
              textAlign: "center",
              cursor: "pointer",
              lineHeight: "24px",
              fontWeight: 500,
            }}
            onClick={() => setMenuOpen(true)}
          >
            Forgot your password?
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export function BackpackHeader() {
  const theme = useCustomTheme();
  return (
    <Box
      sx={{
        marginTop: "40px",
        marginLeft: "auto",
        marginRight: "auto",
        display: "block",
        position: "relative",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row-reverse",
          marginBottom: "4px",
          marginRight: "-30px",
        }}
      >
        <AlphaLabel />
      </Box>
      <Box sx={{ w: "200px", display: "block" }}>
        <img src="/backpack.svg" />
      </Box>
      <Typography
        sx={{
          textAlign: "center",
          lineHeight: "24px",
          fontSize: "16px",
          fontWeight: "500",
          color: theme.custom.colors.secondary,
          marginTop: "16px",
        }}
      >
        Backpack.app
      </Typography>
    </Box>
  );
}

function AlphaLabel() {
  const theme = useCustomTheme();
  return (
    <Box
      sx={{
        borderRadius: "10px",
        border: `solid 1pt ${theme.custom.colors.alpha}`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: "20px",
        width: "53px",
      }}
    >
      <Typography
        sx={{
          color: theme.custom.colors.alpha,
          fontSize: "12px",
          lineHeight: "16px",
          textAlign: "center",
          fontWeight: 500,
        }}
      >
        Alpha
      </Typography>
    </Box>
  );
}
