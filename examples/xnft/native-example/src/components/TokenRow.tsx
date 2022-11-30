import { Text, Pressable, StyleSheet, Image, View } from "react-native";

export function TokenRow({ id, name, price, imageUrl, onPress }) {
  return (
    <Pressable onPress={() => onPress(id)} style={styles.container}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        <Text style={styles.name}>{name}</Text>
      </View>
      <Text style={styles.price}>${price}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  image: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "500",
  },
  price: {
    fontSize: 18,
  },
});
