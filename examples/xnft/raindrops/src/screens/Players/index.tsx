import { Stack } from "react-xnft";
import { PlayerGrid } from "./PlayerGrid";
import { PlayerDetail } from "./PlayerDetail";

export const PlayersScreen = () => {
  return (
    <Stack.Navigator
      initialRoute={{ name: "grid" }}
      options={({ route }) => {
        switch (route.name) {
          case "grid":
            return {
              title: "Players",
            };
          case "detail":
            console.log("detail", route.props.player);
            console.log("metadata", route.props.metadata);
            return {
              title: route.props.player.name,
            };
          default:
            throw new Error("unknown route");
        }
      }}
      style={{}}
    >
      <Stack.Screen
        name={"grid"}
        component={(props: any) => <PlayerGrid {...props} />}
      />
      <Stack.Screen
        name={"detail"}
        component={(props: any) => <PlayerDetail {...props} />}
      />
    </Stack.Navigator>
  );
};
