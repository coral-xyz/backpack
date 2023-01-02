import type {
  Nft,
  NftCollection,
  NftCollectionWithIds,
} from "@coral-xyz/common";
import { Blockchain } from "@coral-xyz/common";
import { atom, atomFamily, selector, selectorFamily, waitForAll } from "recoil";

import { equalSelectorFamily } from "../equals";

import { ethereumNftCollections } from "./ethereum/nft";
import { solanaNftCollections } from "./solana/nft";
import { ethereumConnectionUrl } from "./ethereum";
import { solanaConnectionUrl } from "./solana";
import { allWallets, allWalletsDisplayed } from "./wallet";

/**
 * Poll local NFT data and create list of all as source for nftById(s) atoms
 * This atom breaks to global app rerender due to blockchain data polling.
 */
export const nftCollections = atomFamily<
  {
    blockchain: Blockchain | null;
    collection: NftCollection[] | null;
    publicKey: string | null;
  },
  {
    publicKey: string;
    connectionUrl: string;
  }
>({
  key: "nftCollections",
  default: selectorFamily({
    key: "nftCollectionsDefault",
    get:
      ({ publicKey, connectionUrl }) =>
      ({ get }) => {
        const wallets = get(allWallets);
        const wallet = wallets.find((w) => w.publicKey === publicKey);
        const collection =
          wallet!.blockchain === Blockchain.SOLANA
            ? get(solanaNftCollections({ publicKey, connectionUrl }))
            : get(ethereumNftCollections({ publicKey, connectionUrl }));
        return {
          collection,
          blockchain: wallet!.blockchain,
          publicKey,
        };
      },
  }),
  effects: ({ publicKey, connectionUrl }) => [
    ({ setSelf, onSet, getPromise }) => {
      let timeout;
      getPromise(allWallets).then((_allWallets) => {
        const pollLocalData = async (isInitial?: boolean) => {
          const wallet = _allWallets.find((w) => w.publicKey === publicKey);
          if (!wallet) {
            throw new Error("invariant violation");
          }
          try {
            const [collection, currentValue] = await Promise.all([
              getPromise(
                wallet.blockchain === Blockchain.SOLANA
                  ? solanaNftCollections({ publicKey, connectionUrl })
                  : ethereumNftCollections({ publicKey, connectionUrl })
              ),
              isInitial
                ? null
                : getPromise(nftCollections({ publicKey, connectionUrl })),
            ]);
            const newValue = {
              collection,
              blockchain: wallet.blockchain,
              publicKey,
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
        pollLocalData(true);
        onSet(() => {
          clearTimeout(timeout);
          pollLocalData();
        });
      });
      return () => {
        clearTimeout(timeout);
      };
    },
  ],
});

export const nftCollectionsWithIds = selector<{
  [publicKey: string]: {
    blockchain: Blockchain;
    collectionWithIds: Array<NftCollectionWithIds> | null;
  };
}>({
  key: "nftCollectionsWithIds",
  get: ({ get }) => {
    const wallets = get(allWalletsDisplayed);
    const collectionsForAllWallets = get(
      waitForAll(
        wallets.map(({ publicKey, blockchain }) => {
          let connectionUrl: string;
          if (blockchain === Blockchain.SOLANA) {
            connectionUrl = get(solanaConnectionUrl);
          } else {
            connectionUrl = get(ethereumConnectionUrl);
          }
          return nftCollections({ publicKey, connectionUrl });
        })
      )
    );
    const collectionWithIds: any = {};
    collectionsForAllWallets.forEach((c) => {
      collectionWithIds[c.publicKey!] = {
        blockchain: c.blockchain,
        // TODO: c.collection is null and throwing an error
        collectionWithIds: c!.collection!.map((c) => ({
          ...c,
          itemIds: c.items.map((item) => item.id),
        })),
      };
    });
    return collectionWithIds;
  },
});

/**
 * Flat list of all nfts as source for nftById(s) atoms
 */
const nftMetadata = selectorFamily<
  Map<string, Nft>,
  {
    publicKey: string;
    connectionUrl: string;
  }
>({
  key: "nftMetadata",
  get:
    ({ publicKey, connectionUrl }) =>
    ({ get }: any) => {
      const collections = get(nftCollections({ publicKey, connectionUrl }));
      return new Map(
        collections
          .collection!.map((c: NftCollection) => c.items)
          .flat()
          .map((nft: Nft) => [nft.id, nft])
      );
    },
});

type NftIDs = string[];
export const nftsByIds = equalSelectorFamily<
  Array<Nft | null>,
  { publicKey: string; connectionUrl: string; nftIds: NftIDs }
>({
  key: "nftsById",
  get:
    ({ nftIds, publicKey, connectionUrl }) =>
    ({ get }) => {
      const metadataById = get(nftMetadata({ publicKey, connectionUrl }));
      return nftIds.map((nftId) => metadataById.get(nftId) ?? null);
    },
  equals: (m1, m2) => JSON.stringify(m1) === JSON.stringify(m2),
});

export const nftById = equalSelectorFamily<
  Nft | null,
  { publicKey: string; connectionUrl: string; nftId: string }
>({
  key: "nftById",
  get:
    ({ publicKey, connectionUrl, nftId }) =>
    ({ get }) => {
      const metadataById = get(nftMetadata({ publicKey, connectionUrl }));
      return metadataById.get(nftId) ?? null;
    },
  equals: (m1, m2) => JSON.stringify(m1) === JSON.stringify(m2),
});
