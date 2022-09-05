import { atom, selector } from "recoil";
import { PublicKey, Keypair } from "@solana/web3.js";
import {
  Blockchain,
  BACKPACK_CONFIG_XNFT_PROXY,
  SIMULATOR_PORT,
} from "@coral-xyz/common";
import { solanaPublicKey, activePublicKeys } from "../wallet";
import { externalResourceUri } from "@coral-xyz/common-public";
import { solanaConnectionUrl } from "./preferences";
import { connectionUrls } from "../preferences";
import { bootstrap } from "../bootstrap";

//
// Private dev plugins.
//
const SIMULATOR_URL = `http://localhost:${SIMULATOR_PORT}`;
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

export function xnftUrl(url: string) {
  const uri = externalResourceUri(url);
  return [PROXY_URL, uri].join("");
}

//
// For now we just provide some default apps.
//
export const plugins = selector({
  key: "plugins",
  get: ({ get }: any) => {
    return [
      {
        url: SIMULATOR_URL,
        iconUrl: "assets/simulator.png",
        title: "Simulator",
        activeWallets: get(activePublicKeys),
        connectionUrls: get(connectionUrls),
        install: {
          publicKey: PublicKey.default.toString(),
          account: {
            xnft: Keypair.generate().publicKey.toString(),
          },
        },
      },
      /*
      {
        url: DEGODS_TABLE_PLUGIN_URL,
        iconUrl: "assets/deadgods.png",
        title: "DeadGods",
        activeWallets: get(activePublicKeys),
        connectionUrls: get(connectionUrls),
        install: {
          publicKey: Keypair.generate().publicKey.toString(),
          account: {
            xnft: Keypair.generate().publicKey.toString(),
          },
        },
      },
      {
        url: AURORY_PLUGIN_URL,
        iconUrl: "assets/aurory.png",
        title: "Aurory",
        activeWallets: get(activePublicKeys),
        connectionUrls: get(connectionUrls),
        install: {
          publicKey: Keypair.generate().publicKey.toString(),
          account: {
            xnft: Keypair.generate().publicKey.toString(),
          },
        },
      },
      {
        url: NETWORK_MONITOR,
        iconUrl:
          "https://pbs.twimg.com/profile_images/1472933274209107976/6u-LQfjG_400x400.jpg",
        title: "Monitor",
        activeWallets: get(activePublicKeys),
        connectionUrls: get(connectionUrls),
        install: {
          publicKey: Keypair.generate().publicKey.toString(),
          account: {
            xnft: Keypair.generate().publicKey.toString(),
          },
        },
      },
      {
        url: PRICES_PLUGIN_URL,
        iconUrl: "assets/prices.png",
        title: "Prices",
        activeWallets: get(activePublicKeys),
        connectionUrls: get(connectionUrls),
        install: {
          publicKey: Keypair.generate().publicKey.toString(),
          account: {
            xnft: Keypair.generate().publicKey.toString(),
          },
        },
      },
      {
        url: MANGO_TABLE_PLUGIN_URL,
        iconUrl: "assets/mango.png",
        title: "Mango",
        activeWallet: get(activePublicKeys),
        connectionUrls: get(connectionUrls),
        install: {
          publicKey: Keypair.generate().publicKey.toString(),
          account: {
            xnft: Keypair.generate().publicKey.toString(),
          },
        },
      },
      {
        url: PSYFI_PLUGIN_URL,
        iconUrl: "assets/psyfi.png",
        title: "Psyfi",
        activeWallets: get(activePublicKeys),
        connectionUrls: get(connectionUrls),
        install: {
          publicKey: Keypair.generate().publicKey.toString(),
          account: {
            xnft: Keypair.generate().publicKey.toString(),
          },
        },
      },
			*/
    ];
  },
});

export const xnfts = atom({
  key: "xnfts",
  default: selector({
    key: "xnftsDefault",
    get: async ({ get }) => {
      const b = get(bootstrap);
      const _activeWallets = get(activePublicKeys);
      const _connectionUrls = get(connectionUrls);
      return (await b.xnfts).map((xnft) => {
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
