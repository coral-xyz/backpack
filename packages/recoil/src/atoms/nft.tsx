import type { Nft, NftCollection } from "@coral-xyz/common";
import {
  BACKEND_API_URL,
  Blockchain,
  EnrichedNotification,
  fetchXnftsFromPubkey,
  WHITELISTED_CHAT_COLLECTIONS,
} from "@coral-xyz/common";
import {
  selector,
  selectorFamily,
  useRecoilValue,
  useRecoilValueLoadable,
  waitForAll,
} from "recoil";

import { equalSelectorFamily } from "../equals";

import { ethereumNftById, ethereumWalletCollections } from "./ethereum/nft";
import { ethereumConnectionUrl } from "./ethereum";
import { xnftJwt } from "./preferences";
import {
  anchorContext,
  isOneLive,
  solanaConnectionUrl,
  solanaNftById,
  solanaWalletCollections,
} from "./solana";
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
    return allWalletCollections.filter(Boolean) as Array<{
      publicKey: string;
      collections: Array<NftCollection>;
    }>;
  },
});

export const nftById = equalSelectorFamily<
  Nft | null,
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

export const nftsByOwner = selectorFamily<
  { nfts: Array<Nft> },
  {
    publicKey: string;
    blockchain: Blockchain;
  }
>({
  key: "nftsByOwner",
  get:
    ({
      publicKey,
      blockchain,
    }: {
      publicKey: string;
      blockchain: Blockchain;
    }) =>
    async ({ get }: any) => {
      try {
        const nftCollections =
          blockchain === Blockchain.SOLANA
            ? get(solanaWalletCollections({ publicKey }))
            : get(ethereumWalletCollections({ publicKey }));
        const connectionUrl =
          blockchain === Blockchain.ETHEREUM
            ? get(ethereumConnectionUrl)
            : get(solanaConnectionUrl);
        const allItems: string[] = [];
        nftCollections?.collections?.map((x) =>
          x.itemIds?.map((nftId) => allItems.push(nftId))
        );
        const allNfts = get(
          waitForAll(
            allItems.map((id) => {
              return nftById({ publicKey, connectionUrl, nftId: id });
            })
          )
        );
        return allNfts;
      } catch (e) {
        console.error(e);
        return [];
      }
    },
});

export const nftsByIds = selectorFamily<
  Array<Nft>,
  {
    nftIds: { nftId: string; publicKey: string }[];
    blockchain: Blockchain;
  }
>({
  key: "nftsByIds",
  get:
    ({
      nftIds,
      blockchain,
    }: {
      nftIds: { nftId: string; publicKey: string }[];
      blockchain: Blockchain;
    }) =>
    async ({ get }) => {
      const connectionUrl =
        blockchain === Blockchain.ETHEREUM
          ? get(ethereumConnectionUrl)
          : get(solanaConnectionUrl);

      const allNfts = get(
        waitForAll(
          nftIds.map(({ nftId, publicKey }) => {
            if (blockchain === Blockchain.SOLANA) {
              return solanaNftById({ publicKey, connectionUrl, nftId });
            } else {
              return ethereumNftById({ publicKey, connectionUrl, nftId });
            }
          })
        )
      );
      return allNfts.filter(Boolean) as Array<Nft>;
    },
});

export const collectionChatWL = selector<
  {
    id: string;
    name: string;
    image: string;
    collectionId: string;
    attributeMapping?: { [key: string]: string };
  }[]
>({
  key: "collectionChatWL",
  get: async ({ get }: any) => {
    const onLive = get(isOneLive);
    return onLive.madladsCollection &&
      onLive.madladsCollection !==
        "3PMczHyeW2ds7ZWDZbDSF3d21HBqG6yR4tG7vP6qczfj"
      ? [
          ...WHITELISTED_CHAT_COLLECTIONS,
          {
            id: onLive.madladsCollection,
            name: "Mad Lads",
            image: "https://www.madlads.com/mad_lads_logo.svg",
            collectionId: onLive.madladsCollection,
          },
        ]
      : WHITELISTED_CHAT_COLLECTIONS;
  },
});

export const chatByCollectionId = selectorFamily<
  {
    id: string;
    name: string;
    image: string;
    collectionId: string;
    attributeMapping?: { [key: string]: string };
    memberCount: number;
  } | null,
  string | undefined
>({
  key: "chatByCollectionId",
  get:
    (metadataCollectionId) =>
    async ({ get }: any) => {
      if (!metadataCollectionId) {
        return null;
      }
      const whitelistedChatCollections = get(collectionChatWL);

      const whitelistedChatCollection = whitelistedChatCollections.find(
        (x) => x.collectionId === metadataCollectionId && !x.attributeMapping
      );
      const chatInfo = whitelistedChatCollection ?? null;

      if (!chatInfo) {
        return null;
      }

      const response = await fetch(
        `${BACKEND_API_URL}/nft/members?room=${
          chatInfo.id
        }&type=collection&limit=${0}`
      );
      const json = await response.json();
      return { ...chatInfo, memberCount: json.count };
    },
});

export const chatByNftId = selectorFamily<
  {
    id: string;
    name: string;
    image: string;
    collectionId: string;
    attributeMapping?: { [key: string]: string };
    memberCount: number;
  } | null,
  { publicKey: string; connectionUrl: string; nftId: string }
>({
  key: "chatByNftId",
  get:
    (nftId) =>
    async ({ get }: any) => {
      const nft = get(nftById(nftId));

      const whitelistedChatCollections = get(collectionChatWL);

      const whitelistedChatCollection = whitelistedChatCollections.find((x) => {
        if (x.collectionId !== nft?.metadataCollectionId) {
          return false;
        }

        if (!x.attributeMapping) {
          return true;
        }
        const doesNOThaveAttributes = Object.keys(
          x.attributeMapping || {}
        ).find((attrName) => {
          if (
            !nft?.attributes?.find(
              (y) =>
                y.traitType === attrName &&
                y.value === x?.attributeMapping?.[attrName]
            )
          ) {
            return true;
          }
          return false;
        });

        if (doesNOThaveAttributes) {
          return false;
        }

        return true;
      });

      if (!whitelistedChatCollection) {
        return null;
      }

      const response = await fetch(
        `${BACKEND_API_URL}/nft/members?room=${
          whitelistedChatCollection.id
        }&limit=${0}`
      );
      const json = await response.json();

      return { ...whitelistedChatCollection, memberCount: json.count };
    },
});
