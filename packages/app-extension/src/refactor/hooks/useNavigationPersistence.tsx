import { useEffect } from "react";
import { atom, useRecoilState } from "recoil";

import { Routes as SendCollectibleRoutes } from "../navigation/SendCollectibleNavigator";
import { Routes as SendRoutes } from "../navigation/SendNavigator";
import { Routes as StakeRoutes } from "../navigation/StakeNavigator";
import { Routes as SwapRoutes } from "../navigation/SwapNavigator";
import { Routes as TensorRoutes } from "../navigation/TensorNavigator";

const navReady = atom({
  key: "navReady",
  default: false,
});

const navState = atom<any>({
  key: "navState",
  default: undefined,
});

const PERSISTENCE_KEY = "NAVIGATION_STATE_V1";

const INVALID_START_SCREENS = new Set<string>([
  SwapRoutes.SwapConfirmationScreen,
  SendRoutes.SendConfirmationScreen,
  SendCollectibleRoutes.SendCollectibleConfirmationScreen,
  // Extra StakeRoutes below use currently data passed by props, this avoids stale data
  StakeRoutes.MergeStakeScreen,
  StakeRoutes.StakeDetailScreen,
  StakeRoutes.StakeConfirmationScreen,
  TensorRoutes.TensorCollectibleActionScreen,
]);

export function useNavigationPersistence() {
  const [isReady, setIsReady] = useRecoilState(navReady);
  const [initialState, setInitialState] = useRecoilState(navState);

  const onStateChange = (state: any) => {
    return localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state));
  };

  const reset = () => {
    localStorage.setItem(PERSISTENCE_KEY, "");
  };

  useEffect(() => {
    const restoreState = async () => {
      try {
        // Only restore state if there's no deep link and we're not on web
        const savedStateString = localStorage.getItem(PERSISTENCE_KEY);
        const state = savedStateString
          ? JSON.parse(savedStateString)
          : undefined;

        const route = getActiveRoute(state);
        if (!route || INVALID_START_SCREENS.has(route.name)) {
          setInitialState(undefined);
          (async () => {
            reset();
          })();
        } else if (state !== undefined) {
          setInitialState(state);
        }
      } finally {
        setIsReady(true);
      }
    };

    if (!isReady) {
      restoreState();
    }
  }, [isReady, setIsReady, setInitialState]);

  if (!isReady) {
    return { isReady: false, initialState: undefined, onStateChange, reset };
  }

  return { isReady: true, initialState, onStateChange, reset };
}

// Returns the route the navigation should currently show from the
// navigation state object.
function getActiveRoute(state: any): { name: string; params?: object } | null {
  if (!state) {
    return null;
  }
  const route =
    typeof state.index === "number"
      ? state.routes[state.index]
      : state.routes[state.routes.length - 1];

  if (route.state) {
    return getActiveRoute(route.state);
  }

  return route;
}
