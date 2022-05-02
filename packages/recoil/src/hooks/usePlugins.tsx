import { useRecoilValue } from "recoil";
import { Plugin } from "@200ms/anchor-ui-renderer";
import * as atoms from "../atoms";

export function usePlugins(): Array<Plugin> {
  const pluginData = useRecoilValue(atoms.plugins);
  return pluginData.map((p) => {
    let plug = PLUGIN_CACHE.get(p.url);
    if (!plug) {
      plug = new Plugin(
        p.url,
        p.iconUrl,
        p.title,
        p.activeWallet,
        p.connectionUrl
      );
      PLUGIN_CACHE.set(p.url, plug);
    }
    return plug;
  });
}

export function useTablePlugins(): Array<Plugin> {
  const pluginData = useRecoilValue(atoms.tablePlugins);
  return pluginData.map((p) => {
    let plug = PLUGIN_CACHE.get(p.url);
    if (!plug) {
      plug = new Plugin(
        p.url,
        p.iconUrl,
        p.title,
        p.activeWallet,
        p.connectionUrl
      );
      PLUGIN_CACHE.set(p.url, plug);
    }
    return plug;
  });
}

export function getPlugin(pluginData: any): Plugin {
  return PLUGIN_CACHE.get(pluginData.url)!;
}

const PLUGIN_CACHE = new Map<string, Plugin>();
