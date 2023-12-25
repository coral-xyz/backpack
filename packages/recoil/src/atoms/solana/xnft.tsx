import type { IdlAccounts } from "@coral-xyz/anchor";
import {
  Blockchain,
  DEFAULT_PUBKEY_STR,
  externalResourceUri,
  SIMULATOR_PORT,
  XNFT_GG_LINK,
} from "@coral-xyz/common";
import {
  BAKED_IN_XNFTS,
  fetchXnfts,
  XNFT_PROGRAM_ID,
} from "@coral-xyz/secure-clients/legacyCommon";
import { buildAnonymousProgram } from "@coral-xyz/xnft/lib/cjs/util";
import type { Xnft } from "@coral-xyz/xnft/lib/cjs/xnft";
import { PublicKey } from "@solana/web3.js";
import * as cheerio from "cheerio";
import { atomFamily, selectorFamily } from "recoil";

import {
  allBlockchainConnectionUrls,
  blockchainConnectionUrl,
  isDeveloperMode,
} from "../preferences";
import { enabledBlockchainsAtom } from "../secure-client";
import { activePublicKeys } from "../wallet";

import { anchorContext } from "./wallet";

export const SIMULATOR_URL = `http://localhost:${SIMULATOR_PORT}`;

// const xnftProgram = (conn: Connection): Program<Xnft> =>
//   new Program(
//     IDL,
//     XNFT_PROGRAM_ID,
//     new AnchorProvider(conn, new Wallet(Keypair.generate()), {})
//   );

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
      const program = buildAnonymousProgram(connection);

      if (params.collection) {
        const [maybeCollectionXnft] = await PublicKey.findProgramAddress(
          [Buffer.from("xnft"), new PublicKey(params.collection).toBytes()],
          XNFT_PROGRAM_ID
        );

        const acc = await connection.getAccountInfo(maybeCollectionXnft);
        if (acc) {
          const data = program.coder.accounts.decode<IdlAccounts<Xnft>["xnft"]>(
            "xnft",
            acc.data
          );

          if (!data.suspended) {
            return maybeCollectionXnft.toBase58();
          }
        }
      }

      if (params.mint) {
        const [maybeItemXnft] = await PublicKey.findProgramAddress(
          [Buffer.from("xnft"), new PublicKey(params.mint).toBytes()],
          XNFT_PROGRAM_ID
        );
        const acc = await connection.getAccountInfo(maybeItemXnft);

        if (acc) {
          const data = program.coder.accounts.decode<IdlAccounts<Xnft>["xnft"]>(
            "xnft",
            acc.data
          );
          return !data.suspended ? maybeItemXnft.toBase58() : undefined;
        }
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
        const _enabledBlockchains = get(enabledBlockchainsAtom);
        const _connectionUrls = _enabledBlockchains.map((blockchain) =>
          get(blockchainConnectionUrl(blockchain as Blockchain))
        );
        const provider = get(anchorContext).provider;

        if (!publicKey) {
          return [];
        }
        const xnfts = await fetchXnfts(provider, new PublicKey(publicKey));
        return xnfts.map((xnft) => {
          return {
            ...xnft,
            url: xnft.xnft.xnft.manifest.entrypoints.default.web,
            splashUrls: xnft.xnft.xnft.manifest.splash ?? {},
            iconUrl: externalResourceUri(xnft.metadata.image),
            activeWallet: _activeWallets[Blockchain.SOLANA],
            activeWallets: _activeWallets,
            // @ts-ignore
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
      const _connectionUrls = get(allBlockchainConnectionUrls);
      const plugins = [..._xnfts];

      // Display the simulator if developer mode is enabled
      // if (developerMode) {
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
        connectionUrls: _connectionUrls,
        install: {
          publicKey: DEFAULT_PUBKEY_STR,
          account: {
            xnft: DEFAULT_PUBKEY_STR,
          },
        },
      } as (typeof plugins)[0];

      plugins.push(simulator);
      // }
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
        (xnft: any) =>
          // hide autoinstalled ONE xNft -> entrypoint in collectibles.
          xnft.install.account.xnft.toString() !==
            BAKED_IN_XNFTS.one.publicKey &&
          // hide autoinstalled Explorer xNFT and the Mnemonic Inspect xNFT if not in devmode
          (developerMode ||
            xnft.install.account.xnft.toString() !==
              BAKED_IN_XNFTS.explorer.publicKey) &&
          (developerMode ||
            xnft.install.account.xnft.toString() !==
              BAKED_IN_XNFTS.mnemonics.publicKey)
      );
    },
});
