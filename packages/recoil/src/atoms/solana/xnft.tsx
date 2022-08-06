import { selector } from "recoil";
import { SIMULATOR_PORT } from "@coral-xyz/common";
import { activeWallet } from "./wallet";
import { connectionUrl } from "../preferences";

const OPEN_ORDERS_PLUGIN_URL = pluginURL("app");
const OPEN_ORDERS_ICON_URL =
  "https://pbs.twimg.com/media/FQuhVHfWQAEHTWM?format=jpg&name=4096x4096";

const HELLO_WORLD_PLUGIN_URL =
  "https://embed.xnfts.dev/5r1jwBmveWJaJVtkFCUFcboqv4sfYheaoEoBicAiJmEJ";

const MANGO_TABLE_PLUGIN_URL = pluginURL("xnft/mango");
const PRICES_PLUGIN_URL = pluginURL("xnft/prices");
const SIMULATOR_URL = `http://localhost:${SIMULATOR_PORT}`;
const PSYFI_PLUGIN_URL = pluginURL("xnft/psyfi");

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
        connectionUrl: get(connectionUrl),
      },
      {
        url: NETWORK_MONITOR,
        iconUrl:
          "https://pbs.twimg.com/profile_images/1472933274209107976/6u-LQfjG_400x400.jpg",
        title: "Monitor",
        activeWallet: get(activeWallet),
        connectionUrl: get(connectionUrl),
      },
      {
        url: PRICES_PLUGIN_URL,
        iconUrl: "assets/prices.png",
        title: "Prices",
        activeWallet: get(activeWallet),
        connectionUrl: get(connectionUrl),
      },
      {
        url: MANGO_TABLE_PLUGIN_URL,
        iconUrl: "assets/mango.png",
        title: "Mango",
        activeWallet: get(activeWallet),
        connectionUrl: get(connectionUrl),
      },
      {
        url: PSYFI_PLUGIN_URL,
        iconUrl: "assets/psyfi.png",
        title: "Psyfi",
        activeWallet: get(activeWallet),
        connectionUrl: get(connectionUrl),
      },
      {
        url: SIMULATOR_URL,
        iconUrl: "assets/simulator.png",
        title: "Simulator",
        activeWallet: get(activeWallet),
        connectionUrl: get(connectionUrl),
      },
    ];
  },
});

export const tablePlugins = selector({
  key: "tablePlugins",
  get: ({ get }: any) => {
    const _activeWallet = get(activeWallet);
    const _connectionUrl = get(connectionUrl);
    return [
      /*
      {
        url: HELLO_WORLD_PLUGIN_URL,
        iconUrl: "",
        title: "Hello World",
        activeWallet: _activeWallet,
        connectionUrl: _connectionUrl,
      },
      {
        url: MANGO_TABLE_PLUGIN_URL,
        iconUrl: "",
        title: "Margin Accounts",
        activeWallet: _activeWallet,
        connectionUrl: _connectionUrl,
      },
      {
        url: DEGODS_TABLE_PLUGIN_URL,
        iconUrl: "",
        title: "Staked Degods",
        activeWallet: _activeWallet,
        connectionUrl: _connectionUrl,
      },
      {
        url: ANCHOR_TABLE_PLUGIN_URL,
        iconUrl: "",
        title: "Anchor Dev Tools",
        activeWallet: _activeWallet,
        connectionUrl: _connectionUrl,
      },
      {
        url: PSYFI_TABLE_PLUGIN_URL,
        iconUrl: "",
        title: "PsyFinance Vaults",
        activeWallet: _activeWallet,
        connectionUrl: _connectionUrl,
      },
			*/
    ];
  },
});
