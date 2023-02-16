import React, { useContext } from "react";
import type {
  EnrichedMessage,
  EnrichedMessageWithMetadata,
  SubscriptionType,
  UserMetadata,
} from "@coral-xyz/common";

type BarterContext = {
  setSelectNft: any;
};

export const _BarterContext = React.createContext<BarterContext | null>(null);

export function BarterProvider(props: { setSelectNft: any; children: any }) {
  return (
    <_BarterContext.Provider
      value={{
        setSelectNft: props.setSelectNft,
      }}
    >
      {props.children}
    </_BarterContext.Provider>
  );
}

export function useBarterContext(): BarterContext {
  const ctx = useContext(_BarterContext);
  if (!ctx) {
    throw new Error("context not found");
  }
  return ctx;
}
