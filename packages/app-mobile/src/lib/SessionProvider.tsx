import {
  createContext,
  useState,
  useContext,
  useMemo,
  useCallback,
  useEffect,
} from "react";

import * as SecureStore from "expo-secure-store";

import { UI_RPC_METHOD_KEYRING_STORE_LOCK } from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import AsyncStorage from "@react-native-async-storage/async-storage";

const key = "@@session";

export async function getTokenAsync() {
  try {
    return AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function setTokenAsync(token: string) {
  return AsyncStorage.setItem(key, token);
}

type TokenType = string | null;
type AppStateType = "onboardingStarted" | "onboardingComplete" | null;

type SessionContextType = {
  reset: () => void;
  token: TokenType;
  setAuthToken: (token: string) => void;
  appState: AppStateType;
  setAppState: (appState: AppStateType) => void;
  lockKeystore: () => void;
  unlockKeystore: ({
    password,
    userUuid,
  }: {
    password: string;
    userUuid: string;
  }) => void;
};

const SessionContext = createContext<SessionContextType>({
  reset: () => null,
  token: null,
  setAuthToken: () => null,
  appState: null,
  setAppState: () => null,
  lockKeystore: () => null,
  unlockKeystore: () => null,
});

export const SessionProvider = ({
  children,
}: {
  children: JSX.Element;
}): JSX.Element => {
  const background = useBackgroundClient();
  const [token, setToken] = useState<TokenType>(null);
  const [appState, setAppState] = useState<AppStateType>(null);

  // on app load
  useEffect(() => {
    getTokenAsync().then((token) => {
      if (token) {
        setToken(token);
      }
    });
  }, []);

  const setAuthToken = useCallback((token: string) => {
    setTokenAsync(token);
    setToken(token);
  }, []);

  const lockKeystore = useCallback(async () => {
    await background.request({
      method: UI_RPC_METHOD_KEYRING_STORE_LOCK,
      params: [],
    });
  }, [background]);

  const unlockKeystore = useCallback(
    async ({ password, userUuid }: { password: string; userUuid: string }) => {
      await background.request({
        method: UI_RPC_METHOD_KEYRING_STORE_LOCK,
        params: [password, userUuid],
      });
    },
    [background]
  );

  const reset = useCallback(async () => {
    // TODO: don't manually specify this list of keys
    // ^^ this was done before peter's time so no idea
    const stores = [
      "keyring-store",
      "keyname-store",
      "wallet-data",
      "nav-store7",
    ];

    for (const store of stores) {
      try {
        await SecureStore.deleteItemAsync(store);
      } catch (err) {
        console.error(err);
        // ignore
      }
    }

    lockKeystore();
  }, [lockKeystore]);

  const contextValue = useMemo(
    () => ({
      reset,
      token,
      setAuthToken,
      appState,
      setAppState,
      lockKeystore,
      unlockKeystore,
    }),
    [
      reset,
      token,
      setAuthToken,
      appState,
      setAppState,
      lockKeystore,
      unlockKeystore,
    ]
  );

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }

  return context;
};
