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
      theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
    >
      <RootNavigator />
    </NavigationContainer>
  );
}

function RootNavigator(): JSX.Element {
  const keyringStoreState = useKeyringStoreState();
  console.debug("keyringStoreState", keyringStoreState);

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
