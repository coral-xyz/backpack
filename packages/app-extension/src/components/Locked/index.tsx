import { useState } from "react";
import { UI_RPC_METHOD_KEYRING_STORE_UNLOCK } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import {
  Backpack,
  EmptyState,
  PrimaryButton,
  RedBackpack,
  TextInput,
} from "@coral-xyz/react-common";
import {
  isLockAvatarFullScreen,
  useBackgroundClient,
  useBreakpoints,
  useUser,
} from "@coral-xyz/recoil";
import { useTheme, YStack } from "@coral-xyz/tamagui";
import { Error, Visibility, VisibilityOff } from "@mui/icons-material";
import { Box, IconButton, InputAdornment, Typography } from "@mui/material";
import { useRecoilValue } from "recoil";

import { WithDrawer } from "../common/Layout/Drawer";

import { LockedMenu } from "./LockedMenu";

export function Locked({ onUnlock }: { onUnlock?: () => Promise<void> }) {
  const theme = useTheme();
  const background = useBackgroundClient();
  const user = useUser();
  const breakpoints = useBreakpoints();
  const isFullScreenLockAvatar = useRecoilValue(isLockAvatarFullScreen);

  const [migrationFailed, setMigrationFailed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<boolean>(false);
  const { t } = useTranslation();

  const isFullScreen = isFullScreenLockAvatar && breakpoints.isXs;

  const _onUnlock = async (e: any) => {
    e.preventDefault();
    try {
      // ph101pp todo
      await background.request({
        method: UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
        params: [password, user.uuid],
      });

      if (onUnlock) {
        await onUnlock();
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
          backgroundColor: theme.baseBackgroundL0.val,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
        }}
      >
        <Box>
          <LockedMenu
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            isFullScreen={isFullScreen}
          />
          <div style={{ marginTop: "24px" }}>
            <BackpackHeader forceWhite={isFullScreen} style={{ zIndex: 2 }} />
          </div>
        </Box>

        <Box style={{ zIndex: 1, marginBottom: 74 }}>
          <form onSubmit={_onUnlock} noValidate>
            <Box sx={{ margin: "0 12px 12px 12px" }}>
              <TextInput
                autoFocus
                error={error}
                placeholder={t("password")}
                type={showPassword ? "text" : "password"}
                value={password}
                setValue={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      disableRipple
                      sx={{ color: theme.baseIcon.val }}
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
              <PrimaryButton label={t("unlock")} type="submit" />
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
                color: isFullScreen ? "white" : theme.baseTextMedEmphasis.val,
                fontSize: "16px",
                textAlign: "center",
                cursor: "pointer",
                lineHeight: "24px",
                fontWeight: 500,
              }}
              onClick={() => setMenuOpen(true)}
            >
              {t("forgot_password")}
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
    <YStack padding="$4" flex={1} justifyContent="center" alignItems="center">
      <EmptyState
        icon={(props: any) => <Error {...props} />}
        title="Unable to migrate"
        subtitle={
          "Thank you for participating in the Backpack Beta! We weren't able to migrate your account. Please reinstall Backpack to continue. Don't worry, this is normal."
        }
      />
    </YStack>
  );
}

export function BackpackHeader({
  forceWhite,
  style,
  disableBackpackLabel,
}: {
  disableUsername?: boolean;
  disableBackpackLabel?: boolean;
  forceWhite?: boolean;
  style?: React.CSSProperties;
}) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        marginTop: "16px",
        marginLeft: "auto",
        marginRight: "auto",
        display: "block",
        position: "relative",
        ...style,
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
      {!disableBackpackLabel ? (
        <Backpack
          fill={forceWhite ? "white" : theme.baseTextHighEmphasis.val}
        />
      ) : null}
      <Typography
        sx={{
          textAlign: "center",
          lineHeight: "24px",
          fontSize: "16px",
          fontWeight: "500",
          color: forceWhite ? "white" : theme.baseTextMedEmphasis.val,
          marginTop: "8px",
        }}
      />
    </Box>
  );
}
