import React, { useContext } from "react";
import { Plugin } from "./plugin";

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

export function usePluginContext(): { plugin: Plugin } {
  const ctx = useContext(_PluginContext);
  if (!ctx) {
    throw new Error("context not found");
  }
  return ctx;
}
