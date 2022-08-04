import AnchorUi, { Tab, View } from "react-xnft";
import { MonitorIcon } from "../utils/icons";
import { Monitor } from "../components/monitor";

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
          borderTop: "none",
        }}
        options={({ route }) => {
          return {
            tabBarIcon: ({ focused }) => {
              const color = focused ? "#f9fafb" : "#6b7280";

              return <Tab.Icon element={<MonitorIcon fill={color} />} />;
            },
          };
        }}
      >
        <Tab.Screen
          name="monitor"
          disableLabel={true}
          component={() => <Monitor />}
        />
      </Tab.Navigator>
    </View>
  );
}
