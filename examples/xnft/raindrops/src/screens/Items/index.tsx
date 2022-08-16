import { Stack, Text } from "react-xnft";
import { ItemGrid } from "./ItemGrid";
import { ItemDetail } from "./ItemDetail";

export function ItemsScreen() {
  return (
    <Stack.Navigator
      initialRoute={{ name: "grid" }}
      options={({ route }) => {
        switch (route.name) {
          case "grid":
            return {
              title: "Items",
            };
          case "detail":
            console.log("detail", route.props.item.metadata.data.name);
            return {
              title: route.props.item.metadata.data.name,
            };
          default:
            throw new Error("unknown route");
        }
      }}
      style={{}}
    >
      <Stack.Screen
        name={"grid"}
        component={(props: any) => <ItemGrid {...props} />}
      />
      <Stack.Screen
        name={"detail"}
        component={(props: any) => <ItemDetail {...props} />}
      />
    </Stack.Navigator>
  );
}
