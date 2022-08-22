import { selector } from "recoil";
import { SIMULATOR_PORT } from "@coral-xyz/common";
import { activeWallet } from "../wallet";
import { solanaConnectionUrl } from "./preferences";

//
// Private dev plugins.
//
const MANGO_TABLE_PLUGIN_URL = pluginURL("xnft/mango");
const PRICES_PLUGIN_URL = pluginURL("xnft/prices");
const SIMULATOR_URL = `http://localhost:${SIMULATOR_PORT}`;
const PSYFI_PLUGIN_URL = pluginURL("xnft/psyfi");
const AURORY_PLUGIN_URL = pluginURL("xnft/aurory");

//
// xnft-program-library
//
const DEGODS_TABLE_PLUGIN_URL = pluginURL(
  "xnft-program-library/packages/deadgods"
);
const NETWORK_MONITOR = pluginURL(
  "xnft-program-library/packages/network-monitor"
);

function pluginURL(pluginName: string) {
  return [
    // xnft wrapper
    "https://localhost:9999?inline=1&bundle=",
    // [pluginName]'s JS delivered by the local plugin server
    `http://localhost:8001/${pluginName}/dist/index.js`,
  ].join("");
}

//
// For now we just provide some default apps.
//
export const plugins = selector({
  key: "plugins",
  get: ({ get }: any) => {
    return [
      {
        url: DEGODS_TABLE_PLUGIN_URL,
        iconUrl: "assets/deadgods.png",
        title: "DeadGods",
        activeWallet: get(activeWallet),
        connectionUrl: get(solanaConnectionUrl),
      },
      {
        url: AURORY_PLUGIN_URL,
        iconUrl: "assets/aurory.png",
        title: "Aurory",
        activeWallet: get(activeWallet),
        connectionUrl: get(solanaConnectionUrl),
      },
      {
        url: NETWORK_MONITOR,
        iconUrl:
          "https://pbs.twimg.com/profile_images/1472933274209107976/6u-LQfjG_400x400.jpg",
        title: "Monitor",
        activeWallet: get(activeWallet),
        connectionUrl: get(solanaConnectionUrl),
      },
      {
        url: PRICES_PLUGIN_URL,
        iconUrl: "assets/prices.png",
        title: "Prices",
        activeWallet: get(activeWallet),
        connectionUrl: get(solanaConnectionUrl),
      },
      {
        url: MANGO_TABLE_PLUGIN_URL,
        iconUrl: "assets/mango.png",
        title: "Mango",
        activeWallet: get(activeWallet),
        connectionUrl: get(solanaConnectionUrl),
      },
      {
        url: PSYFI_PLUGIN_URL,
        iconUrl: "assets/psyfi.png",
        title: "Psyfi",
        activeWallet: get(activeWallet),
        connectionUrl: get(solanaConnectionUrl),
      },
      {
        url: SIMULATOR_URL,
        iconUrl: "assets/simulator.png",
        title: "Simulator",
        activeWallet: get(activeWallet),
        connectionUrl: get(solanaConnectionUrl),
      },
    ];
  },
});
