import { Screen } from "@components";
import { useKeyringType } from "@coral-xyz/recoil";
import { SettingsList } from "@screens/Unlocked/Settings/components/SettingsMenuList";

export function YourAccountScreen({ navigation }) {
  const keyringType = useKeyringType();

  const menuItems = {
    "Change Password": {
      onPress: () => navigation.push("change-password"),
    },
    ...(keyringType === "mnemonic"
      ? {
          "Show Secret Recovery Phrase": {
            onPress: () => navigation.push("show-secret-phrase-warning"),
          },
        }
      : {}),
    Logout: {
      onPress: () => navigation.push("reset-warning"),
    },
  };

  return (
    <Screen>
      <SettingsList menuItems={menuItems} />
    </Screen>
  );
}
