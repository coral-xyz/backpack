import { useRecoilValue } from "recoil";
import * as atoms from "../atoms";
import { useActiveWallet, useSolanaConnectionUrl } from "../hooks";
// XXX: this full path is currently necessary as it avoids loading the jsx in
//      anchor-ui-renderer/src/Component.tsx in the background service worker
import { Plugin } from "@coral-xyz/anchor-ui-renderer/dist/esm/plugin";

export function useAppIcons() {
  const activeWallet = useActiveWallet();
  const connectionUrl = useSolanaConnectionUrl();
  const pluginData = useRecoilValue(atoms.plugins);
  const outOfBox = [
    {
      url: "",
      iconUrl: "assets/simulator.png",
      title: "Simulator",
      activeWallet,
      connectionUrl,
      componentId: "simulator",
    },
  ];
  return pluginData.concat(outOfBox);
}

export function usePlugins(): Array<Plugin> {
  const pluginData = useRecoilValue(atoms.plugins);
  return pluginData.map((p) => getPlugin(p));
}

export function useTablePlugins(): Array<Plugin> {
  const pluginData = useRecoilValue(atoms.tablePlugins);
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

export function allPlugins(): Array<Plugin> {
  return Array.from(PLUGIN_CACHE.values());
}

const PLUGIN_CACHE = new Map<string, Plugin>();
