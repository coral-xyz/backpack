import { Stack } from "react-xnft";
import { ArcadeGrid } from "./ArcadeGrid";
import { ArcadeGameDetail } from "./ArcadeGameDetail";

export const ArcadeScreen = () => {
  return (
    <Stack.Navigator
      initialRoute={{ name: "grid" }}
      options={({ route }) => {
        switch (route.name) {
          case "grid":
            return {
              title: "Arcade",
            };
          case "detail":
            console.log("detail", route.props.game);
            return {
              title: route.props.game.name,
            };
          default:
            throw new Error("unknown route");
        }
      }}
      style={{}}
    >
      <Stack.Screen
        name={"grid"}
        component={(props: any) => <ArcadeGrid {...props} />}
      />
      <Stack.Screen
        name={"detail"}
        component={(props: any) => <ArcadeGameDetail {...props} />}
      />
    </Stack.Navigator>
  );
};
