import { useEffect } from "react";
import { Typography, Switch } from "@mui/material";
import {
  Blockchain,
  BACKPACK_FEATURE_LIGHT_MODE,
  BACKPACK_CONFIG_VERSION,
  UI_RPC_METHOD_SETTINGS_DARK_MODE_UPDATE,
} from "@coral-xyz/common";
import { useCustomTheme, styles } from "@coral-xyz/themes";
import {
  useBackgroundClient,
  useBlockchainLogo,
  useDarkMode,
  useEnabledBlockchains,
} from "@coral-xyz/recoil";
import { useNavStack } from "../../../common/Layout/NavStack";
import { SettingsList } from "../../../common/Settings/List";

export function Preferences() {
  const theme = useCustomTheme();
  const nav = useNavStack();
  const background = useBackgroundClient();
  const isDarkMode = useDarkMode();
  const enabledBlockchains = useEnabledBlockchains();

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
    "Trusted Sites": {
      onClick: () => nav.push("preferences-trusted-sites"),
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
