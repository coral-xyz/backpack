import { useEffect } from "react";
import useTheme from "@mui/styles/useTheme";
import { useDrawerContext } from "../../Layout/Drawer";
import { useNavStack } from "../../Layout/NavStack";
import { SettingsList } from "../../common/Settings/List";

export function YourAccount() {
  const { close } = useDrawerContext();
  const nav = useNavStack();
  const theme = useTheme() as any;

  const menuItems = {
    "Change password": {
      onClick: () => nav.push("change-password"),
    },
    "Edit wallets": {
      onClick: () => nav.push("edit-wallets"),
    },
    "Show private key": {
      onClick: () => nav.push("show-private-key-warning"),
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
    nav.setStyle({
      borderBottom: `solid 1pt ${theme.custom.colors.border}`,
    });
  }, []);

  return <SettingsList menuItems={menuItems} />;
}
