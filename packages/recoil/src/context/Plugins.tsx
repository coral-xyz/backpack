import React, { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import * as atoms from "../atoms";
import {
  usePlugins,
  useTablePlugins,
  useNavigationSegue,
  useConnectionBackgroundClient,
} from "../hooks";

export function PluginManager(props: any) {
  const plugins = usePlugins();
  const tablePlugins = useTablePlugins();
  const segue = useNavigationSegue();
  const setTransactionRequest = useSetRecoilState(atoms.transactionRequest);
  const connectionBackgroundClient = useConnectionBackgroundClient();

  //
  // Bootup all the plugins on the initial render.
  //
  useEffect(() => {
    const allPlugins = plugins.concat(tablePlugins);
    allPlugins
      .filter((p) => p.needsLoad)
      .forEach((plugin) => {
        //
        // Register host API.
        //
        plugin.setHostApi({
          push: segue.push,
          pop: segue.pop,
          request: setTransactionRequest,
          connectionBackgroundClient,
        });

        //
        // Setup the plugin.
        //
        plugin.createIframe();
      });
  }, [plugins, tablePlugins]);

  return (
    <_PluginsContext.Provider value={{}}>
      {props.children}
    </_PluginsContext.Provider>
  );
}

type PluginsContext = {};
const _PluginsContext = React.createContext<PluginsContext | null>(null);
