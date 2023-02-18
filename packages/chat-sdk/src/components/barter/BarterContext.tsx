import React, { useContext } from "react";

type BarterContext = {
  setSelectNft: any;
  room: string;
};

export const _BarterContext = React.createContext<BarterContext | null>(null);

export function BarterProvider(props: {
  room: string;
  setSelectNft: any;
  children: any;
}) {
  return (
    <_BarterContext.Provider
      value={{
        setSelectNft: props.setSelectNft,
        room: props.room,
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
