import type {
  Nft,
  NftCollection,
  RawMintString,
  SolanaTokenAccountWithKey,
  SolanaTokenAccountWithKeyString,
  TokenMetadata,
  TokenMetadataString,
} from "@coral-xyz/common";
import { Blockchain, externalResourceUri } from "@coral-xyz/common";
import { atom, atomFamily, selector, selectorFamily, waitForAll } from "recoil";

import { equalSelectorFamily } from "../equals";

import { ethereumNftCollections } from "./ethereum/nft";
import { anchorContext, solanaConnectionUrl } from "./solana/index";
import { customSplTokenAccounts } from "./solana/token";
import { ethereumConnectionUrl } from "./ethereum";
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
        wallets.map(({ publicKey }) => {
          return solanaMetadataMap({ publicKey });
        })
      )
    )
      .map(intoSolanaCollectionsMap)
      .map(({ publicKey, collections }) => {
        return {
          publicKey,
          collections: Object.values(collections),
        };
      });
    console.log("ARMANI HERE", allWalletCollections);
    return allWalletCollections;
  },
});

// Returns the nft metadata map for a given public key.
// Maps metadata pubkey -> account data.
const solanaMetadataMap = selectorFamily<MetadataMap, { publicKey: string }>({
  key: "metadataMap",
  get:
    ({ publicKey }) =>
    ({ get }) => {
      const connectionUrl = get(solanaConnectionUrl);
      const { nfts } = get(
        customSplTokenAccounts({ publicKey, connectionUrl })
      );

      // Transform into the map now.
      const nftMap = {};
      for (let k = 0; k < nfts.nftTokens.length; k += 1) {
        const nftToken = nfts.nftTokens[k];
        const nftTokenMetadata = nfts.nftTokenMetadata[k]!;
        nftMap[nftTokenMetadata.publicKey] = {
          metadataPublicKey: nftTokenMetadata.publicKey,
          nftToken,
          nftTokenMetadata,
        };
      }
      console.log("ARMANI RETURN", nftMap);
      return {
        publicKey,
        metadata: nftMap,
      };
    },
});

//       itemIds: nfts.nftTokenMetadata.map((t) => t?.publicKey.toString()),

export const nftById = equalSelectorFamily<
  Nft,
  { publicKey: string; connectionUrl: string; nftId: string }
>({
  key: "nftById",
  get:
    ({ publicKey, connectionUrl, nftId }) =>
    async ({ get }) => {
      const { connection } = get(anchorContext);
      const metadataMap = get(solanaMetadataMap({ publicKey }));
      const { nftToken, nftTokenMetadata } = metadataMap[nftId];
      const [_, uriData] = await connection.customSplMetadataUri(
        [nftToken],
        [nftTokenMetadata]
      )[0];
      return {
        id: uriData.publicKey,
        blockchain: Blockchain.SOLANA,
        publicKey: uriData.publicKey,
        mint: uriData.metadata.mint,
        name: uriData.metadata.data.name ?? uriData.tokenMetaUriData.name,
        description: uriData.tokenMetaUriData.description,
        externalUrl: externalResourceUri(
          uriData.tokenMetaUriData.external_url?.replace(/\0/g, "")
        ),
        imageUrl: externalResourceUri(
          uriData.tokenMetaUriData.image?.replace(/\0/g, "")
        ),
        attributes: uriData.tokenMetaUriData.attributes?.map(
          (a: { trait_type: string; uriData: string }) => ({
            traitType: a.trait_type,
            value: a.uriData,
          })
        ),
      };
    },
  equals: (m1, m2) => JSON.stringify(m1) === JSON.stringify(m2),
});

////////////////////////////////////

// Given all the token account data for a given wallet, transform into a
// collection array for UI presentation.
function intoSolanaCollectionsMap(metadataMap: MetadataMap): {
  publicKey: string;
  collections: {
    [collectionId: string]: NftCollection;
  };
} {
  console.log("ARMANI METADATAMAP ", metadataMap);
  const collections = {};

  Object.values(metadataMap.metadata).forEach((value) => {
    const [collectionId, collection, metadataCollectionId] = (() => {
      // todo
      return ["No Collection", collections["No Collection"], ""];
    })();
    if (!collection) {
      collections[collectionId] = {
        // TODO this can collide easily, better field for an ID?
        id: collectionId,
        metadataCollectionId,
        name: collectionId,
        symbol: value.nftTokenMetadata?.account.data.symbol,
        tokenType: "",
        totalSupply: "",
        items: [],
      };
    }
    collections[collectionId]!.items.push(value.nftTokenMetadata?.publicKey);
  });

  console.log("ARMANI RESP", collections, metadataMap.publicKey);

  return {
    publicKey: metadataMap.publicKey,
    collections,
  };
}

type MetadataMap = {
  publicKey: string;
  metadata: {
    [metadataPublicKey: string]: {
      metadataPublicKey: string;
      nftToken: SolanaTokenAccountWithKey;
      nftTokenMetadata: TokenMetadata | null;
    };
  };
};
