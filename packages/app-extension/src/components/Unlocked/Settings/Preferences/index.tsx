/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import {
  BACKPACK_FEATURE_AGGREGATE_WALLETS,
  BACKPACK_FEATURE_LIGHT_MODE,
  Blockchain,
  UI_RPC_METHOD_SETTINGS_AGGREGATE_WALLETS_UPDATE,
  UI_RPC_METHOD_SETTINGS_DARK_MODE_UPDATE,
  UI_RPC_METHOD_SETTINGS_DEVELOPER_MODE_UPDATE,
} from "@coral-xyz/common";
import {
  getBlockchainLogo,
  useBackgroundClient,
  useDarkMode,
  useDeveloperMode,
  useIsAggregateWallets,
} from "@coral-xyz/recoil";
import { styles } from "@coral-xyz/themes";
import { Switch } from "@mui/material";

import {
  deleteSubscription,
  hasActiveSubscription,
  unregisterNotificationServiceWorker,
} from "../../../../permissions/utils";
import { useNavigation } from "../../../common/Layout/NavStack";
import { SettingsList } from "../../../common/Settings/List";

export function Preferences() {
  const nav = useNavigation();
  const background = useBackgroundClient();
  const isDarkMode = useDarkMode();
  const isDeveloperMode = useDeveloperMode();
  const isAggregateWallets = useIsAggregateWallets();
  const [isNotificationsOn, setIsNotificationsOn] = useState(false);

  useEffect(() => {
    hasActiveSubscription()
      .then((status) => {
        setIsNotificationsOn(
          window.Notification.permission === "granted" && status
        );
      })
      .catch(console.error);
  }, [window.Notification.permission]);

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

  const onAggregateWalletsSwitch = async (isAggregateWallets: boolean) => {
    await background.request({
      method: UI_RPC_METHOD_SETTINGS_AGGREGATE_WALLETS_UPDATE,
      params: [isAggregateWallets],
    });
  };

  const onNotificationsSwitch = async (isNotificationsEnabled: boolean) => {
    if (isNotificationsEnabled) {
      setIsNotificationsOn(true);
      window.open(
        "/permissions.html?notifications=true",
        "_blank",
        "noreferrer"
      );
    } else {
      await deleteSubscription();
      await unregisterNotificationServiceWorker();
      setIsNotificationsOn(false);
    }
  };

  //
  // Global.
  //
  const menuItems: any = {
    "Auto-Lock Timer": {
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

  menuItems["Notifications"] = {
    onClick: () => onNotificationsSwitch(!isNotificationsOn),
    detail: (
      <ModeSwitch
        enabled={isNotificationsOn}
        onSwitch={(enabled) => onNotificationsSwitch(enabled)}
      />
    ),
  };

  if (BACKPACK_FEATURE_AGGREGATE_WALLETS) {
    menuItems["Aggregate Wallets"] = {
      onClick: () => onAggregateWalletsSwitch(!isAggregateWallets),
      detail: (
        <ModeSwitch
          enabled={isAggregateWallets}
          onSwitch={(enabled) => onAggregateWalletsSwitch(enabled)}
        />
      ),
    };
  }

  const blockchainMenuItems: any = {
    Solana: {
      onClick: () => nav.push("preferences-solana"),
      icon: () => {
        const blockchainLogo = getBlockchainLogo(Blockchain.SOLANA);
        return (
          <img
            src={blockchainLogo}
            style={{
              width: "12px",
              height: "12px",
              marginRight: "8px",
            }}
          />
        );
      },
    },
    Ethereum: {
      onClick: () => nav.push("preferences-ethereum"),
      icon: () => {
        const blockchainLogo = getBlockchainLogo(Blockchain.ETHEREUM);
        return (
          <img
            src={blockchainLogo}
            style={{
              width: "12px",
              height: "12px",
              marginRight: "8px",
            }}
          />
        );
      },
    },
  };

  useEffect(() => {
    nav.setOptions({ headerTitle: "Preferences" });
  }, []);

  return (
    <div>
      <SettingsList menuItems={menuItems} />
      <SettingsList menuItems={blockchainMenuItems as any} />
    </div>
  );
}

export function ModeSwitch({
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
      disableRipple
      disabled={disableUiState}
      checked={enabled}
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
      backgroundColor: "transparent !important",
      "@media (hover: none)": {
        backgroundColor: "transparent !important",
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
