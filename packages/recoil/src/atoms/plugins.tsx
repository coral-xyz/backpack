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
const PSYFI_TABLE_PLUGIN_URL = pluginURL("table-psyfi");

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
      /*
      {
        url: MANGO_TABLE_PLUGIN_URL,
        iconUrl:
          "https://cdn.discordapp.com/attachments/987809528848461914/987811342763302942/Group_1914_2.png",
        title: "Mango",
        activeWallet: get(activeWallet),
        connectionUrl: get(connectionUrl),
      },
			*/
      {
        url: DEGODS_TABLE_PLUGIN_URL,
        iconUrl: "assets/deadgods.png",
        title: "DeadGods",
        activeWallet: get(activeWallet),
        connectionUrl: get(connectionUrl),
      },
      /*
      {
        url: ANCHOR_TABLE_PLUGIN_URL,
        iconUrl:
          "https://pbs.twimg.com/profile_images/1537173219693711363/maYBbQGF_400x400.jpg",
        title: "Anchor",
        activeWallet: get(activeWallet),
        connectionUrl: get(connectionUrl),
      },
      {
        url: OPEN_ORDERS_PLUGIN_URL,
        iconUrl:
          "https://substackcdn.com/image/fetch/w_256,h_256,c_fill,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fdbf53918-04a8-40cf-b063-0769309bc98b_800x800.png",
        title: "Magic Eden",
        activeWallet: get(activeWallet),
        connectionUrl: get(connectionUrl),
      },
      {
        url: PSYFI_TABLE_PLUGIN_URL,
        iconUrl:
          "https://uploads-ssl.webflow.com/6158e3591ba06d14de4fd0df/61f900784e63439a5a052fed_PsyOptions.svg",
        title: "PsyOptions",
        activeWallet: get(activeWallet),
        connectionUrl: get(connectionUrl),
      },
			*/
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
