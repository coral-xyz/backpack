import { useRecoilValue } from "recoil";
import { plugins, tablePlugins } from "../atoms";
// XXX: this full path is currently necessary as it avoids loading the jsx in
//      anchor-ui-renderer/src/Component.tsx in the background service worker
import { Plugin } from "@200ms/anchor-ui-renderer/dist/esm/plugin";

export function usePlugins(): Array<Plugin> {
  const pluginData = useRecoilValue(plugins);
  return pluginData.map((p) => getPlugin(p));
}

export function useTablePlugins(): Array<Plugin> {
  const pluginData = useRecoilValue(tablePlugins);
  return pluginData.map((p) => getPlugin(p));
}

export function useAllPlugins(): Array<Plugin> {
  const a = usePlugins();
  const b = useTablePlugins();
  return a.concat(b);
}

export function getPlugin(p: any): Plugin {
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
}

const PLUGIN_CACHE = new Map<string, Plugin>();
