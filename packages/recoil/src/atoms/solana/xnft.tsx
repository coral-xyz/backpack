import {
  BACKPACK_CONFIG_XNFT_PROXY,
  Blockchain,
 externalResourceUri,  fetchXnfts,
  SIMULATOR_PORT } from "@coral-xyz/common";
import { PublicKey } from "@solana/web3.js";
import { atom, selector } from "recoil";

import { isDeveloperMode } from "../preferences";
import { connectionUrls } from "../preferences/connection-urls";
import { activePublicKeys, solanaPublicKey } from "../wallet";

import { anchorContext } from "./wallet";

//
// Private dev plugins.
//
export const SIMULATOR_URL = `http://localhost:${SIMULATOR_PORT}`;
const MANGO_TABLE_PLUGIN_URL = pluginURL("xnft/mango");
const PRICES_PLUGIN_URL = pluginURL("xnft/prices");
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
    ? "https://localhost:9999?inline=1&v2=true&bundle="
    : "https://embed.xnfts.dev?inline=1&v2=true&bundle=";

function pluginURL(pluginName: string) {
  return [
    // xnft wrapper
    "https://localhost:9999?inline=1&bundle=",
    // [pluginName]'s JS delivered by the local plugin server
    `http://localhost:8001/${pluginName}/dist/index.js`,
  ].join("");
}

export function xnftUrl(url: string) {
  const uri = externalResourceUri(url);
  return [PROXY_URL, uri].join("");
}

export const xnfts = atom({
  key: "xnfts",
  default: selector({
    key: "xnftsDefault",
    get: async ({ get }) => {
      const _activeWallets = get(activePublicKeys);
      const _connectionUrls = get(connectionUrls);
      const provider = get(anchorContext).provider;
      const xnfts = await fetchXnfts(
        provider,
        new PublicKey(get(solanaPublicKey)!)
      );
      return xnfts.map((xnft) => {
        return {
          ...xnft,
          url: xnftUrl(xnft.metadataBlob.properties.bundle),
          iconUrl: externalResourceUri(xnft.metadataBlob.image),
          activeWallet: _activeWallets[Blockchain.SOLANA],
          activeWallets: _activeWallets,
          connectionUrl: _connectionUrls[Blockchain.SOLANA],
          connectionUrls: _connectionUrls,
          title: xnft.metadataBlob.name,
        };
      });
    },
  }),
});

export const plugins = selector({
  key: "plugins",
  get: ({ get }) => {
    const developerMode = get(isDeveloperMode);
    const _xnfts = get(xnfts);
    const plugins = [..._xnfts];
    // Display the simulator if developer mode is enabled
    if (developerMode) {
      // @ts-ignore
      const simulator = {
        url: SIMULATOR_URL,
        iconUrl: "assets/simulator.png",
        title: "Simulator",
        activeWallets: get(activePublicKeys),
        connectionUrls: get(connectionUrls),
        install: {
          publicKey: PublicKey.default.toString(),
          account: {
            xnft: PublicKey.default.toString(),
          },
        },
      } as typeof plugins[0];

      plugins.push(simulator);
    }
    return plugins;
  },
});

export const filteredPlugins = atom({
  key: "filteredPlugins",
  default: selector({
    key: "filteredPluginsDefault",
    get: async ({ get }) => {
      const developerMode = get(isDeveloperMode);
      const _plugins = get(plugins);

      return _plugins.filter(
        (xnft) =>
          // @ts-ignore
          // hide autoinstalled ONE xNft -> entrypoint in collectibles.
          xnft.install.account.xnft.toString() !==
            "4ekUZj2TKNoyCwnRDstvViCZYkhnhNoWNQpa5bBLwhq4" &&
          // hide autoinstalled Explorer xNft if not in devmode
          (developerMode ||
            // @ts-ignore
            xnft.install.account.xnft.toString() !==
              "3Db1fHHc2TGrCpBWnu6ZzdQd5pSoyGCmnh6nopNjv4P2")
      );
    },
  }),
});
