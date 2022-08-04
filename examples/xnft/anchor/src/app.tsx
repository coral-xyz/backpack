import AnchorUi, { Tab, View } from "react-xnft";
import { MonitorIcon } from "../utils/icons";
import { THEME } from "../utils/theme";
import { Monitor } from "../monitor";

//
// On connection to the host environment, warm the cache.
//
AnchorUi.events.on("connect", () => {
  //
});

export function App() {
  return (
    <View style={{ height: "100%", backgroundColor: "#111827" }}>
      <Tab.Navigator
        style={{
          backgroundColor: "#111827",
          borderTop: "none",
        }}
        options={({ route }) => {
          return {
            tabBarIcon: ({ focused }) => {
              const color = focused
                ? THEME.colors.activeTab
                : THEME.colors.inactiveTab;

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
