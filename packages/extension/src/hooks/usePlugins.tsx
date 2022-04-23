import { useRecoilValue } from "recoil";
import * as atoms from "../recoil/atoms";
import { Plugin } from "@200ms/anchor-ui-renderer";

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

const PLUGIN_CACHE = new Map<string, Plugin>();
