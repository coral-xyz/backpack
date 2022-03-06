import React, { useContext, useState } from "react";

type TabContext = {
  tab: Tab;
  setTab: (tab: Tab) => void;
};
const _TabContext = React.createContext<TabContext | null>(null);

export function TabProvider(props: any) {
  const [tab, setTab] = useState(Tab.Balances);

  return (
    <_TabContext.Provider
      value={{
        tab,
        setTab,
      }}
    >
      {props.children}
    </_TabContext.Provider>
  );
}

export function useTabContext(): TabContext {
  const ctx = useContext(_TabContext);
  if (ctx === null) {
    throw new Error("Context not available");
  }
  return ctx;
}

export enum Tab {
  Balances,
  Nfts,
  Swapper,
  Quests,
  Settings,
}
