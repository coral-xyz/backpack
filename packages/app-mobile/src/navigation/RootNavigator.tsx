import { useCallback, useState } from "react";
import { Button, Text, View } from "react-native";

import Constants from "expo-constants";

import { AuthenticatedSync } from "@coral-xyz/chat-xplat";
import {
  UI_RPC_METHOD_ACTIVE_USER_UPDATE,
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
  UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
} from "@coral-xyz/common";
import {
  KeyringStoreState,
  useAllUsers,
  useBackgroundClient,
  useKeyringStoreState,
  useUser,
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

function RootNavigator() {
  const background = useBackgroundClient();
  const keyringStoreState = useKeyringStoreState();
  const user = useUser();
  const users = useAllUsers();
  const [status, setStatus] = useState("");

  const f = (user) => {
    return {
      uuid: user.uuid,
      username: user.username,
    };
  };

  return (
    <View
      style={{ backgroundColor: "#EEE", flex: 1, justifyContent: "center" }}
    >
      <Text>
        {JSON.stringify(
          { status, keyringStoreState, user: f(user), users: users.map(f) },
          null,
          2
        )}
      </Text>
      <View>
        {users.map((user) => (
          <View
            key={user.uuid}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <Text>{user.username}</Text>
            <Button
              title="Unlock"
              onPress={async () => {
                const res = await background.request({
                  method: UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
                  params: ["backpack", user.uuid],
                });
                setStatus(res);
              }}
            />
            <Button
              title="Lock"
              onPress={async () => {
                const res = await background.request({
                  method: UI_RPC_METHOD_KEYRING_STORE_LOCK,
                  params: [],
                });

                setStatus(res);
              }}
            />
            <Button
              title="Update"
              onPress={async () => {
                await background.request({
                  method: UI_RPC_METHOD_ACTIVE_USER_UPDATE,
                  params: [user.uuid],
                });
              }}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

function RootNavigator2(): JSX.Element {
  const keyringStoreState = useKeyringStoreState();
  const { appState, setAppState } = useSession();

  const onStartOnboarding = useCallback(() => {
    setAppState("onboardingStarted");
  }, [setAppState]);

  const onCompleteOnboarding = useCallback(() => {
    setAppState("onboardingComplete");
  }, [setAppState]);

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
