import type { EthereumNft, Nft, NftCollection } from "@coral-xyz/common";
import {
  Blockchain,
  EthereumConnectionUrl,
  externalResourceUri,
} from "@coral-xyz/common";
import { selectorFamily } from "recoil";

import { equalSelectorFamily } from "../../equals";
import { allWallets } from "../wallet";

import { ethereumConnectionUrl } from "./preferences";

const ethereumNftCollections = selectorFamily<
  { collections: Map<string, NftCollection>; nfts: Map<string, Nft> },
  { publicKey: string; connectionUrl: string }
>({
  key: "ethereumNftCollections",
  get:
    ({ publicKey, connectionUrl }) =>
    async ({ get }) => {
      const wallet = get(allWallets).find((w) => w.publicKey === publicKey);
      if (!wallet) {
        return {
          collections: new Map(),
          nfts: new Map(),
        };
      }

      const url = `${EthereumConnectionUrl.MAINNET}/nft/getNFTs?owner=${wallet.publicKey}`;
      const response = await fetch(url);
      const data = await response.json();

      const collections: Map<string, NftCollection> = new Map();
      const nfts: Map<string, Nft> = new Map();

      for (const nft of data.ownedNfts) {
        if (!nft.contractMetadata) continue;
        const collectionId = nft.contract.address;
        const collection = collections.get(collectionId);
        if (!collection) {
          collections.set(collectionId, {
            id: collectionId,
            metadataCollectionId: collectionId,
            symbol: nft.contractMetadata.symbol,
            tokenType: nft.contractMetadata.tokenType,
            totalSupply: nft.contractMetadata.totalSupply,
            itemIds: [],
          });
        }
        const c = collections.get(collectionId)!;
        // Token ID is not unique so prepend with contract address
        const id = `${nft.contract.address}/${nft.id.tokenId}`;
        c.itemIds.push(id);

        nfts.set(id, {
          id,
          blockchain: Blockchain.ETHEREUM,
          tokenId: nft.id.tokenId,
          contractAddress: nft.contract.address,
          name: nft.metadata.name || nft.contractMetadata.name,
          description: nft.metadata.description,
          externalUrl: externalResourceUri(nft.metadata.external_url),
          imageUrl:
            externalResourceUri(nft.metadata.image) ||
            externalResourceUri(nft.metadata.image_url),
          attributes:
            Array.isArray(nft.metadata.attributes) &&
            nft.metadata.attributes.map(
              (a: { trait_type: string; value: string }) => ({
                traitType: a.trait_type,
                value: a.value,
              })
            ),

          collectionName: nft.contractMetadata.name,
        });
      }

      return { collections, nfts };
    },
});

export const ethereumWalletCollections = selectorFamily<
  {
    publicKey: string;
    collections: Array<NftCollection>;
  },
  { publicKey: string }
>({
  key: "ethereumWalletCollections",
  get:
    ({ publicKey }) =>
    ({ get }) => {
      const connectionUrl = get(ethereumConnectionUrl);
      const { collections } = get(
        ethereumNftCollections({ publicKey, connectionUrl })
      );

      return {
        publicKey,
        collections: [...collections.values()],
      };
    },
});

export const ethereumNftById = equalSelectorFamily<
  Nft,
  { publicKey: string; connectionUrl: string; nftId: string }
>({
  key: "nftById",
  get:
    ({ publicKey, connectionUrl, nftId }) =>
    ({ get }) => {
      const { nfts } = get(
        ethereumNftCollections({ publicKey, connectionUrl })
      );
      return nfts.get(nftId)!;
    },
  equals: (m1, m2) => JSON.stringify(m1) === JSON.stringify(m2),
});
