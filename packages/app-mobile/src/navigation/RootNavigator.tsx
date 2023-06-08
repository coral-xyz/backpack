import { useCallback } from "react";

import { AuthenticatedSync } from "@coral-xyz/chat-xplat";
import {
  KeyringStoreStateEnum,
  useKeyringStoreState,
  WithAuth,
} from "@coral-xyz/recoil";
import { createDrawerNavigator } from "@react-navigation/drawer";
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import { FullScreenLoading } from "~components/index";
import { AccountSettingsNavigator } from "~navigation/AccountSettingsNavigator";
import { GlobalDrawerContent } from "~navigation/GlobalDrawerContent";
import { HeaderButton } from "~navigation/components";
import { FriendDetailScreen } from "~screens/FriendDetailScreen";
import { FriendListScreen } from "~screens/FriendListScreen";
import { ProfileScreen } from "~screens/Unlocked/Settings/ProfileScreen";

import { LockedScreen } from "./LockedNavigator";
import {
  OnboardingCompleteWelcome,
  OnboardingNavigator,
} from "./OnboardingNavigator";
import { UnlockedNavigator } from "./UnlockedNavigator";

import { useSession } from "~src/lib/SessionProvider";
// import { NotFoundScreen } from "../screens/NotFoundScreen";

export function RootNavigation({
  colorScheme,
}: {
  colorScheme: "dark" | "light";
}): JSX.Element {
  return (
    <NavigationContainer
      theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
    >
      <RootNavigator />
    </NavigationContainer>
  );
}

type FriendNavigatorStackParamList = {
  FriendList: undefined;
  FriendDetail: {
    userId: string;
    username: string;
  };
};

const FriendStack = createStackNavigator<FriendNavigatorStackParamList>();

const FriendNavigator = () => {
  return (
    <FriendStack.Navigator>
      <FriendStack.Screen
        name="FriendList"
        component={FriendListScreen}
        options={({ navigation }) => {
          return {
            title: "Friends",
            headerShown: true,
            headerLeft: (props) => (
              <HeaderButton
                name="menu"
                {...props}
                onPress={() => {
                  navigation.openDrawer();
                }}
              />
            ),
          };
        }}
      />
      <FriendStack.Screen
        name="FriendDetail"
        component={FriendDetailScreen}
        options={({ route }) => {
          return {
            headerBackTitleVisible: false,
            title: route.params.username,
          };
        }}
      />
    </FriendStack.Navigator>
  );
};

const Drawer = createDrawerNavigator();

const DrawerNav = () => {
  return (
    <Drawer.Navigator
      initialRouteName="DrawerHome"
      screenOptions={{ headerShown: false }}
      drawerContent={GlobalDrawerContent}
      // drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="DrawerHome"
        component={UnlockedNavigator}
        options={{ title: "Balances" }}
      />
      <Drawer.Screen
        name="AccountSettings"
        component={AccountSettingsNavigator}
        options={{ title: "Settings" }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: true,
        }}
      />
      <Drawer.Screen name="Friends" component={FriendNavigator} />
    </Drawer.Navigator>
  );
};

function RootNavigator(): JSX.Element {
  const keyringStoreState = useKeyringStoreState();
  const { appState, setAppState } = useSession();

  const onStartOnboarding = useCallback(() => {
    setAppState("onboardingStarted");
  }, [setAppState]);

  const onCompleteOnboarding = useCallback(() => {
    setAppState("onboardingComplete");
  }, [setAppState]);

  switch (keyringStoreState) {
    case KeyringStoreStateEnum.NeedsOnboarding:
      return <OnboardingNavigator onStart={onStartOnboarding} />;
    case KeyringStoreStateEnum.Locked:
      return <LockedScreen />;
    case KeyringStoreStateEnum.Unlocked:
      if (appState === "onboardingComplete") {
        return <OnboardingCompleteWelcome onComplete={onCompleteOnboarding} />;
      }

      return (
        <>
          <AuthenticatedSync />
          <WithAuth>
            <DrawerNav />
          </WithAuth>
        </>
      );
    default:
      return <FullScreenLoading />;
  }
}
