import { useContext } from "react";
import { useRecoilValue } from "recoil";
import * as atoms from "../recoil/atoms";
import { Plugin } from "../components/Unlocked/Balances/Plugin";
import { _PluginContext } from "../context/Plugin";

export function usePlugins(): Array<Plugin> {
  const pluginData = useRecoilValue(atoms.plugins);
  return pluginData.map((p) => {
    let plug = PLUGIN_CACHE.get(p.iconUrl); // TODO: should be the full url not icon.
    if (!plug) {
      plug = new Plugin(
        p.url,
        p.iconUrl,
        p.title,
        p.activeWallet,
        p.connectionUrl
      );
      PLUGIN_CACHE.set(p.iconUrl, plug);
    }
    return plug;
  });
}

export function usePluginContext(): { plugin: Plugin } {
  const ctx = useContext(_PluginContext);
  if (!ctx) {
    throw new Error("context not found");
  }
  return ctx;
}

const PLUGIN_CACHE = new Map<string, Plugin>();
