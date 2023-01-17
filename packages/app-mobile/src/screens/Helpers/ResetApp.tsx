import { Alert, DevSettings } from "react-native";

import { deleteItemAsync } from "expo-secure-store";

export const ResetApp = () => {
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
  return null;
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
