import { selector } from "recoil";
import * as atoms from ".";

// full path to HTML is currently required, will be fixed in future
const OPEN_ORDERS_PLUGIN_URL = "https://localhost:4444/index.html";
const OPEN_ORDERS_ICON_URL =
  "https://pbs.twimg.com/media/FQuhVHfWQAEHTWM?format=jpg&name=4096x4096";

const MANGO_TABLE_PLUGIN_URL = "https://localhost:4445/index.html";
const DEGODS_TABLE_PLUGIN_URL = "https://localhost:4447/index.html";
const ANCHOR_TABLE_PLUGIN_URL = "https://localhost:4446/index.html";

//
// For now we just provide some default apps.
//
export const plugins = selector({
  key: "plugins",
  get: ({ get }: any) => {
    const activeWallet = get(atoms.activeWallet);
    const connectionUrl = get(atoms.connectionUrl);
    return [
      {
        url: OPEN_ORDERS_PLUGIN_URL,
        iconUrl: OPEN_ORDERS_ICON_URL,
        title: "Open Orders",
        activeWallet,
        connectionUrl,
      },
    ];
  },
});

export const tablePlugins = selector({
  key: "tablePlugins",
  get: ({ get }: any) => {
    const activeWallet = get(atoms.activeWallet);
    const connectionUrl = get(atoms.connectionUrl);
    return [
      {
        url: MANGO_TABLE_PLUGIN_URL,
        iconUrl: "",
        title: "Margin Accounts",
        activeWallet,
        connectionUrl,
      },
      {
        url: DEGODS_TABLE_PLUGIN_URL,
        iconUrl: "",
        title: "Staked Degods",
        activeWallet,
        connectionUrl,
      },
      {
        url: ANCHOR_TABLE_PLUGIN_URL,
        iconUrl: "",
        title: "Anchor Dev Tools",
        activeWallet,
        connectionUrl,
      },
    ];
  },
});
