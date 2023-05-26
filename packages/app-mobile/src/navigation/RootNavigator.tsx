import { useState } from "react";

import { AuthenticatedSync } from "@coral-xyz/chat-xplat";
import {
  KeyringStoreStateEnum,
  useKeyringStoreState,
  WithAuth,
} from "@coral-xyz/recoil";
import { ListItem } from "@coral-xyz/tamagui";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";

import { LockedScreen } from "./LockedNavigator";
import {
  OnboardingCompleteWelcome,
  OnboardingNavigator,
} from "./OnboardingNavigator";
import { UnlockedNavigator } from "./UnlockedNavigator";
import { NotFoundScreen } from "../screens/NotFoundScreen";

function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItem label="Profile" />
      <DrawerItem label="Friends" />
      <DrawerItem label="Accounts" />
    </DrawerContentScrollView>
  );
}

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
      drawerContent={CustomDrawerContent}
      // drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="DrawerHome" component={UnlockedNavigator} />
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
