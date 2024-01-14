import ReactXnft, { Text, View } from "react-xnft";

//
// On connection to the host environment, warm the cache.
//
ReactXnft.events.on("connect", () => {
  // no-op
});

export function App() {
  return (
    <View>
      <Text style={{ color: "blue" }}>Hello, World!</Text>
    </View>
  );
}
