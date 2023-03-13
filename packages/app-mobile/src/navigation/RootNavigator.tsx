import { useState } from "react";

import { KeyringStoreStateEnum, useKeyringStoreState } from "@coral-xyz/recoil";
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
      return <UnlockedNavigator />;
    default:
      return <NotFoundScreen />;
  }
}
