import { useEffect } from "react";
import {
  NavigationContainer,
  useNavigation as useReactNavigation,
} from "@react-navigation/native";

import { useNavigationPersistence } from "../../../refactor/hooks/useNavigationPersistence";
import { useNavigationContainerTheme } from "../../../refactor/hooks/useNavigatonContainerTheme";
import {
  Routes as WalletsRoutes,
  WalletsNavigator,
} from "../../../refactor/navigation/WalletsNavigator";

export function Router() {
  const theme = useNavigationContainerTheme();
  const { isReady, initialState, onStateChange } = useNavigationPersistence();

  if (!isReady) {
    return null;
  }

  return (
    <NavigationContainer
      theme={theme}
      initialState={initialState}
      onStateChange={onStateChange}
    >
      <_Router />
    </NavigationContainer>
  );
}

function _Router() {
  useShortcuts();
  return <WalletsNavigator />;
}

function useShortcuts() {
  const navigation = useReactNavigation<any>();
  useEffect(() => {
    const keyDownTextField = (e: any) => {
      if (e.key === "k" && e.metaKey) {
        navigation.navigate(WalletsRoutes.SearchScreen);
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", keyDownTextField);

    return () => {
      document.removeEventListener("keydown", keyDownTextField);
    };
  }, [navigation]);
}
