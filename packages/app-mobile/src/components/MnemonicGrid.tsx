import { StyleSheet, TextInput, View } from "react-native";

export default function MnemonicGrid() {
  const nums = [1, 2, 3, 4, 5, 6];
  return (
    <View style={styles.container}>
      {nums.map((num) => {
        <TextInput placeholder={num.toString()} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
