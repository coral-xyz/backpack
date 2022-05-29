import { selector } from "recoil";
import { activeWallet, connectionUrl } from "./wallet";

// full path to HTML is currently required, will be fixed in future
const OPEN_ORDERS_PLUGIN_URL = "https://localhost:4444/index.html";
const OPEN_ORDERS_ICON_URL =
  "https://pbs.twimg.com/media/FQuhVHfWQAEHTWM?format=jpg&name=4096x4096";

const MANGO_TABLE_PLUGIN_URL = "https://localhost:4445/index.html";
const DEGODS_TABLE_PLUGIN_URL = "https://localhost:4447/index.html";
const ANCHOR_TABLE_PLUGIN_URL = "https://localhost:4446/index.html";
const PSYFI_TABLE_PLUGIN_URL = "https://localhost:6969/index.html";

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
        title: "Open Orders",
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
        activeWallet,
        connectionUrl,
      },
    ];
  },
});
