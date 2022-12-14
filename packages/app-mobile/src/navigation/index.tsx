import { useKeyringStoreState } from "@coral-xyz/recoil";
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";

import { NotFoundScreen } from "../screens/NotFoundScreen";

import LockedNavigator from "./LockedNavigator";
import OnboardingNavigator from "./OnboardingNavigator";
import UnlockedNavigator from "./UnlockedNavigator";

export default function Navigation({
  colorScheme,
}: {
  colorScheme: "dark" | "light";
}) {
  return (
    <NavigationContainer
      theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
    >
      <RootNavigator />
    </NavigationContainer>
  );
}

function RootNavigator() {
  const keyringStoreState = useKeyringStoreState();
  console.log("keyringStoreState", keyringStoreState);

  switch (keyringStoreState) {
    case "needs-onboarding":
      return <OnboardingNavigator />;
    case "locked":
      return <LockedNavigator />;
    case "unlocked":
      return <UnlockedNavigator />;
    default:
      return <NotFoundScreen />;
  }
}
