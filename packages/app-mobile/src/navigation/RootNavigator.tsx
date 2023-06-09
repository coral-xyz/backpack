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

import {
  useDeviceSupportsBiometricAuth,
  useOsBiometricAuthEnabled,
} from "~src/features/biometrics/hooks";
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

const Drawer = createDrawerNavigator();
const DrawerNav = () => {
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
        options={{
          headerShown: true,
        }}
      />
      <Drawer.Screen
        name="DrawerHome"
        component={UnlockedNavigator}
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
  const { touchId, faceId } = useDeviceSupportsBiometricAuth();
  const data = useOsBiometricAuthEnabled();
  console.log("debug:isAUthSupported", { touchId, faceId });
  console.log("debug:isAUthEnabled", data);

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
