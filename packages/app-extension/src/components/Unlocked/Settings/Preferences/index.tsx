import { useEffect } from "react";
import { Typography, Switch } from "@mui/material";
import {
  Blockchain,
  BACKPACK_FEATURE_LIGHT_MODE,
  BACKPACK_CONFIG_VERSION,
  UI_RPC_METHOD_SETTINGS_DARK_MODE_UPDATE,
  UI_RPC_METHOD_SETTINGS_DEVELOPER_MODE_UPDATE,
} from "@coral-xyz/common";
import { useCustomTheme, styles } from "@coral-xyz/themes";
import {
  useBackgroundClient,
  useBlockchainLogo,
  useDarkMode,
  useDeveloperMode,
} from "@coral-xyz/recoil";
import { useNavStack } from "../../../common/Layout/NavStack";
import { SettingsList } from "../../../common/Settings/List";

export function Preferences() {
  const theme = useCustomTheme();
  const nav = useNavStack();
  const background = useBackgroundClient();
  const isDarkMode = useDarkMode();
  const isDeveloperMode = useDeveloperMode();

  const onDarkModeSwitch = async (isDarkMode: boolean) => {
    await background.request({
      method: UI_RPC_METHOD_SETTINGS_DARK_MODE_UPDATE,
      params: [isDarkMode],
    });
  };

  const onDeveloperModeSwitch = async (isDeveloperMode: boolean) => {
    await background.request({
      method: UI_RPC_METHOD_SETTINGS_DEVELOPER_MODE_UPDATE,
      params: [isDeveloperMode],
    });
  };

  //
  // Global.
  //
  const menuItems: any = {
    "Auto-lock timer": {
      onClick: () => nav.push("preferences-auto-lock"),
    },
    "Trusted Sites": {
      onClick: () => nav.push("preferences-trusted-sites"),
    },
  };

  if (BACKPACK_FEATURE_LIGHT_MODE) {
    menuItems["Dark Mode"] = {
      onClick: () => onDarkModeSwitch(!isDarkMode),
      detail: (
        <ModeSwitch
          enabled={isDarkMode}
          onSwitch={(enabled) => onDarkModeSwitch(enabled)}
        />
      ),
    };
  }

  menuItems["Developer Mode"] = {
    onClick: () => onDeveloperModeSwitch(!isDeveloperMode),
    detail: (
      <ModeSwitch
        enabled={isDeveloperMode}
        onSwitch={(enabled) => onDeveloperModeSwitch(enabled)}
      />
    ),
  };

  const blockchainMenuItems: any = {
    Solana: {
      onClick: () => nav.push("preferences-solana"),
      icon: () => {
        const blockchainLogo = useBlockchainLogo(Blockchain.SOLANA);
        return (
          <img
            src={blockchainLogo}
            style={{
              width: "12px",
              height: "12px",
              marginRight: "10px",
            }}
          />
        );
      },
    },
    Ethereum: {
      onClick: () => nav.push("preferences-ethereum"),
      icon: () => {
        const blockchainLogo = useBlockchainLogo(Blockchain.ETHEREUM);
        return (
          <img
            src={blockchainLogo}
            style={{
              width: "12px",
              height: "12px",
              marginRight: "10px",
            }}
          />
        );
      },
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
  }, []);

  return (
    <div>
      <SettingsList menuItems={menuItems} />
      <SettingsList menuItems={blockchainMenuItems as any} />
      <SettingsList menuItems={buildMenuItems} />
    </div>
  );
}

function ModeSwitch({
  enabled,
  onSwitch,
}: {
  enabled: boolean;
  onSwitch: (enabled: boolean) => void;
}) {
  return <SwitchToggle enabled={enabled} onChange={() => onSwitch(!enabled)} />;
}

export function SwitchToggle({
  enabled,
  onChange,
  disableUiState = false,
}: {
  enabled: boolean;
  onChange: () => void;
  disableUiState?: boolean;
}) {
  const classes = useStyles();
  return (
    <Switch
      disabled={disableUiState}
      checked={enabled}
      disableRipple
      onChange={onChange}
      classes={{
        switchBase: classes.switchBase,
        track: enabled ? classes.trackChecked : classes.track,
        colorPrimary: disableUiState ? classes.disabled : classes.colorPrimary,
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
      color: theme.custom.colors.brandColor,
    },
  },
  disabled: {
    "&.Mui-checked": {
      color: `${theme.custom.colors.brandColor} !important`,
      opacity: 0.5,
    },
  },
  track: {},
  trackChecked: {
    backgroundColor: `${theme.custom.colors.brandColor} !important`,
  },
}));
