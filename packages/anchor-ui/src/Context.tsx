import React, { useContext, createContext } from "react";

type AnchorContext = {
  navigation: Navigation;
};
const _AnchorContext = createContext<AnchorContext | null>(null);

export function AnchorProvider(props: any) {
  const navigation = {
    push: (reactNode: any) => {
      console.log("pushing here");
    },
  };
  return (
    <_AnchorContext.Provider
      value={{
        navigation,
      }}
    >
      {props.children}
    </_AnchorContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(_AnchorContext);
  if (ctx === null) {
    throw new Error("Context not available");
  }
  return ctx.navigation;
}

type Navigation = any;
