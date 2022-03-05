import React, { useContext, useState } from "react";

type TabNavigationContext = {
  tab: TabNavigation;
  setTab: (tab: TabNavigation) => void;
};
const _TabNavigationContext = React.createContext<TabNavigationContext | null>(
  null
);

export function TabNavigationProvider(props: any) {
  const [tab, setTab] = useState(TabNavigation.Balances);

  return (
    <_TabNavigationContext.Provider
      value={{
        tab,
        setTab,
      }}
    >
      {props.children}
    </_TabNavigationContext.Provider>
  );
}

export function useTabNavigationContext(): TabNavigationContext {
  const ctx = useContext(_TabNavigationContext);
  if (ctx === null) {
    throw new Error("Context not available");
  }
  return ctx;
}

export enum TabNavigation {
  Balances,
  Nfts,
  Swapper,
  Settings,
}
