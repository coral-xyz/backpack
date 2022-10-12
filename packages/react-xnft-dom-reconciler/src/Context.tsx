import React, { useContext } from "react";
import { Dom } from "react-xnft";

type DomContext = {
  dom: Dom;
};
export const _DomContext = React.createContext<DomContext | null>(null);

export function DomProvider(props: any) {
  return (
    <_DomContext.Provider
      value={{
        dom: props.dom,
      }}
    >
      {props.children}
    </_DomContext.Provider>
  );
}

export function useDomContext(): { dom: Dom } {
  const ctx = useContext(_DomContext);
  if (!ctx) {
    throw new Error("context not found");
  }
  return ctx;
}
