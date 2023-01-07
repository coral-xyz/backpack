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
        wallets.map(({ publicKey }) => solanaMetadataMap({ publicKey }))
      )
    )
      .map(intoSolanaCollectionsMap)
      .map(({ publicKey, collections }) => {
        return {
          publicKey,
          collections: Object.values(collections),
        };
      });
    console.log("ARMANI CALCULATING");
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
        if (nftTokenMetadata) {
          nftMap[nftTokenMetadata.publicKey] = {
            metadataPublicKey: nftTokenMetadata.publicKey,
            nftToken,
            nftTokenMetadata,
          };
        }
      }
      return {
        publicKey,
        metadata: nftMap,
      };
    },
});

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
      const { nftToken, nftTokenMetadata } = metadataMap.metadata[nftId];
      const resp = await connection.customSplMetadataUri(
        [nftToken],
        [nftTokenMetadata]
      );
      const [_, uriData] = resp[0] ?? [];
      const nft = {
        id: nftTokenMetadata?.publicKey ?? "",
        blockchain: Blockchain.SOLANA,
        publicKey: nftTokenMetadata?.publicKey,
        mint: nftTokenMetadata?.account.mint,
        name:
          nftTokenMetadata?.account.data.name ??
          (uriData ? uriData.tokenMetaUriData.name : ""),
        description: uriData ? uriData.tokenMetaUriData.description : "",
        externalUrl: uriData
          ? externalResourceUri(
              uriData.tokenMetaUriData.external_url?.replace(/\0/g, "")
            )
          : "",
        imageUrl: uriData
          ? externalResourceUri(
              uriData.tokenMetaUriData.image?.replace(/\0/g, "")
            )
          : "",
        attributes: uriData
          ? uriData.tokenMetaUriData.attributes?.map(
              (a: { trait_type: string; uriData: string }) => ({
                traitType: a.trait_type,
                value: a.uriData,
              })
            )
          : [],
      };
      return nft;
    },
  equals: (m1, m2) => JSON.stringify(m1) === JSON.stringify(m2),
});

////////////////////////////////////////////////////////////////////////////////
// Non-atom utils and types.
////////////////////////////////////////////////////////////////////////////////

// Given all the token account data for a given wallet, transform into a
// collection array for UI presentation.
function intoSolanaCollectionsMap(metadataMap: MetadataMap): {
  publicKey: string;
  collections: {
    [collectionId: string]: NftCollection;
  };
} {
  const collections = {};
  Object.values(metadataMap.metadata).forEach((value) => {
    const [collectionId, metadataCollectionId] = (() => {
      const collectionId = JSON.stringify(
        value.nftTokenMetadata?.account.data.creators
      );
      const metadataCollectionId =
        value.nftTokenMetadata?.account.collection?.key || "";
      return [collectionId, metadataCollectionId];
    })();
    if (!collections[collectionId]) {
      collections[collectionId] = {
        id: collectionId,
        metadataCollectionId,
        name: collectionId,
        symbol: value.nftTokenMetadata?.account.data.symbol,
        tokenType: "",
        totalSupply: "",
        itemIds: [],
      };
    }
    collections[collectionId]!.itemIds.push(value.nftTokenMetadata?.publicKey);
  });
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
      nftToken: SolanaTokenAccountWithKeyString;
      nftTokenMetadata: TokenMetadataString | null;
    };
  };
};
