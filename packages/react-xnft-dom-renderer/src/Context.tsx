import React, { useContext } from "react";
import { ReactDom } from "react-xnft";
import { XnftMetadata } from "@coral-xyz/common-public";

interface Metadata {
  isDarkMode: boolean;
}

type DomContext = {
  dom: ReactDom;
  metadata: XnftMetadata;
};

export const _DomContext = React.createContext<DomContext | null>(null);

export function DomProvider(props: any) {
  return (
    <_DomContext.Provider
      value={{
        dom: props.dom,
        metadata: props.metadata,
      }}
    >
      {props.children}
    </_DomContext.Provider>
  );
}

export function useDomContext(): { dom: ReactDom; metadata: Metadata } {
  const ctx = useContext(_DomContext);
  if (!ctx) {
    throw new Error("context not found");
  }
  return ctx;
}
