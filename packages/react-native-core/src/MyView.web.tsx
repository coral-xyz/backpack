// @ts-ignore
import { View, Text, StyleSheet } from "react-native";

export function MyView() {
  return (
    <View style={styles.container}>
      <Text>Hello from react-native-core (index.web.tsx)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 40,
    backgroundColor: "yellow",
  },
});
