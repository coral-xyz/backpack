import { EXTENSION_WIDTH } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import { XStack } from "@coral-xyz/tamagui";
import type { MaterialTopTabScreenProps } from "@react-navigation/material-top-tabs";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

import { TopTabButton } from "../../components/common/Layout/Tab";
import { ActivityScreen } from "../screens/Unlocked/Activity/ActivityScreen";
import { CollectiblesScreen } from "../screens/Unlocked/Collectibles/CollectiblesScreen";
import { TokensScreen } from "../screens/Unlocked/Tokens/TokensScreen";

import type { TabsNavigatorProps } from "./WalletsNavigator";

export enum Routes {
  TokensScreen = "TokensScreen",
  CollectiblesScreen = "CollectiblesScreen",
  ActivityScreen = "ActivityScreen",
}

export type TabsParamList = {
  [Routes.TokensScreen]: undefined;
  [Routes.CollectiblesScreen]: undefined;
  [Routes.ActivityScreen]: undefined;
};

export type TokensScreenProps = MaterialTopTabScreenProps<
  TabsParamList,
  Routes.TokensScreen
>;

export type CollectiblesScreenProps = MaterialTopTabScreenProps<
  TabsParamList,
  Routes.CollectiblesScreen
>;

export type ActivityScreenProps = MaterialTopTabScreenProps<
  TabsParamList,
  Routes.ActivityScreen
>;

const Tabs = createMaterialTopTabNavigator<TabsParamList>();
export function TabsNavigator({
  navigation: _1,
  route: _2,
}: TabsNavigatorProps): JSX.Element {
  const { t } = useTranslation();
  return (
    <Tabs.Navigator
      lazy
      tabBar={(props: any) => <TopTabBar {...props} />}
      initialLayout={{
        width: EXTENSION_WIDTH,
      }}
      animationEnabled={false}
    >
      <Tabs.Screen
        name={Routes.TokensScreen}
        options={{ title: t("tokens") }}
        component={TokensScreen}
      />
      <Tabs.Screen
        name={Routes.CollectiblesScreen}
        options={{
          title: t("collectibles"),
        }}
        component={CollectiblesScreen}
      />
      <Tabs.Screen
        name={Routes.ActivityScreen}
        options={{ title: t("activity") }}
        component={ActivityScreen}
      />
    </Tabs.Navigator>
  );
}

function TopTabBar({ state, descriptors, navigation, position: _ }: any) {
  return (
    <XStack
      space={10}
      style={{
        display: "flex",
        marginLeft: "auto",
        marginRight: "auto",
        marginTop: "8px",
        marginBottom: "8px",
        height: "33px",
      }}
    >
      {state.routes.map((route: any, index: any) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onClick = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <TopTabButton isSelected={isFocused} onClick={onClick}>
            {label}
          </TopTabButton>
        );
      })}
    </XStack>
  );
}
