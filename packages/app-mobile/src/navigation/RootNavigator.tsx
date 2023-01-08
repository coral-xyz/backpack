import { Component } from "react";
import { Text, View } from "react-native";
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

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
    // You can also log error messages to an error reporting service here
  }

  render() {
    if (this.state.errorInfo) {
      // Error path
      return (
        <View style={{ flex: 1, backgroundColor: "orange" }}>
          <Text>Something went wrong.</Text>
          <View>
            <Text>{JSON.stringify(this.state, null, 2)}</Text>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

export function RootNavigation({
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

function renderScreen(state: string): JSX.Element {
  switch (state) {
    case "needs-onboarding":
      return (
        <ErrorBoundary>
          <OnboardingNavigator />
        </ErrorBoundary>
      );
    case "locked":
      return (
        <View style={{ flex: 1, backgroundColor: "pink" }}>
          <ErrorBoundary>
            <LockedNavigator />
          </ErrorBoundary>
        </View>
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

function RootNavigator() {
  const keyringStoreState = useKeyringStoreState();
  console.log("keyringStoreState", keyringStoreState);

  return (
    <View style={{ flex: 1, backgroundColor: "pink" }}>
      {renderScreen(keyringStoreState)}
    </View>
  );
}
