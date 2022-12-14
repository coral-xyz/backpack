import { Screen } from "@components";
import { useKeyringType } from "@coral-xyz/recoil";
import { SettingsList } from "@screens/Unlocked/Settings/components/SettingsMenuList";

function FieldTextInput() {}

export function YourAccountScreen({ navigation }) {
  const keyringType = useKeyringType();

  const menuItems = {
    "Change Password": {
      onPress: () => navigation.push("change-password"),
    },
    "Edit Wallets": {
      onPress: () => navigation.push("edit-wallets"),
    },
    ...(keyringType === "mnemonic"
      ? {
          "Show Secret Recovery Phrase": {
            onPress: () => navigation.push("show-secret-phrase-warning"),
          },
        }
      : {}),
    Logout: {
      onPress: () => navigation.push("logout"),
    },
  };

  return (
    <Screen>
      <SettingsList menuItems={menuItems} />
    </Screen>
  );
}
