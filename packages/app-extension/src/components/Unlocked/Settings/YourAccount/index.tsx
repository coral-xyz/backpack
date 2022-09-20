import { useEffect } from "react";
import { useCustomTheme } from "@coral-xyz/themes";
import { useDrawerContext } from "../../../common/Layout/Drawer";
import { useNavStack } from "../../../common/Layout/NavStack";
import { SettingsList } from "../../../common/Settings/List";

export function YourAccount() {
  const { close } = useDrawerContext();
  const nav = useNavStack();

  const menuItems = {
    "Change password": {
      onClick: () => nav.push("change-password"),
    },
    "Edit wallets": {
      onClick: () => nav.push("edit-wallets"),
    },
    "Show secret recovery phrase": {
      onClick: () => nav.push("show-secret-phrase-warning"),
    },
    "Reset wallet": {
      onClick: () => nav.push("reset-warning", { onClose: () => close() }),
    },
  };

  useEffect(() => {
    nav.setTitle("Your Account");
  }, []);

  return <SettingsList menuItems={menuItems} />;
}
