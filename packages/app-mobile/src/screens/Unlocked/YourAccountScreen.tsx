import { useKeyringHasMnemonic } from "@coral-xyz/recoil";

import { Screen } from "~components/index";
import { SettingsList } from "~screens/Unlocked/Settings/components/SettingsMenuList";

export function YourAccountScreen({ navigation }): JSX.Element {
  const hasMnemonic = useKeyringHasMnemonic();

  const menuItems = {
    "Change Password": {
      onPress: () => navigation.push("change-password"),
    },
    ...(hasMnemonic
      ? {
          "Show Secret Recovery Phrase": {
            onPress: () => navigation.push("show-secret-phrase-warning"),
          },
        }
      : {}),
    "Log out": {
      onPress: () => navigation.push("reset-warning"),
    },
  };

  return (
    <Screen>
      <SettingsList menuItems={menuItems} />
    </Screen>
  );
}
