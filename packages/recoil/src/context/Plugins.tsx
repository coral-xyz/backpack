import React, { useEffect } from "react";
import { useSetRecoilState } from "recoil";

import * as atoms from "../atoms";
import {
  useActiveSolanaWallet,
  useBackgroundClient,
  useConnectionBackgroundClient,
  useNavigationSegue,
  useOpenPlugin,
  usePlugins,
} from "../hooks";

export function PluginManager(props: any) {
  // TODO: aggregate views.
  const { publicKey } = useActiveSolanaWallet();
  const plugins = usePlugins(publicKey);
  const segue = useNavigationSegue();
  const setTransactionRequest = useSetRecoilState(atoms.transactionRequest);
  const backgroundClient = useBackgroundClient();
  const connectionBackgroundClient = useConnectionBackgroundClient();
  const openPlugin = useOpenPlugin();
  //
  // Bootup all the plugins on the initial render.
  //
  useEffect(() => {
    plugins
      ?.filter((p) => p.needsLoad)
      .forEach((plugin) => {
        plugin.setHostApi({
          push: segue.push,
          pop: segue.pop,
          request: setTransactionRequest,
          backgroundClient,
          connectionBackgroundClient,
          openPlugin,
        });
      });
  }, [plugins]);

  return <>{props.children}</>;
}
