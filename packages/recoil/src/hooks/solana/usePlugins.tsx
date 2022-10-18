import { useState, useEffect } from "react";
import {
  useRecoilValue,
  useSetRecoilState,
  useRecoilValueLoadable,
} from "recoil";
import { PublicKey } from "@solana/web3.js";
// XXX: this full path is currently necessary as it avoids loading the jsx in
//      react-xnft-renderer/src/Component.tsx in the background service worker
import { Plugin } from "@coral-xyz/common/dist/esm/plugin";
import { fetchXnft } from "@coral-xyz/common";
import * as atoms from "../../atoms";
import { useAnchorContext } from "./useSolanaConnection";
import { useConnectionUrls } from "../preferences";
import { useActivePublicKeys } from "../";
import {
  useNavigationSegue,
  useConnectionBackgroundClient,
  useBackgroundClient,
} from "../";
import { xnftUrl } from "../../atoms/solana/xnft";

export function useAppIcons() {
  const xnftLoadable = useRecoilValueLoadable(atoms.xnfts);
  const xnftData =
    xnftLoadable.state === "hasValue"
      ? (xnftLoadable.contents as Array<any>)
      : [];
  const pluginData = useRecoilValue(atoms.plugins);
  return xnftData.concat(pluginData);
}

export function usePlugins(): Array<Plugin> {
  const pluginData = useAppIcons();
  return pluginData.map((p) => getPlugin(p));
}

export function usePluginUrl(address?: string) {
  const { provider } = useAnchorContext();
  const [url, setUrl] = useState<string | null>(null);
  const [cached] = useState<Plugin | undefined>(
    PLUGIN_CACHE.get(address ?? "")
  );

  if (cached) return cached.iframeRootUrl;

  useEffect(() => {
    (async () => {
      if (address) {
        try {
          const xnft = await fetchXnft(provider, new PublicKey(address));
          setUrl(xnftUrl(xnft.metadataBlob.properties.bundle));
        } catch (error) {
          console.error(error);
        }
      }
    })();
  });

  return url;
}

export function useFreshPlugin(address?: string): {
  state: "loading" | "done" | "error";
  result: Plugin | undefined;
} {
  const { provider } = useAnchorContext();
  const connectionUrls = useConnectionUrls();
  const activePublicKeys = useActivePublicKeys();
  const [result, setResult] = useState<Plugin | undefined>(
    PLUGIN_CACHE.get(address ?? "")
  );
  const [state, setState] = useState<"loading" | "done" | "error">("loading");

  //
  // Host APIs to hook into the plugin.
  //
  const segue = useNavigationSegue();
  const setTransactionRequest = useSetRecoilState(atoms.transactionRequest);
  const backgroundClient = useBackgroundClient();
  const connectionBackgroundClient = useConnectionBackgroundClient();

  useEffect(() => {
    if (!address || result) {
      return;
    }
    (async () => {
      try {
        const xnft = await fetchXnft(provider, new PublicKey(address));
        const plugin = new Plugin(
          new PublicKey(address),
          xnftUrl(xnft.metadataBlob.properties.bundle),
          xnft.metadataBlob.image,
          xnft.xnftAccount.name,
          activePublicKeys,
          connectionUrls
        );
        plugin.setHostApi({
          push: segue.push,
          pop: segue.pop,
          request: setTransactionRequest,
          backgroundClient,
          connectionBackgroundClient,
        });
        PLUGIN_CACHE.set(address, plugin);
        setResult(plugin);
        setState("done");
      } catch (err) {
        setState("error");
      }
    })();
  }, [provider, address]);

  return {
    state,
    result,
  };
}

export function getPlugin(p: any): Plugin {
  let plug = PLUGIN_CACHE.get(p.install.account.xnft.toString());
  if (!plug) {
    plug = new Plugin(
      p.install.account.xnft,
      p.url,
      p.iconUrl,
      p.title,
      p.activeWallets,
      p.connectionUrls
    );
    PLUGIN_CACHE.set(p.install.account.xnft.toString(), plug);
  }
  return plug;
}

export function allPlugins(): Array<Plugin> {
  return Array.from(PLUGIN_CACHE.values());
}

const PLUGIN_CACHE = new Map<string, Plugin>();
