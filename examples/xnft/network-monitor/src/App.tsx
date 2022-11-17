import React from "react";
import ReactXnft, { Tab, View } from "react-xnft";
import {
  DollarIcon,
  MonitorIcon,
  NFTIcon,
  YieldIcon,
  StablecoinIcon,
} from "./utils/icons";
import { Monitor } from "./screens/Network";
import { Defi } from "./screens/DeFi";
import { Nft } from "./screens/NFTs";
import { Yield } from "./screens/Yield";
import { Stablecoin } from "./screens/Stablecoins";

//
// On connection to the host environment, warm the cache.
//
ReactXnft.events.on("connect", () => {
  //
});

export function App() {
  return (
    <View style={{ height: "100%", backgroundColor: "#2D3036" }}>
      <Tab.Navigator
        style={{
          backgroundColor: "#2D3036",
          borderTop: "1px solid rgba(255, 255, 255, 0.06)",
        }}
        options={({ route }) => {
          return {
            tabBarIcon: ({ focused }) => {
              const color = focused ? "#f9fafb" : "#6b7280";

              if (route.name === "monitor") {
                return <Tab.Icon element={<MonitorIcon fill={color} />} />;
              } else if (route.name === "defi") {
                return <Tab.Icon element={<DollarIcon fill={color} />} />;
              } else if (route.name === "nft") {
                return <Tab.Icon element={<NFTIcon fill={color} />} />;
              } else if (route.name === "yield") {
                return <Tab.Icon element={<YieldIcon fill={color} />} />;
              } else if (route.name === "stablecoins") {
                return <Tab.Icon element={<StablecoinIcon fill={color} />} />;
              }
            },
          };
        }}
      >
        <Tab.Screen name="monitor" component={() => <Monitor />} />
        <Tab.Screen name="nft" component={() => <Nft />} />
        <Tab.Screen name="defi" component={() => <Defi />} />
        <Tab.Screen name="yield" component={() => <Yield />} />
        <Tab.Screen name="stablecoins" component={() => <Stablecoin />} />
      </Tab.Navigator>
    </View>
  );
}
