import {
  createContext,
  useState,
  useContext,
  useMemo,
  useCallback,
  useEffect,
} from "react";

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

type SessionContextType = {
  token: TokenType;
  setAuthToken: (token: string) => void;
};

const SessionContext = createContext<SessionContextType>({
  token: null,
  setAuthToken: () => null,
});

export const SessionProvider = ({
  children,
}: {
  children: JSX.Element;
}): JSX.Element => {
  const [token, setToken] = useState<TokenType>(null);
  console.log("debug1:SessionProvider:token", token);

  // on app load
  useEffect(() => {
    console.log("debug1:useEffect:onLoad");
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

  const contextValue = useMemo(
    () => ({
      token,
      setAuthToken,
    }),
    [token, setAuthToken]
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
