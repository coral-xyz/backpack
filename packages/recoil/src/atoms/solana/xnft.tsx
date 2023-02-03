import {
  BACKPACK_CONFIG_XNFT_PROXY,
  Blockchain,
  fetchXnfts,
  SIMULATOR_PORT,
  XNFT_PROGRAM_ID,
} from "@coral-xyz/common";
import { externalResourceUri } from "@coral-xyz/common-public";
import { PublicKey } from "@solana/web3.js";
import { atom, atomFamily, selector, selectorFamily } from "recoil";

import { isDeveloperMode } from "../preferences";
import { connectionUrls } from "../preferences/connection-urls";
import {
  activePublicKeys,
  allWalletsDisplayed,
  solanaPublicKey,
} from "../wallet";

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
  return uri;
}

export const collectibleXnft = selectorFamily<
  string | undefined,
  { collection?: string; mint?: string } | null
>({
  key: "collectibleXnft",
  get:
    (params) =>
    async ({ get }) => {
      if (!params) {
        return undefined;
      }

      const { connection } = get(anchorContext);
      if (params.collection) {
        const [maybeCollectionXnft] = await PublicKey.findProgramAddress(
          [Buffer.from("xnft"), new PublicKey(params.collection).toBytes()],
          XNFT_PROGRAM_ID
        );

        const acc = await connection.getAccountInfo(maybeCollectionXnft);
        if (acc) {
          return maybeCollectionXnft.toBase58();
        }
      }

      if (params.mint) {
        const [maybeItemXnft] = await PublicKey.findProgramAddress(
          [Buffer.from("xnft"), new PublicKey(params.mint).toBytes()],
          XNFT_PROGRAM_ID
        );
        const acc = await connection.getAccountInfo(maybeItemXnft);
        return acc ? maybeItemXnft.toBase58() : undefined;
      }
      return undefined;
    },
});

export const xnfts = atomFamily<
  any,
  {
    publicKey: string;
    connectionUrl: string;
  }
>({
  key: "xnfts",
  default: selectorFamily({
    key: "xnftsDefault",
    get:
      ({
        connectionUrl,
        publicKey,
      }: {
        connectionUrl: string;
        publicKey: string;
      }) =>
      async ({ get }) => {
        const _activeWallets = get(activePublicKeys);
        const _connectionUrls = get(connectionUrls);
        const provider = get(anchorContext).provider;
        const xnfts = await fetchXnfts(provider, new PublicKey(publicKey));
        return xnfts.map((xnft) => {
          return {
            ...xnft,
            url: xnftUrl(
              xnft.metadataBlob.xnft.manifest.entrypoints.default.web
            ),
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

export const plugins = selectorFamily<
  any,
  {
    publicKey: string;
    connectionUrl: string;
  }
>({
  key: "plugins",
  get:
    ({ publicKey, connectionUrl }) =>
    ({ get }) => {
      const developerMode = get(isDeveloperMode);
      const _xnfts = get(xnfts({ publicKey, connectionUrl }));
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

export const filteredPlugins = selectorFamily<
  any,
  {
    publicKey: string;
    connectionUrl: string;
  }
>({
  key: "filteredPlugins",
  get:
    ({ publicKey, connectionUrl }) =>
    ({ get }) => {
      const developerMode = get(isDeveloperMode);
      const _plugins = get(plugins({ publicKey, connectionUrl }));

      return _plugins.filter(
        (xnft) =>
          // @ts-ignore
          // hide autoinstalled ONE xNft -> entrypoint in collectibles.
          xnft.install.account.xnft.toString() !==
            "CkqWjTWzRMAtYN3CSs8Gp4K9H891htmaN1ysNXqcULc8" &&
          // hide autoinstalled Explorer xNft if not in devmode
          (developerMode ||
            // @ts-ignore
            xnft.install.account.xnft.toString() !==
              "oRN37pXigdDzpSPTe9ma5UWz9pZ4srKgS8To3juBNRi")
      );
    },
});
