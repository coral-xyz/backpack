import { Stack } from "react-xnft";
import { GodDetailScreen } from "./GodDetail";
import { GodGridScreen } from "./GodGrid";

export function GodsScreen() {
  return (
    <Stack.Navigator
      initialRoute={{ name: "grid" }}
      options={({ route }) => {
        switch (route.name) {
          case "grid":
            return {
              title: "My DeadGods",
            };
          case "detail":
            return {
              title: route.props.god.tokenMetaUriData.name,
            };
          default:
            throw new Error("unknown route");
        }
      }}
      style={{}}
    >
      <Stack.Screen
        name={"grid"}
        component={(props: any) => <GodGridScreen {...props} />}
      />
      <Stack.Screen
        name={"detail"}
        component={(props: any) => <GodDetailScreen {...props} />}
      />
    </Stack.Navigator>
  );
}
