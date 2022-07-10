import { selector } from "recoil";
import { activeWallet, connectionUrl } from "./wallet";

const DEGODS_TABLE_PLUGIN_URL = pluginURL("table-degods");
const SIMULATOR_URL = "http://localhost:9990";

const ANCHOR_TABLE_PLUGIN_URL = pluginURL("table-anchor");
const PSYFI_TABLE_PLUGIN_URL = pluginURL("table-psyfi");
const OPEN_ORDERS_PLUGIN_URL = pluginURL("app");
const OPEN_ORDERS_ICON_URL =
  "https://pbs.twimg.com/media/FQuhVHfWQAEHTWM?format=jpg&name=4096x4096";
const HELLO_WORLD_PLUGIN_URL =
  "https://embed.xnfts.dev/5r1jwBmveWJaJVtkFCUFcboqv4sfYheaoEoBicAiJmEJ";
// "https://localhost:9999/5r1jwBmveWJaJVtkFCUFcboqv4sfYheaoEoBicAiJmEJ";
const MANGO_TABLE_PLUGIN_URL = pluginURL("table-mango");

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
        url: SIMULATOR_URL,
        iconUrl: "assets/simulator.png",
        title: "Simulator",
        activeWallet: get(activeWallet),
        connectionUrl: get(connectionUrl),
        componentId: "simulator",
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

function pluginURL(pluginName: string) {
  return [
    // xnft wrapper
    "https://localhost:9999?inline=1&bundle=",
    // [pluginName]'s JS delivered by the local plugin server
    `http://localhost:8001/${pluginName}/dist/index.js`,
  ].join("");
}
