import type { Wallet } from "@coral-xyz/recoil";

import {
  createContext,
  useState,
  useContext,
  useMemo,
  useCallback,
  useEffect,
} from "react";

import {
  UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
  UI_RPC_METHOD_KEYRING_RESET,
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
} from "@coral-xyz/common";
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
type AppStateType =
  | "onboardingStarted"
  | "onboardingComplete"
  | "isAddingAccount"
  | null;

type SessionContextType = {
  activeWallet: Wallet | null;
  setActiveWallet: (wallet: Wallet) => Promise<void>;
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
  activeWallet: null,
  setActiveWallet: async () => {},
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
  // eslint-disable-next-line react/hook-use-state
  const [activeWallet, setActiveWallet_] = useState<Wallet | null>(null);
  const [token, setToken] = useState<TokenType>(null);
  const [appState, setAppState] = useState<AppStateType>(null);

  // on app load
  useEffect(() => {
    getTokenAsync().then((token) => {
      console.log("SessionProvider:getTokenAsync:token", token);
      if (token) {
        setToken(token);
      }
    });
  }, []);

  const setActiveWallet = useCallback(
    async (wallet: Wallet) => {
      setActiveWallet_(wallet);
      // recoil is super slow so we update the active wallet in memory first, then use this as a side-effect
      if (activeWallet?.publicKey !== wallet.publicKey) {
        await background.request({
          method: UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
          params: [wallet.publicKey, wallet.blockchain],
        });
      }
    },
    [background, activeWallet]
  );

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
    await background.request({
      method: UI_RPC_METHOD_KEYRING_RESET,
      params: [],
    });

    lockKeystore();
  }, [background, lockKeystore]);

  const contextValue = useMemo(
    () => ({
      activeWallet,
      setActiveWallet,
      reset,
      token,
      setAuthToken,
      appState,
      setAppState,
      lockKeystore,
      unlockKeystore,
    }),
    [
      activeWallet,
      setActiveWallet,
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
