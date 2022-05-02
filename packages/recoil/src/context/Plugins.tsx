import React, { useEffect } from "react";
import { usePlugins, useTablePlugins, useNavigationSegue } from "../hooks";

export function PluginManager(props: any) {
  //const plugins = usePlugins();
  const tablePlugins = useTablePlugins();
  const segue = useNavigationSegue();

  //
  // Bootup all the plugins on the initial render.
  //
  useEffect(() => {
    //    const allPlugins = plugins.concat(tablePlugins);
    const allPlugins = tablePlugins;
    allPlugins.forEach((plugin) => {
      //
      // Register the navigation component.
      //
      plugin.setSegue(segue);

      //
      // Setup the plugin.
      //
      plugin.createIframe();
    });

    return () => {
      allPlugins.forEach((p) => p.destroyIframe());
    };
  }, [/*plugins, */ tablePlugins]);

  return (
    <_PluginsContext.Provider value={{}}>
      {props.children}
    </_PluginsContext.Provider>
  );
}

type PluginsContext = {};
const _PluginsContext = React.createContext<PluginsContext | null>(null);
