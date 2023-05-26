import { useState } from "react";

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

import { AccountSettingsNavigator } from "~navigation/AccountSettingsNavigator";
import { GlobalDrawerContent } from "~navigation/GlobalDrawerContent";
import { FriendListScreen } from "~screens/FriendListScreen";
import { ProfileScreen } from "~screens/Unlocked/Settings/ProfileScreen";

import { LockedScreen } from "./LockedNavigator";
import {
  OnboardingCompleteWelcome,
  OnboardingNavigator,
} from "./OnboardingNavigator";
import { UnlockedNavigator } from "./UnlockedNavigator";
import { NotFoundScreen } from "../screens/NotFoundScreen";

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
        options={{ title: "Your Wallets" }}
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
      <Drawer.Screen
        name="Friends"
        component={FriendListScreen}
        options={{
          headerShown: true,
        }}
      />
    </Drawer.Navigator>
  );
};

function RootNavigator(): JSX.Element {
  const [status, setStatus] = useState(null);
  const keyringStoreState = useKeyringStoreState();
  switch (keyringStoreState) {
    case KeyringStoreStateEnum.NeedsOnboarding:
      return <OnboardingNavigator onStart={setStatus} />;
    case KeyringStoreStateEnum.Locked:
      return <LockedScreen />;
    case KeyringStoreStateEnum.Unlocked:
      if (status === "onboarding") {
        return <OnboardingCompleteWelcome onComplete={setStatus} />;
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
      return <NotFoundScreen />;
  }
}
