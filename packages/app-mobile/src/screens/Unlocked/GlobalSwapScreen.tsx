import { StyleSheet, Text, View } from "react-native";

import { Debug, Margin, PrimaryButton, Screen } from "@components";


export function GlobalSwapScreen({ navigation, route }) {
  const handleSwap = () => {};
  const isDisabled = true;

  return (
    <Screen style={{ justifyContent: "space-between" }}>
      <PrimaryButton
        disabled={isDisabled}
        label="Review"
        onPress={() => handleSwap()}
      />
    </Screen>
  );
}
