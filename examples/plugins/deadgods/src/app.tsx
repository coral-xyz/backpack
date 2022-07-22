import { useTheme, View, Tabs, Tab } from "react-xnft";
import { DegodsIcon } from "./utils/icon";
import { Dust } from "./Dust";
import { Stake } from "./Stake";

export function App() {
  const theme = useTheme();
  return (
    <View style={{ height: "100%" }}>
      <Tabs
        style={{
          backgroundColor: "#111827",
          borderTop: "none",
        }}
        options={({ route }) => {
          return {
            tabBarIcon: ({ focused }) => {
              const color = focused
                ? theme.custom.colors.activeNavButton
                : theme.custom.colors.secondary;
              if (route.name === "dust") {
                return <DegodsIcon />;
              } else {
                return <View></View>;
              }
            },
            tabBarActiveTintColor: theme.custom.colors.activeNavButton,
            tabBarInactiveTintColor: theme.custom.colors.secondary,
          };
        }}
      >
        <Tab name="dust" disableLabel={true} component={() => <Dust />} />
        <Tab name="stake" component={() => <Stake />} />
      </Tabs>
    </View>
  );
}
