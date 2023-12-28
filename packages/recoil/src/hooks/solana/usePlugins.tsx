import { useEffect, useState } from "react";
import {
  TAB_XNFT,
  UI_RPC_METHOD_NAVIGATION_POP,
  UI_RPC_METHOD_NAVIGATION_PUSH,
} from "@coral-xyz/common";
// XXX: this full path is currently necessary as it avoids loading the jsx in
//      react-xnft-renderer/src/Component.tsx in the background service worker
import { Plugin } from "@coral-xyz/common";
import { fetchXnft } from "@coral-xyz/secure-clients/legacyCommon";
import { PublicKey } from "@solana/web3.js";
import {
  useRecoilValue,
  useRecoilValueLoadable,
  useSetRecoilState,
} from "recoil";

import * as atoms from "../../atoms";
import { useConnectionUrls } from "../preferences";
import { useActivePublicKeys } from "../";

import {
  useAnchorContext,
  useSolanaConnectionUrl,
} from "./useSolanaConnection";

export function useAppIcons(publicKey: string) {
  const connectionUrl = useSolanaConnectionUrl();
  const xnftLoadable = useRecoilValueLoadable(
    atoms.filteredPlugins({ publicKey, connectionUrl })
  );
  const xnftData =
    xnftLoadable.state === "hasValue"
      ? (xnftLoadable.contents as Array<any>)
      : [];
  return xnftData;
}

export function usePlugins(publicKey: string): Array<Plugin> | null {
  const connectionUrl = useSolanaConnectionUrl();
  const xnftLoadable = useRecoilValueLoadable(
    atoms.plugins({ publicKey, connectionUrl })
  );

  if (xnftLoadable.state === "hasValue") {
    return xnftLoadable.contents.map((p: any) => getPlugin(p));
  }
  return null;
}

export function useClosePlugin(): () => void {
  const background = useRecoilValue(atoms.backgroundClient);
  return () => {
    background
      .request({
        method: UI_RPC_METHOD_NAVIGATION_POP,
        params: [TAB_XNFT],
      })
      .catch(console.error);
  };
}

export function useOpenPlugin(): (xnftAddress: string) => void {
  const background = useRecoilValue(atoms.backgroundClient);

  return (xnftAddress) => {
    const normalizedXnftAddress = xnftAddress.replace(/\.+\//g, ""); // simple normalize to prevent: "goodxnft/../badxnft"
    const url = `xnft/${normalizedXnftAddress}`;
    background
      .request({
        method: UI_RPC_METHOD_NAVIGATION_PUSH,
        params: [url, TAB_XNFT],
      })
      .catch(console.error);
  };
}

export function usePluginUrl(address?: string) {
  const [url, setUrl] = useState<string | null>(null);
  const [cached] = useState<Plugin | undefined>(
    PLUGIN_CACHE.get(address ?? "")
  );
  useEffect(() => {
    (async () => {
      if (address?.toString() === "11111111111111111111111111111111") {
        setUrl("Simulator");
      } else if (cached) {
        setUrl(cached.iframeRootUrl);
      } else if (address) {
        try {
          const xnft = await fetchXnft(new PublicKey(address));
          setUrl(xnft!.xnft.manifest.entrypoints.default.web);
        } catch (error) {
          console.error(error);
        }
      }
    })();
  }, [cached]);

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
  const setTransactionRequest = useSetRecoilState(atoms.transactionRequest);
  const openPlugin = useOpenPlugin();

  useEffect(() => {
    if (!address || result) {
      return;
    }
    (async () => {
      try {
        const xnft = await fetchXnft(new PublicKey(address));
        const plugin = new Plugin(
          new PublicKey(address),
          xnft!.xnftAccount.masterMetadata,
          xnft!.xnft.xnft.manifest.entrypoints.default.web,
          xnft!.metadata.image,
          xnft!.xnft.xnft.manifest.splash ?? {},
          xnft!.metadata.name,
          activePublicKeys,
          connectionUrls
        );
        plugin.setHostApi({
          request: setTransactionRequest,
          openPlugin,
        });
        PLUGIN_CACHE.set(address, plugin);
        setResult(plugin);
        setState("done");
      } catch (err) {
        console.error(err);
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
      p.splashUrls ?? {},
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
