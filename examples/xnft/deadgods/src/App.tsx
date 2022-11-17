import { View, Tab } from "react-xnft";
import { DustScreen } from "./Dust";
import { GodsScreen } from "./Gods";
import { DegodsIcon, GodsIcon } from "./utils/icon";
import { THEME } from "./utils/theme";

export function App() {
  return (
    <View style={{ height: "100%", backgroundColor: "#111827" }}>
      <Tab.Navigator
        style={{
          backgroundColor: THEME.colors.background,
          borderTop: "none",
        }}
        options={({ route }) => {
          return {
            tabBarIcon: ({ focused }) => {
              const color = focused
                ? THEME.colors.activeTab
                : THEME.colors.inactiveTab;
              if (route.name === "dust") {
                return <Tab.Icon element={<DegodsIcon fill={color} />} />;
              } else {
                return <Tab.Icon element={<GodsIcon fill={color} />} />;
              }
            },
          };
        }}
      >
        <Tab.Screen
          name="dust"
          disableLabel={true}
          component={() => <DustScreen />}
        />
        <Tab.Screen
          name="gods"
          disableLabel={true}
          component={() => <GodsScreen />}
        />
      </Tab.Navigator>
    </View>
  );
}
