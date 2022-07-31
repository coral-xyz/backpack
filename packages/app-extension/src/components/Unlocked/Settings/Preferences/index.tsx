import { useEffect } from "react";
import { Switch } from "@mui/material";
import { UI_RPC_METHOD_SETTINGS_DARK_MODE_UPDATE } from "@coral-xyz/common";
import { useCustomTheme } from "@coral-xyz/themes";
import { useDarkMode, useBackgroundClient } from "@coral-xyz/recoil";
import { useNavStack } from "../../../common/Layout/NavStack";
import { SettingsList } from "../../../common/Settings/List";

export function Preferences() {
  const theme = useCustomTheme();
  const nav = useNavStack();
  const background = useBackgroundClient();
  const isDarkMode = useDarkMode();

  const onDarkModeSwitch = async (isDarkMode: boolean) => {
    await background.request({
      method: UI_RPC_METHOD_SETTINGS_DARK_MODE_UPDATE,
      params: [isDarkMode],
    });
  };

  //
  // Global.
  //
  const menuItems = {
    "Auto-lock timer": {
      onClick: () => nav.push("preferences-auto-lock"),
    },
    "Trusted Apps": {
      onClick: () => nav.push("preferences-trusted-apps"),
    },
    "Dark Mode": {
      onClick: () => onDarkModeSwitch,
      detail: (
        <DarkModeSwitch
          isDarkMode={isDarkMode}
          onSwitch={(isDarkMode) => onDarkModeSwitch(isDarkMode)}
        />
      ),
    },
  };

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
    </div>
  );
}

function DarkModeSwitch({
  isDarkMode,
  onSwitch,
}: {
  isDarkMode: boolean;
  onSwitch: (isDarkMode: boolean) => void;
}) {
  return <Switch disableRipple onChange={(v) => onSwitch(!isDarkMode)} />;
}
