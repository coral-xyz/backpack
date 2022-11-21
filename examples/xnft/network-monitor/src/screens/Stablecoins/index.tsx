import React from "react";
import { Stack, View, Text } from "react-xnft";
import { StablecoinScreen } from "./defi";

export function Stablecoin() {
  return (
    <Stack.Navigator
      initialRoute={{ name: "main" }}
      options={({ route }) => {
        switch (route.name) {
          case "main":
            return {
              title: "Stablecoin Monitor",
            };
          default:
            throw new Error("unknown route");
        }
      }}
      style={{
        font: "Inter",
        fontSize: "20px",
        fontWeight: "700",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        height: "56px",
      }}
    >
      <Stack.Screen
        name={"main"}
        component={(props: any) => <StablecoinScreen {...props} />}
      />
    </Stack.Navigator>
  );
}
