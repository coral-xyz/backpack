import { View, Tab } from "react-xnft";
import { DegodsIcon, StakeIcon } from "./utils/icon";
import { Dust } from "./Dust";
import { Stake } from "./Stake";

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
                return <StakeIcon fill={color} />;
              }
            },
          };
        }}
      >
        <Tab.Screen
          name="dust"
          disableLabel={true}
          component={() => <Dust />}
        />
        <Tab.Screen
          name="stake"
          disableLabel={true}
          component={() => <Stake />}
        />
      </Tab.Navigator>
    </View>
  );
}
