import { useEffect, useState } from "react";
import { fetchXnft } from "@coral-xyz/common";
// XXX: this full path is currently necessary as it avoids loading the jsx in
//      react-xnft-renderer/src/Component.tsx in the background service worker
import { Plugin } from "@coral-xyz/common/dist/esm/plugin";
import { PublicKey } from "@solana/web3.js";
import {
  useRecoilValue,
  useRecoilValueLoadable,
  useSetRecoilState,
} from "recoil";

import * as atoms from "../../atoms";
import { xnftUrl } from "../../atoms/solana/xnft";
import { useConnectionUrls } from "../preferences";
import {
  useActivePublicKeys,
  useBackgroundClient,
  useConnectionBackgroundClient,
  useNavigationSegue,
} from "../";

import { useAnchorContext } from "./useSolanaConnection";

export function useAppIcons() {
  const xnftLoadable = useRecoilValueLoadable(atoms.filteredPlugins);
  const xnftData =
    xnftLoadable.state === "hasValue"
      ? (xnftLoadable.contents as Array<any>)
      : [];
  return xnftData;
}

export function usePlugins(): Array<Plugin> {
  const xnftLoadable = useRecoilValueLoadable(atoms.plugins);
  const xnftData =
    xnftLoadable.state === "hasValue"
      ? (xnftLoadable.contents as Array<any>)
      : [];
  return xnftData.map((p) => getPlugin(p));
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
          xnft.xnftAccount.publicKey,
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
      p.install.publicKey,
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
