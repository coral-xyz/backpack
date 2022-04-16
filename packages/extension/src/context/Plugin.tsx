import React from "react";
import { Plugin } from "../components/Unlocked/Balances/Plugin";

type PluginContext = {
  plugin: Plugin;
};
export const _PluginContext = React.createContext<PluginContext | null>(null);

export function PluginProvider(props: any) {
  return (
    <_PluginContext.Provider
      value={{
        plugin: props.plugin,
      }}
    >
      {props.children}
    </_PluginContext.Provider>
  );
}
