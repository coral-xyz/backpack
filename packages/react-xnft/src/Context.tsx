import { useContext, createContext } from "react";
import { darkTheme } from "@coral-xyz/themes";

type AnchorContext = {
  theme: Theme;
};
const _AnchorContext = createContext<AnchorContext | null>(null);
type Theme = any;

export const NAV_STACK: any = [];

export function AnchorProvider(props: any) {
  return (
    <_AnchorContext.Provider
      value={{
        theme: darkTheme,
      }}
    >
      {props.children}
    </_AnchorContext.Provider>
  );
}

function useAnchorContext() {
  const ctx = useContext(_AnchorContext);
  if (ctx === null) {
    throw new Error("Context not available");
  }
  return ctx;
}

export function useTheme() {
  const { theme } = useAnchorContext();
  return theme;
}

type Navigation = any;
