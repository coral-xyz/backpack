import { Text, Stack } from "react-xnft";
import { Feed } from "./Feed";

export const FeedScreen = () => {
  return (
    <Stack.Navigator
      initialRoute={{ name: "feed" }}
      options={({ route }) => {
        switch (route.name) {
          case "feed":
            return {
              title: "Feed",
            };
          default:
            throw new Error("unknown route");
        }
      }}
      style={{}}
    >
      <Stack.Screen
        name={"feed"}
        component={(props: any) => <Feed {...props} />}
      />
    </Stack.Navigator>
  );
};
