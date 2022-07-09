import AnchorUi, { Text, View } from "@coral-xyz/anchor-ui";

//
// On connection to the host environment, warm the cache.
//
AnchorUi.events.on("connect", () => {
  // no-op
});

export function App() {
  return (
    <View>
      <Text>Hello, World!</Text>
    </View>
  );
}
