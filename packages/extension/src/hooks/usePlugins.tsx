import { useRecoilValue } from "recoil";
import * as atoms from "../recoil/atoms";
import { Plugin } from "../components/Unlocked/Balances/Plugins";

export function usePlugins(): Array<Plugin> {
  const pluginData = useRecoilValue(atoms.plugins);
  return pluginData.map((p) => {
    let plug = PLUGIN_CACHE.get(p.url);
    if (!plug) {
      plug = new Plugin(p.url, p.activeWallet, p.connectionUrl);
      PLUGIN_CACHE.set(p.url, plug);
    }
    return plug;
  });
}

const PLUGIN_CACHE = new Map<string, Plugin>();
