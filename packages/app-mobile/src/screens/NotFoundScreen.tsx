import { StyleSheet, Text, View } from "react-native";

export function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text>
        Not found. Something must have went wrong with your keystore. Please
        reset the app and try again.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
