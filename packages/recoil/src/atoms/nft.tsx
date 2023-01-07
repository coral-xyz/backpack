import type { Nft, NftCollection } from "@coral-xyz/common";
import {
  Blockchain,
  externalResourceUri,
  metadataAddress,
} from "@coral-xyz/common";
import { MetadataData } from "@metaplex-foundation/mpl-token-metadata";
import { PublicKey } from "@solana/web3.js";
import { atom, atomFamily, selector, selectorFamily, waitForAll } from "recoil";

import { equalSelectorFamily } from "../equals";

import { ethereumNftCollections } from "./ethereum/nft";
import { ethereumConnectionUrl } from "./ethereum";
import { solanaNftById,solanaWalletCollections } from "./solana";
import { allWallets, allWalletsDisplayed } from "./wallet";

export const nftCollectionsWithIds = selector<
  Array<{
    publicKey: string;
    collections: Array<NftCollection>;
  }>
>({
  key: "nftCollectionsWithIds",
  get: ({ get }) => {
    const wallets = get(allWalletsDisplayed);
    const allWalletCollections = get(
      waitForAll(
        wallets.map(({ publicKey }) => solanaWalletCollections({ publicKey }))
      )
    );
    return allWalletCollections;
  },
});

export const nftById = equalSelectorFamily<
  Nft,
  { publicKey: string; connectionUrl: string; nftId: string }
>({
  key: "nftById",
  get:
    ({ publicKey, connectionUrl, nftId }) =>
    ({ get }) => {
      return get(solanaNftById({ publicKey, connectionUrl, nftId }));
    },
  equals: (m1, m2) => JSON.stringify(m1) === JSON.stringify(m2),
});
