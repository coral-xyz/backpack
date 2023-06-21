import { useCallback } from "react";

import Constants from "expo-constants";

import { AuthenticatedSync } from "@coral-xyz/chat-xplat";
import {
  KeyringStoreState,
  useKeyringStoreState,
  WithAuth,
} from "@coral-xyz/recoil";
import { createDrawerNavigator } from "@react-navigation/drawer";
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";

import { FullScreenLoading } from "~components/index";
import { AccountSettingsNavigator } from "~navigation/AccountSettingsNavigator";
import { GlobalDrawerContent } from "~navigation/GlobalDrawerContent";
import { ProfileScreen } from "~screens/Unlocked/Settings/ProfileScreen";

import { FriendsNavigator } from "./FriendsNavigator";
import { LockedScreen } from "./LockedNavigator";
import {
  OnboardingCompleteWelcome,
  OnboardingNavigator,
} from "./OnboardingNavigator";
import { UnlockedNavigator } from "./UnlockedNavigator";
import { WalletsNavigator } from "./WalletsNavigator";
import { HeaderAvatarButton } from "./components";

import { useSession } from "~src/lib/SessionProvider";
import { HeaderButtonSpacer } from "~src/navigation/components";

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

const Drawer = createDrawerNavigator();
const DrawerNav = () => {
  const tabBarEnabled = Constants.expoConfig?.extra?.tabBarEnabled;
  return (
    <Drawer.Navigator
      initialRouteName="DrawerHome"
      screenOptions={{
        swipeEnabled: false,
        headerShown: false,
      }}
      drawerContent={GlobalDrawerContent}
    >
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={({ navigation }) => {
          return {
            headerShown: true,
            headerLeft: (props) => (
              <HeaderButtonSpacer>
                <HeaderAvatarButton {...props} navigation={navigation} />
              </HeaderButtonSpacer>
            ),
          };
        }}
      />
      <Drawer.Screen
        name="DrawerHome"
        component={tabBarEnabled ? UnlockedNavigator : WalletsNavigator}
        options={{ title: "Wallets" }}
      />
      <Drawer.Screen
        name="AccountSettings"
        component={AccountSettingsNavigator}
        options={{ title: "Settings" }}
      />
      <Drawer.Screen name="Friends" component={FriendsNavigator} />
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

  if (appState === "isAddingAccount") {
    return <OnboardingNavigator onStart={console.log} />;
  }

  switch (keyringStoreState) {
    case KeyringStoreState.NeedsOnboarding:
      return <OnboardingNavigator onStart={onStartOnboarding} />;
    case KeyringStoreState.Locked:
      return <LockedScreen />;
    case KeyringStoreState.Unlocked:
      if (appState === "onboardingStarted") {
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
