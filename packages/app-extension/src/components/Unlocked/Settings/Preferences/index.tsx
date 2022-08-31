import { useEffect } from "react";
import { Typography, Switch } from "@mui/material";
import {
  BACKPACK_FEATURE_LIGHT_MODE,
  BACKPACK_CONFIG_VERSION,
  UI_RPC_METHOD_SETTINGS_DARK_MODE_UPDATE,
} from "@coral-xyz/common";
import { useCustomTheme, styles } from "@coral-xyz/themes";
import { useDarkMode, useBackgroundClient } from "@coral-xyz/recoil";
import { useNavStack } from "../../../common/Layout/NavStack";
import { SettingsList } from "../../../common/Settings/List";

export function Preferences() {
  const theme = useCustomTheme();
  const nav = useNavStack();
  const background = useBackgroundClient();
  const isDarkMode = useDarkMode();

  useEffect(() => {
    nav.setStyle({
      borderBottom: `solid 1pt ${theme.custom.colors.border}`,
    });
    nav.setContentStyle({
      backgroundColor: theme.custom.colors.background,
    });
  }, [nav.setContentStyle, theme]);

  const onDarkModeSwitch = async (isDarkMode: boolean) => {
    await background.request({
      method: UI_RPC_METHOD_SETTINGS_DARK_MODE_UPDATE,
      params: [isDarkMode],
    });
  };

  //
  // Global.
  //
  const menuItems: any = {
    "Auto-lock timer": {
      onClick: () => nav.push("preferences-auto-lock"),
    },
    "Trusted Apps": {
      onClick: () => nav.push("preferences-trusted-apps"),
    },
  };

  if (BACKPACK_FEATURE_LIGHT_MODE) {
    menuItems["Dark Mode"] = {
      onClick: () => onDarkModeSwitch(!isDarkMode),
      detail: (
        <DarkModeSwitch
          onSwitch={(isDarkMode) => onDarkModeSwitch(isDarkMode)}
        />
      ),
    };
  }

  //
  // Solana.
  //
  const solanaMenuItems = {
    "RPC Connection": {
      onClick: () => nav.push("preferences-solana-rpc-connection"),
    },
    "Confirmation Commitment": {
      onClick: () => nav.push("preferences-solana-commitment"),
    },
    Explorer: {
      onClick: () => nav.push("preferences-solana-explorer"),
    },
  };

  //
  // Build version.
  //
  const buildMenuItems = {
    Version: {
      onClick: () => {},
      detail: (
        <Typography style={{ color: theme.custom.colors.secondary }}>
          {BACKPACK_CONFIG_VERSION}
        </Typography>
      ),
    },
  };

  useEffect(() => {
    nav.setTitle("Preferences");
    nav.setStyle({
      borderBottom: `solid 1pt ${theme.custom.colors.border}`,
    });
  }, []);

  return (
    <div>
      <SettingsList menuItems={menuItems} />
      <SettingsList menuItems={solanaMenuItems} />
      <SettingsList menuItems={buildMenuItems} />
    </div>
  );
}

function DarkModeSwitch({
  onSwitch,
}: {
  onSwitch: (isDarkMode: boolean) => void;
}) {
  const isDarkMode = useDarkMode();
  return (
    <SwitchToggle enabled={isDarkMode} onChange={() => onSwitch(!isDarkMode)} />
  );
}

export function SwitchToggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: () => void;
}) {
  const classes = useStyles();
  return (
    <Switch
      checked={enabled}
      disableRipple
      onChange={onChange}
      classes={{
        switchBase: classes.switchBase,
        track: enabled ? classes.trackChecked : classes.track,
        colorPrimary: classes.colorPrimary,
      }}
    />
  );
}

const useStyles = styles((theme) => ({
  switchBase: {
    "&:hover": {
      backgroundColor: "transparent",
      "@media (hover: none)": {
        backgroundColor: "transparent",
      },
    },
  },
  colorPrimary: {
    "&.Mui-checked": {
      color: theme.custom.colors.activeNavButton,
    },
  },
  track: {},
  trackChecked: {
    backgroundColor: `${theme.custom.colors.activeNavButton} !important`,
  },
}));
