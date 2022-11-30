import { View, Text, StyleSheet } from "react-native";

export function Section({ title, children }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.example}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    textAlign: "center",
  },
  example: {
    marginTop: 8,
  },
});
