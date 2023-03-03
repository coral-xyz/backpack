import {
  Blockchain,
  DEFAULT_PUBKEY_STR,
  externalResourceUri,
  fetchXnfts,
  SIMULATOR_PORT,
  XNFT_GG_LINK,
  XNFT_PROGRAM_ID,
} from "@coral-xyz/common";
import { PublicKey } from "@solana/web3.js";
import * as cheerio from "cheerio";
import { atomFamily, selectorFamily } from "recoil";

import { featureGates } from "../feature-gates";
import { isDeveloperMode } from "../preferences";
import { connectionUrls } from "../preferences/connection-urls";
import { primaryWallets } from "../primaryWallets";
import { activePublicKeys } from "../wallet";

import { anchorContext } from "./wallet";

export const SIMULATOR_URL = `http://localhost:${SIMULATOR_PORT}`;

export const appStoreMetaTags = selectorFamily<
  { name?: string; description?: string; image?: string },
  string
>({
  key: "appStoreMetaTags",
  get: (xnft) => async () => {
    const res = await fetch(`${XNFT_GG_LINK}/app/${xnft}`);
    const html = await res.text();

    const $ = cheerio.load(html);
    const name = $('meta[name="title"]').attr("content")?.split(" - ")[0];
    const description = $('meta[name="description"]').attr("content");
    const image = $('meta[property="og:image"]').attr("content");

    return {
      name,
      description,
      image,
    };
  },
});

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
      ({ publicKey }: { connectionUrl: string; publicKey: string }) =>
      async ({ get }) => {
        const _activeWallets = get(activePublicKeys);
        const _connectionUrls = get(connectionUrls);
        const provider = get(anchorContext).provider;
        const { DROPZONE_ENABLED } = get(featureGates);

        if (!publicKey) {
          return [];
        }
        const isDropzoneWallet =
          DROPZONE_ENABLED &&
          get(primaryWallets).some(
            (w) =>
              w.blockchain === Blockchain.SOLANA && w.publicKey === publicKey
          );
        const xnfts = await fetchXnfts(
          provider,
          new PublicKey(publicKey),
          isDropzoneWallet
        );
        return xnfts.map((xnft) => {
          return {
            ...xnft,
            url: xnft.xnft.xnft.manifest.entrypoints.default.web,
            splashUrls: xnft.xnft.xnft.manifest.splash ?? {},
            iconUrl: externalResourceUri(xnft.metadata.image),
            activeWallet: _activeWallets[Blockchain.SOLANA],
            activeWallets: _activeWallets,
            connectionUrl: _connectionUrls[Blockchain.SOLANA],
            connectionUrls: _connectionUrls,
            title: xnft.metadata.name,
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
          splashUrls: {},
          // splashUrls: {
          //   lg: "assets/one/distressed-background.png",
          // },
          title: "Simulator",
          activeWallets: get(activePublicKeys),
          connectionUrls: get(connectionUrls),
          install: {
            publicKey: DEFAULT_PUBKEY_STR,
            account: {
              xnft: DEFAULT_PUBKEY_STR,
            },
          },
        } as (typeof plugins)[0];

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
