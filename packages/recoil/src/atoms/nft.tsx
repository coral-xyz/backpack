import type {
  Nft,
  NftCollection,
  NftCollectionWithIds,
} from "@coral-xyz/common";
import { Blockchain } from "@coral-xyz/common";
import { atom, selector } from "recoil";

import { equalSelectorFamily } from "../equals";

import { ethereumNftCollections } from "./ethereum/nft";
import { solanaNftCollections } from "./solana/nft";
import { enabledBlockchains } from "./preferences";
import { activeEthereumWallet, activeWallets } from "./wallet";

type NftIDs = string[];
export const nftsByIds = equalSelectorFamily<Array<Nft | null>, NftIDs>({
  key: "nftById",
  get:
    (nftIds) =>
    ({ get }) => {
      const metadataById = get(nftMetadata);
      return nftIds.map((nftId) => metadataById.get(nftId) ?? null);
    },
  equals: (m1, m2) => JSON.stringify(m1) === JSON.stringify(m2),
});

export const nftById = equalSelectorFamily<Nft | null, string>({
  key: "nftById",
  get:
    (nftId) =>
    ({ get }) => {
      const metadataById = get(nftMetadata);
      return metadataById.get(nftId) ?? null;
    },
  equals: (m1, m2) => JSON.stringify(m1) === JSON.stringify(m2),
});

/**
 * All NFT collections keyed by Blockchain.
 */
export const nftCollectionsWithIds = selector<{
  [Blockchain.SOLANA]: NftCollectionWithIds[] | null;
  [Blockchain.ETHEREUM]: NftCollectionWithIds[] | null;
}>({
  key: "nftCollectionsWithIds",
  get: ({ get }) => {
    const collections = get(nftCollections);
    const blockchains = get(enabledBlockchains);
    const collectionsWithIds = {
      [Blockchain.SOLANA]:
        collections.solana?.map((collection) => {
          return {
            ...collection,
            items: collection.items.map((item) => item.id),
          };
        }) ?? null,
      [Blockchain.ETHEREUM]:
        collections.ethereum?.map((collection) => {
          return {
            ...collection,
            items: collection.items.map((item) => item.id),
          };
        }) ?? null,
    };
    // filter disabled blockchains
    Object.keys(collectionsWithIds).forEach((key: Blockchain) => {
      if (!blockchains.includes(key)) {
        delete collectionsWithIds[key];
      }
    });
    return collectionsWithIds;
  },
});

/**
 * Flat list of all nfts as source for nftById(s) atoms
 */
const nftMetadata = selector<Map<string, Nft>>({
  key: "nftMetadata",
  get: ({ get }: any) => {
    const collections = get(nftCollections);
    return new Map(
      [
        ...Object.values(collections.solana ?? {}),
        ...Object.values(collections.ethereum ?? {}),
      ]
        .flat()
        .map((c: NftCollection) => c.items)
        .flat()
        .map((nft: Nft) => [nft.id, nft])
    );
  },
});

/**
 * Poll local NFT data and create list of all as source for nftById(s) atoms
 * This atom breaks to global app rerender due to blockchain data polling.
 */
export const nftCollections = atom<{
  [Blockchain.SOLANA]: NftCollection[] | null;
  [Blockchain.ETHEREUM]: NftCollection[] | null;
}>({
  key: "nftCollections",
  effects: [
    ({ setSelf, onSet, getPromise }) => {
      let timeout;
      const pollLocalData = async (isInitial?: boolean) => {
        try {
          const [solana, ethereum, currentValue] = await Promise.all([
            getPromise(solanaNftCollections),
            getPromise(ethereumNftCollections),
            isInitial ? null : getPromise(nftCollections),
          ]);
          const newValue = {
            [Blockchain.SOLANA]: solana,
            [Blockchain.ETHEREUM]: ethereum,
          };
          if (JSON.stringify(newValue) !== JSON.stringify(currentValue)) {
            setSelf(newValue);
          }
        } catch (e) {
          // ensure polling continues even on error.
          console.error(e);
        }
        timeout = setTimeout(
          () => requestAnimationFrame(() => pollLocalData()),
          1000
        );
      };
      setSelf({
        [Blockchain.SOLANA]: null,
        [Blockchain.ETHEREUM]: null,
      });
      pollLocalData(true);
      onSet((_, __, isReset) => {
        if (isReset) {
          clearTimeout(timeout);
          pollLocalData();
        }
      });
      return () => {
        clearTimeout(timeout);
      };
    },
  ],
});
