import { useEffect } from "react";
import { useKeyringType } from "@coral-xyz/recoil";

import { useNavStack } from "../../../common/Layout/NavStack";
import { SettingsList } from "../../../common/Settings/List";

export function YourAccount() {
  const nav = useNavStack();
  const keyringType = useKeyringType();

  const menuItems = {
    "Change Password": {
      onClick: () => nav.push("change-password"),
    },
    ...(keyringType === "mnemonic"
      ? {
          "Show Secret Recovery Phrase": {
            onClick: () => nav.push("show-secret-phrase-warning"),
          },
        }
      : {}),
    Logout: {
      onClick: () => nav.push("logout"),
    },
  };

  useEffect(() => {
    nav.setTitle("Your Account");
  }, []);

  return <SettingsList menuItems={menuItems} />;
}
