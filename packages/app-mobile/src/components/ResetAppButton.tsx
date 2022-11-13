import { deleteItemAsync } from "expo-secure-store";
import { Alert, DevSettings } from "react-native";

import { CustomButton } from "./CustomButton";

const maybeResetApp = () => {
  Alert.alert(
    "Are your sure?",
    "This will wipe all data that's been stored in the app",
    [
      {
        text: "Yes",
        onPress: () => {
          doReset(true);
        },
      },
      {
        text: "No",
        onPress: () => {
          doReset(false);
        },
      },
    ]
  );
};

const doReset = async (shouldReset: boolean) => {
  if (shouldReset) {
    // TODO: don't manually specify this list of keys
    const stores = [
      "keyring-store",
      "keyname-store",
      "wallet-data",
      "nav-store7",
    ];
    for (const store of stores) {
      try {
        await deleteItemAsync(store);
      } catch (err) {
        // ignore
      }
    }
  }
  DevSettings.reload();
};

export default function ResetAppButton() {
  return (
    <CustomButton
      text="Reset App"
      onPress={() => {
        maybeResetApp();
      }}
    />
  );
}
