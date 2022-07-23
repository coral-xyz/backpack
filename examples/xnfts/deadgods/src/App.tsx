import { View, Tab } from "react-xnft";
import { DegodsIcon, GodsIcon } from "./utils/icon";
import { DustScreen } from "./Dust";
import { GodsScreen } from "./Gods";

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
              const color = focused ? "#FFEFEB" : "#6B7280";
              if (route.name === "dust") {
                return <DegodsIcon fill={color} />;
              } else {
                return <GodsIcon fill={color} />;
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
