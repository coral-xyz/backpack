import AnchorUi, { Tab, View } from "react-xnft";
import { ChartBar, MonitorIcon } from "../utils/icons";
import { Monitor } from "../components/monitor";
import { Defi } from "../components/defi";

//
// On connection to the host environment, warm the cache.
//
AnchorUi.events.on("connect", () => {
  //
});

export function App() {
  return (
    <View style={{ height: "100%", backgroundColor: "#1f2937" }}>
      <Tab.Navigator
        style={{
          backgroundColor: "#1f2937",
          borderTop: "1px solid #3730a3",
        }}
        options={({ route }) => {
          return {
            tabBarIcon: ({ focused }) => {
              const color = focused ? "#f9fafb" : "#6b7280";

              if (route.name === "monitor") {
                return <Tab.Icon element={<MonitorIcon fill={color} />} />;
              } else {
                return <Tab.Icon element={<ChartBar fill={color} />} />;
              }
            },
          };
        }}
      >
        <Tab.Screen
          name="monitor"
          disableLabel={true}
          component={() => <Monitor />}
        />
        <Tab.Screen
          name="defi"
          disableLabel={true}
          component={() => <Defi />}
        />
      </Tab.Navigator>
    </View>
  );
}
