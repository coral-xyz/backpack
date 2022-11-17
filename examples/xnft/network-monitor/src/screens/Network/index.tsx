import React from "react";
import { Stack, View, Text } from "react-xnft";
import { MonitorScreen } from "./monitor";
import { SOLSupplyScreen } from "./sol_supply";
import { SOLStakeScreen } from "./sol_stake";

export function Monitor() {
  return (
    <Stack.Navigator
      initialRoute={{ name: "main" }}
      options={({ route }) => {
        switch (route.name) {
          case "main":
            return {
              title: "Solana Monitor",
            };
          case "sol_supply":
            return {
              title: "SOL Supply",
            };
          case "sol_stake":
            return {
              title: "SOL Stake",
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
        component={(props: any) => <MonitorScreen {...props} />}
      />
      <Stack.Screen
        name={"sol_supply"}
        component={(props: any) => <SOLSupplyScreen {...props} />}
      />
      <Stack.Screen
        name={"sol_stake"}
        component={(props: any) => <SOLStakeScreen {...props} />}
      />
    </Stack.Navigator>
  );
}
