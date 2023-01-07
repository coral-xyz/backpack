import type { Nft, NftCollection } from "@coral-xyz/common";
import {
  Blockchain,
  externalResourceUri,
  metadataAddress,
} from "@coral-xyz/common";
import { atom, atomFamily, selector, selectorFamily, waitForAll } from "recoil";

import { equalSelectorFamily } from "../equals";

import { ethereumNftById, ethereumWalletCollections } from "./ethereum/nft";
import { solanaNftById, solanaWalletCollections } from "./solana";
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
        wallets.map(({ blockchain, publicKey }) => {
          if (blockchain === Blockchain.SOLANA) {
            return solanaWalletCollections({ publicKey });
          } else {
            return ethereumWalletCollections({ publicKey });
          }
        })
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
      const wallets = get(allWallets);
      const { blockchain } = wallets.find((w) => w.publicKey === publicKey)!;
      if (blockchain === Blockchain.SOLANA) {
        return get(solanaNftById({ publicKey, connectionUrl, nftId }));
      } else {
        return get(ethereumNftById({ publicKey, connectionUrl, nftId }));
      }
    },
  equals: (m1, m2) => JSON.stringify(m1) === JSON.stringify(m2),
});
