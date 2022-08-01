import ReactXnft, { Text, View } from "react-xnft";

ReactXnft.events.on("connect", () => {
  // no-op
});

export function App() {
  return (
    <View>
      <Text>Hello, Avi!</Text>
    </View>
  );
}
