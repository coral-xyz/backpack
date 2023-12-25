/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import type { Blockchain } from "@coral-xyz/common";
import {
  BACKPACK_FEATURE_AGGREGATE_WALLETS,
  UI_RPC_METHOD_SETTINGS_AGGREGATE_WALLETS_UPDATE,
} from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import {
  enabledBlockchainConfigsAtom,
  getBlockchainLogo,
  useBackgroundClient,
  useIsAggregateWallets,
} from "@coral-xyz/recoil";
import { temporarilyMakeStylesForBrowserExtension } from "@coral-xyz/tamagui";
import { Switch } from "@mui/material";
import { useRecoilValue } from "recoil";

import { useNavigation } from "../../../common/Layout/NavStack";
import { SettingsList } from "../../../common/Settings/List";

const useStyles = temporarilyMakeStylesForBrowserExtension((theme) => ({
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
      color: theme.accentBlue.val,
    },
  },
  disabled: {
    "&.Mui-checked": {
      color: `${theme.accentBlue.val} !important`,
      opacity: 0.5,
    },
  },
  track: {},
  trackChecked: {
    backgroundColor: `${theme.accentBlue.val} !important`,
  },
}));

export function Preferences() {
  const nav = useNavigation();
  const background = useBackgroundClient();
  const isAggregateWallets = useIsAggregateWallets();
  const enabledBlockchainConfigs = useRecoilValue(enabledBlockchainConfigsAtom);
  const { t } = useTranslation();

  const onAggregateWalletsSwitch = async (isAggregateWallets: boolean) => {
    // ph101pp todo
    await background.request({
      method: UI_RPC_METHOD_SETTINGS_AGGREGATE_WALLETS_UPDATE,
      params: [isAggregateWallets],
    });
  };

  //
  // Global.
  //
  const menuItems: any = {
    [t("auto_lock_timer")]: {
      onClick: () => nav.push("preferences-auto-lock"),
    },
    [t("trusted_sites")]: {
      onClick: () => nav.push("preferences-trusted-sites"),
    },
    [t("language")]: {
      onClick: () => nav.push("preferences-language"),
    },
    [t("hidden_tokens")]: {
      onClick: () => nav.push("preferences-hidden-tokens"),
    },
  };

  // if (BACKPACK_FEATURE_LIGHT_MODE) {
  //   menuItems[t("dark_mode")] = {
  //     onClick: () => onDarkModeSwitch(!isDarkMode),
  //     detail: (
  //       <ModeSwitch
  //         enabled={isDarkMode}
  //         onSwitch={(enabled) => onDarkModeSwitch(enabled)}
  //       />
  //     ),
  //   };
  // }

  /*
  menuItems[t("developer_mode")] = {
    onClick: () => onDeveloperModeSwitch(!isDeveloperMode),
    detail: (
      <ModeSwitch
        enabled={isDeveloperMode}
        onSwitch={(enabled) => onDeveloperModeSwitch(enabled)}
      />
    ),
  };

  menuItems[t("full_screen_avatar")] = {
    onClick: () => onFullScreenLockSwitch(!isFullScreenLockAvatar),
    detail: (
      <ModeSwitch
        enabled={isFullScreenLockAvatar}
        onSwitch={(enabled) => onFullScreenLockSwitch(enabled)}
      />
    ),
  };
  */

  if (BACKPACK_FEATURE_AGGREGATE_WALLETS) {
    menuItems["aggregate_wallets"] = {
      onClick: () => onAggregateWalletsSwitch(!isAggregateWallets),
      detail: (
        <ModeSwitch
          enabled={isAggregateWallets}
          onSwitch={(enabled) => onAggregateWalletsSwitch(enabled)}
        />
      ),
    };
  }

  const blockchainMenuItems: any = Object.fromEntries(
    new Map(
      Object.entries(enabledBlockchainConfigs).map(([blockchain, config]) => {
        return [
          config.Name,
          {
            onClick: () => nav.push("preferences-blockchain", { blockchain }),
            icon: () => {
              const blockchainLogo = getBlockchainLogo(
                blockchain as Blockchain
              );
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
        ];
      })
    )
  );

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
