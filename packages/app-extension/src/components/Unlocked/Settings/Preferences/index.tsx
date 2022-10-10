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
    "Trusted Apps": {
      onClick: () => nav.push("preferences-trusted-apps"),
    },
    Blockchains: {
      onClick: () => nav.push("preferences-blockchains"),
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

  // Filter blockchain menu items to only those for enabled blockchains
  const filteredBlockchainMenuItems = Object.fromEntries(
    Object.entries(blockchainMenuItems).filter(([key]) =>
      enabledBlockchains.includes(key.toLowerCase())
    )
  );

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
      <SettingsList menuItems={filteredBlockchainMenuItems as any} />
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
      color: theme.custom.colors.brandColor,
    },
  },
  track: {},
  trackChecked: {
    backgroundColor: `${theme.custom.colors.brandColor} !important`,
  },
}));
