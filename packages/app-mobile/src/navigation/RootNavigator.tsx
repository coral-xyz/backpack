import { useEffect, useState } from "react";
import { useStore } from "@coral-xyz/common";
import { KeyringStoreStateEnum, useKeyringStoreState } from "@coral-xyz/recoil";
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";

import { NotFoundScreen } from "../screens/NotFoundScreen";

import { LockedScreen } from "./LockedNavigator";
import OnboardingNavigator from "./OnboardingNavigator";
import UnlockedNavigator from "./UnlockedNavigator";

export function RootNavigation({
  colorScheme,
}: {
  colorScheme: "dark" | "light";
}): JSX.Element {
  return (
    <NavigationContainer
      theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

function RootNavigator(): JSX.Element {
  const unlocked = useStore((state) => state.unlocked);
  const keyringStoreState = useKeyringStoreState();
  console.debug("keyringStoreState", unlocked, keyringStoreState);

  // if (unlocked && KeyringStoreStateEnum.Unlocked) {
  //   return <UnlockedNavigator />;
  // }

  switch (keyringStoreState) {
    case KeyringStoreStateEnum.NeedsOnboarding:
      return <OnboardingNavigator />;
    case KeyringStoreStateEnum.Locked:
      return <LockedScreen />;
    case KeyringStoreStateEnum.Unlocked:
      return <UnlockedNavigator />;
    default:
      return <NotFoundScreen />;
  }
}
