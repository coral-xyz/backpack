import { Screen, Margin, PrimaryButton, Debug } from "@components";
import { View, Text, StyleSheet } from "react-native";

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
