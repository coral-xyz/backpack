import { atom, selector } from "recoil";
import { PublicKey, Keypair } from "@solana/web3.js";
import { BACKPACK_CONFIG_XNFT_PROXY, SIMULATOR_PORT } from "@coral-xyz/common";
import { activeWallet } from "../wallet";
import { solanaConnectionUrl } from "./preferences";
import { bootstrap } from "../bootstrap";

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

//
// Cached bundle proxy.
//
const PROXY_URL =
  BACKPACK_CONFIG_XNFT_PROXY === "development"
    ? "https://localhost:9999?inline=1&bundle="
    : "https://embed.xnfts.dev?inline=1&bundle=";

function pluginURL(pluginName: string) {
  return [
    // xnft wrapper
    "https://localhost:9999?inline=1&bundle=",
    // [pluginName]'s JS delivered by the local plugin server
    `http://localhost:8001/${pluginName}/dist/index.js`,
  ].join("");
}

function xnftUrl(url: string) {
  return [PROXY_URL, url].join("");
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
        install: {
          publicKey: Keypair.generate().publicKey,
        },
      },
      {
        url: AURORY_PLUGIN_URL,
        iconUrl: "assets/aurory.png",
        title: "Aurory",
        activeWallet: get(activeWallet),
        connectionUrl: get(solanaConnectionUrl),
        install: {
          publicKey: Keypair.generate().publicKey,
        },
      },
      {
        url: NETWORK_MONITOR,
        iconUrl:
          "https://pbs.twimg.com/profile_images/1472933274209107976/6u-LQfjG_400x400.jpg",
        title: "Monitor",
        activeWallet: get(activeWallet),
        connectionUrl: get(solanaConnectionUrl),
        install: {
          publicKey: Keypair.generate().publicKey,
        },
      },
      {
        url: PRICES_PLUGIN_URL,
        iconUrl: "assets/prices.png",
        title: "Prices",
        activeWallet: get(activeWallet),
        connectionUrl: get(solanaConnectionUrl),
        install: {
          publicKey: Keypair.generate().publicKey,
        },
      },
      {
        url: MANGO_TABLE_PLUGIN_URL,
        iconUrl: "assets/mango.png",
        title: "Mango",
        activeWallet: get(activeWallet),
        connectionUrl: get(solanaConnectionUrl),
        install: {
          publicKey: Keypair.generate().publicKey,
        },
      },
      {
        url: PSYFI_PLUGIN_URL,
        iconUrl: "assets/psyfi.png",
        title: "Psyfi",
        activeWallet: get(activeWallet),
        connectionUrl: get(solanaConnectionUrl),
        install: {
          publicKey: Keypair.generate().publicKey,
        },
      },
      {
        url: SIMULATOR_URL,
        iconUrl: "assets/simulator.png",
        title: "Simulator",
        activeWallet: get(activeWallet),
        connectionUrl: get(solanaConnectionUrl),
        install: {
          publicKey: Keypair.generate().publicKey,
        },
      },
    ];
  },
});

export const xnfts = atom({
  key: "xnfts",
  default: selector({
    key: "xnftsDefault",
    get: async ({ get }) => {
      const b = get(bootstrap);
      const _activeWallet = get(activeWallet);
      const _connectionUrl = get(solanaConnectionUrl);
      return (await b.xnfts).map((xnft) => {
        return {
          ...xnft,
          url: xnftUrl(xnft.metadataBlob.properties.bundle),
          iconUrl: xnft.metadataBlob.image,
          activeWallet: _activeWallet,
          connectionUrl: _connectionUrl,
          title: xnft.metadataBlob.name,
        };
      });
    },
  }),
});
