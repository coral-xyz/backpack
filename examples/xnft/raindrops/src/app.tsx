import ReactXnft, { Text, View, Tab } from "react-xnft";
import { HomeIcon, ItemsIcon, PlayersIcon, ArcadeIcon } from "./utils/Icon";
import { HomeScreen } from "./screens/Home";
import { PlayersScreen } from "./screens/Players";
import { ItemsScreen } from "./screens/Items";
import { ArcadeScreen } from "./screens/Arcade";
import { THEME } from "./utils/theme";

//
// On connection to the host environment, warm the cache.
//
ReactXnft.events.on("connect", () => {
  // no-op
});

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
            tabBarActiveTintColor: THEME.colors.activeTab,
            tabBarInactiveTintColor: THEME.colors.inactiveTab,
            tabBarIcon: ({ focused }) => {
              const color = focused
                ? THEME.colors.activeTab
                : THEME.colors.inactiveTab;
              switch (route.name) {
                case "home":
                  return <Tab.Icon element={<HomeIcon fill={color} />} />;
                case "items":
                  return <Tab.Icon element={<ItemsIcon fill={color} />} />;
                case "players":
                  return <Tab.Icon element={<PlayersIcon fill={color} />} />;
                case "arcade":
                  return <Tab.Icon element={<ArcadeIcon fill={color} />} />;
                default:
                  return <Tab.Icon element={<HomeIcon fill={color} />} />;
              }
            },
          };
        }}
      >
        <Tab.Screen
          name="home"
          disableLabel={true}
          component={() => <HomeScreen />}
        />
        <Tab.Screen
          name="players"
          disableLabel={true}
          component={() => <PlayersScreen />}
        />
        <Tab.Screen
          name="items"
          disableLabel={true}
          component={() => <ItemsScreen />}
        />
        <Tab.Screen
          name="arcade"
          disableLabel={true}
          component={() => <ArcadeScreen />}
        />
      </Tab.Navigator>
    </View>
  );
}
