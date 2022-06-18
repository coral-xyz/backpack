import { selector } from "recoil";
import { activeWallet, connectionUrl } from "./wallet";

const OPEN_ORDERS_PLUGIN_URL = pluginURL("app");
const OPEN_ORDERS_ICON_URL =
  "https://pbs.twimg.com/media/FQuhVHfWQAEHTWM?format=jpg&name=4096x4096";

const HELLO_WORLD_PLUGIN_URL =
  "https://embed.xnfts.dev/5r1jwBmveWJaJVtkFCUFcboqv4sfYheaoEoBicAiJmEJ";
// "https://localhost:9999/5r1jwBmveWJaJVtkFCUFcboqv4sfYheaoEoBicAiJmEJ";
const MANGO_TABLE_PLUGIN_URL = pluginURL("table-mango");
const DEGODS_TABLE_PLUGIN_URL = pluginURL("table-degods");
const ANCHOR_TABLE_PLUGIN_URL = pluginURL("table-anchor");

function pluginURL(pluginName: string) {
  return [
    // xnft wrapper
    "https://localhost:9999?inline=1&bundle=",
    // [pluginName]'s JS delivered by the local plugin server
    `http://localhost:8001/${pluginName}/dist/bundle.js`,
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
        url: OPEN_ORDERS_PLUGIN_URL,
        iconUrl: OPEN_ORDERS_ICON_URL,
        title: "Orders",
        activeWallet: get(activeWallet),
        connectionUrl: get(connectionUrl),
      },
      {
        url: OPEN_ORDERS_PLUGIN_URL,
        iconUrl: OPEN_ORDERS_ICON_URL,
        title: "Orders",
        activeWallet: get(activeWallet),
        connectionUrl: get(connectionUrl),
      },
      {
        url: OPEN_ORDERS_PLUGIN_URL,
        iconUrl: OPEN_ORDERS_ICON_URL,
        title: "Orders",
        activeWallet: get(activeWallet),
        connectionUrl: get(connectionUrl),
      },
      {
        url: OPEN_ORDERS_PLUGIN_URL,
        iconUrl: OPEN_ORDERS_ICON_URL,
        title: "Orders",
        activeWallet: get(activeWallet),
        connectionUrl: get(connectionUrl),
      },
      {
        url: OPEN_ORDERS_PLUGIN_URL,
        iconUrl: OPEN_ORDERS_ICON_URL,
        title: "Orders",
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
    ];
  },
});
