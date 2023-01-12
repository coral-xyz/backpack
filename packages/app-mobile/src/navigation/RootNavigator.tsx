import { ErrorBoundary } from "@components/ErrorBoundary";
import { useKeyringStoreState } from "@coral-xyz/recoil";
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
  const keyringStoreState = useKeyringStoreState();
  console.log("keyringStoreState", keyringStoreState);

  switch (keyringStoreState) {
    case "needs-onboarding":
      return (
        <ErrorBoundary>
          <OnboardingNavigator />
        </ErrorBoundary>
      );
    case "locked":
      return (
        <ErrorBoundary>
          <LockedScreen />
        </ErrorBoundary>
      );
    case "unlocked":
      return (
        <ErrorBoundary>
          <UnlockedNavigator />
        </ErrorBoundary>
      );
    default:
      return <NotFoundScreen />;
  }
}
