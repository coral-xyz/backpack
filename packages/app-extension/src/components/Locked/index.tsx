import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { useCustomTheme } from "@coral-xyz/themes";
import { UI_RPC_METHOD_KEYRING_STORE_UNLOCK } from "@coral-xyz/common";
import { useBackgroundClient, useUsername } from "@coral-xyz/recoil";
import { TextField, PrimaryButton } from "../common";
import { RedBackpack, Backpack } from "../common/Icon";
import { LockedMenu } from "./LockedMenu";

export const NAV_BAR_HEIGHT = 56;

export function Locked({ onUnlock }: { onUnlock?: () => Promise<void> }) {
  const theme = useCustomTheme();
  const background = useBackgroundClient();
  const username = useUsername();

  const [menuOpen, setMenuOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<boolean>(false);

  const _onUnlock = async (e: any) => {
    e.preventDefault();
    try {
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
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box
        sx={{
          backgroundColor: theme.custom.colors.backdropColor,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
        }}
      >
        <Box>
          <LockedMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
          <BackpackHeader />
        </Box>

        <Box style={{ marginBottom: 84 }}>
          {username && (
            <Box
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
              }}
            >
              <Typography style={{ color: theme.custom.colors.fontColor }}>
                gm @{username}
              </Typography>
            </Box>
          )}

          <form onSubmit={_onUnlock} noValidate>
            <Box sx={{ margin: "0 12px 12px 12px" }}>
              <TextField
                autoFocus={true}
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
              marginTop: "24px",
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
              Forgot Password?
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export function BackpackHeader({
  alphaStyle,
}: {
  alphaStyle?: React.CSSProperties;
}) {
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
      <RedBackpack />
      <Box
        sx={{
          marginTop: "16px",
          display: "flex",
          flexDirection: "row-reverse",
          marginBottom: "4px",
          marginRight: "58px",
          ...alphaStyle,
        }}
      >
        <AlphaLabel />
      </Box>
      <Backpack fill={theme.custom.colors.fontColor} />
      <Typography
        sx={{
          textAlign: "center",
          lineHeight: "24px",
          fontSize: "16px",
          fontWeight: "500",
          color: theme.custom.colors.secondary,
          marginTop: "8px",
        }}
      >
        A home for your xNFTs
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
