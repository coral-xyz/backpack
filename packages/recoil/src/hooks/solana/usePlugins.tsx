import { useState, useEffect } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { PublicKey } from "@solana/web3.js";
// XXX: this full path is currently necessary as it avoids loading the jsx in
//      react-xnft-renderer/src/Component.tsx in the background service worker
import { Plugin } from "@coral-xyz/react-xnft-renderer/dist/esm/plugin";
import { fetchXnft } from "@coral-xyz/common";
import * as atoms from "../../atoms";
import { useXnfts } from "./useXnfts";
import { useAnchorContext } from "./useSolanaConnection";
import { useActiveSolanaWallet } from "../";
import {
  useNavigationSegue,
  useConnectionBackgroundClient,
  useBackgroundClient,
} from "../";
import { xnftUrl } from "../../atoms/solana/xnft";

export function useAppIcons() {
  const xnftData = useXnfts();
  const pluginData = useRecoilValue(atoms.plugins);
  return xnftData.concat(pluginData);
}

export function usePlugins(): Array<Plugin> {
  const pluginData = useAppIcons();
  return pluginData.map((p) => getPlugin(p));
}

export function useFreshPlugin(address: string): {
  state: "loading" | "done" | "error";
  result: Plugin | null;
} {
  const { provider, connectionUrl } = useAnchorContext();
  const { publicKey: activeWallet } = useActiveSolanaWallet();
  const [result, setResult] = useState<Plugin | null>(null);
  const [state, setState] = useState<"loading" | "done" | "error">("loading");

  //
  // Host APIs to hook into the plugin.
  //
  const segue = useNavigationSegue();
  const setTransactionRequest = useSetRecoilState(atoms.transactionRequest);
  const backgroundClient = useBackgroundClient();
  const connectionBackgroundClient = useConnectionBackgroundClient();

  useEffect(() => {
    (async () => {
      try {
        const xnft = await fetchXnft(provider, new PublicKey(address));
        const plugin = new Plugin(
          new PublicKey(address),
          xnftUrl(xnft.metadataBlob.properties.bundle),
          xnft.metadataBlob.image,
          xnft.xnftAccount.name,
          new PublicKey(activeWallet),
          connectionUrl
        );
        plugin.setHostApi({
          push: segue.push,
          pop: segue.pop,
          request: setTransactionRequest,
          backgroundClient,
          connectionBackgroundClient,
        });
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
  let plug = PLUGIN_CACHE.get(p.url);
  if (!plug) {
    plug = new Plugin(
      p.install.account.xnft,
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
