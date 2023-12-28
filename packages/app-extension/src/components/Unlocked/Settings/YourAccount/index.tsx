import { useEffect } from "react";
import { useTranslation } from "@coral-xyz/i18n";
import { useKeyringHasMnemonic } from "@coral-xyz/recoil";

import { useNavigation } from "../../../common/Layout/NavStack";
import { SettingsList } from "../../../common/Settings/List";

export function YourAccount() {
  const nav = useNavigation();
  const hasMnemonic = useKeyringHasMnemonic();
  const { t } = useTranslation();

  const menuItems = {
    [t("update_account_name")]: {
      onClick: () => nav.push("update-username"),
    },
    [t("change_password")]: {
      onClick: () => nav.push("change-password"),
    },
    ...(hasMnemonic
      ? {
          [t("show_recovery_phrase")]: {
            onClick: () => nav.push("show-secret-phrase-warning"),
          },
        }
      : {}),
    [t("remove")]: {
      onClick: () => nav.push("logout"),
    },
  };

  useEffect(() => {
    nav.setOptions({ headerTitle: "Your Account" });
  }, []);

  return <SettingsList menuItems={menuItems} />;
}
