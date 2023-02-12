import { useState } from "react";
import { UI_RPC_METHOD_KEYRING_STORE_UNLOCK } from "@coral-xyz/common";
import {
  Backpack,
  EmptyState,
  PrimaryButton,
  ProxyImage,
  RedBackpack,
  TextInput,
} from "@coral-xyz/react-common";
import { useAvatarUrl, useBackgroundClient, useUser } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { Error, Visibility, VisibilityOff } from "@mui/icons-material";
import { Box, IconButton, InputAdornment, Typography } from "@mui/material";

import { WithDrawer } from "../common/Layout/Drawer";

import { LockedMenu } from "./LockedMenu";

export const NAV_BAR_HEIGHT = 56;

export function Locked({ onUnlock }: { onUnlock?: () => Promise<void> }) {
  const theme = useCustomTheme();
  const background = useBackgroundClient();
  const user = useUser();
  const avatarUrl = useAvatarUrl(120, user.username);

  const [migrationFailed, setMigrationFailed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<boolean>(false);

  const _onUnlock = async (e: any) => {
    e.preventDefault();
    try {
      console.log("ARMANI HERE USER", user);
      await background.request({
        method: UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
        params: [password, user.uuid],
      });

      if (onUnlock) {
        onUnlock();
      }
    } catch (err) {
      console.error(err);
      // @ts-ignore
      if (err.toString().includes("migration failed:")) {
        setMigrationFailed(true);
        return;
      }
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
          backgroundColor: theme.custom.colors.backgroundBackdrop,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
        }}
      >
        <Box>
          <LockedMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
          <div style={{ marginTop: "24px" }}>
            <BackpackHeader />
            <div
              style={{
                position: "relative",
              }}
            >
              <div style={{}}>
                <ProxyImage
                  src={avatarUrl}
                  style={{
                    height: "120px",
                    width: "120px",
                    borderRadius: "60px",
                    position: "absolute",
                    bottom: -152,
                    transform: "translate(-50%, 0%)",
                    transformOrigin: undefined,
                    display: "inline",
                  }}
                />
              </div>
            </div>
          </div>
        </Box>

        <Box style={{ marginBottom: 74 }}>
          <form onSubmit={_onUnlock} noValidate>
            <Box sx={{ margin: "0 12px 12px 12px" }}>
              <TextInput
                autoFocus={true}
                error={error}
                placeholder={"Password"}
                type={showPassword ? "text" : "password"}
                value={password}
                setValue={(e) => setPassword(e.target.value)}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      disableRipple
                      sx={{ color: theme.custom.colors.icon }}
                      onClick={() => setShowPassword(!showPassword)}
                      onMouseDown={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
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
      <WithDrawer openDrawer={migrationFailed} setOpenDrawer={() => {}}>
        <MigrationFailed />
      </WithDrawer>
    </Box>
  );
}

function MigrationFailed() {
  return (
    <div
      style={{
        height: "100%",
      }}
    >
      <EmptyState
        icon={(props: any) => <Error {...props} />}
        title={"Migration Failed"}
        subtitle={"Please reinstall Backpack"}
      />
    </div>
  );
}

export function BackpackHeader({
  disableUsername,
}: {
  disableUsername?: boolean;
}) {
  const theme = useCustomTheme();
  const user = useUser();
  return (
    <Box
      sx={{
        marginTop: "16px",
        marginLeft: "auto",
        marginRight: "auto",
        display: "block",
        position: "relative",
      }}
    >
      <div style={{ display: "flex" }}>
        <RedBackpack
          style={{
            marginBottom: "32px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
      </div>
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
        gm {disableUsername ? "" : `@${user.username}`}
      </Typography>
    </Box>
  );
}
