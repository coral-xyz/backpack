import { useState } from "react";
import { View } from "react-native";

import { KeyringStoreStateEnum, useKeyringStoreState } from "@coral-xyz/recoil";
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";

import { NotFoundScreen } from "../screens/NotFoundScreen";
import { LockedScreen } from "./LockedNavigator";
import {
  OnboardingCompleteWelcome,
  OnboardingNavigator,
} from "./OnboardingNavigator";
import { UnlockedNavigator } from "./UnlockedNavigator";

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

function RootNavigator(): JSX.Element {
  const [status, setStatus] = useState(null);

  switch (keyringStoreState) {
    case KeyringStoreStateEnum.NeedsOnboarding:
      return <OnboardingNavigator onStart={setStatus} />;
    case KeyringStoreStateEnum.Locked:
      return <LockedScreen />;
    case KeyringStoreStateEnum.Unlocked:
      if (status === "onboarding") {
        return <OnboardingCompleteWelcome onComplete={setStatus} />;
      }
      return <UnlockedNavigator />;
    default:
      return <NotFoundScreen />;
  }
}
