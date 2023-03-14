import { Alert } from "react-native";

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
    "Delete account": {
      onPress: () =>
        Alert.alert(
          "Delete Account",
          "Please email us at support@backpack.app with your username and public keys and we'll delete your account."
        ),
    },
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
