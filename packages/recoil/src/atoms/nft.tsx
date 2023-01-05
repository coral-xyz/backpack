import type {
  Nft,
  NftCollection,
  NftCollectionWithIds,
  SolanaTokenAccountWithKey,
  TokenMetadata} from "@coral-xyz/common";
import {
  Blockchain
} from "@coral-xyz/common";
import { atom, atomFamily, selector, selectorFamily, waitForAll } from "recoil";

import { equalSelectorFamily } from "../equals";

import { ethereumNftCollections } from "./ethereum/nft";
import { customSplTokenAccounts } from "./solana/token";
import { ethereumConnectionUrl } from "./ethereum";
import { solanaConnectionUrl } from "./solana";
import { allWalletsDisplayed } from "./wallet";

export const nftCollectionsWithIds = selector<{
  [publicKey: string]: {
    publicKey: string;
    blockchain: Blockchain;
    nfts: {
      [metadataPublicKey: string]: {
        nftToken: SolanaTokenAccountWithKey;
        nftTokenMetadata: TokenMetadata | null;
      };
    };
    // Metadata PublicKey.
    itemIds: Array<string | null>;
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
          return customSplTokenAccounts({ publicKey, connectionUrl });
        })
      )
    ).map(({ nfts }, index) => {
      const _nfts = {};
      for (let k = 0; k < nfts.nftTokens.length; k += 1) {
        const nftToken = nfts.nftTokens[k];
        const nftTokenMetadata = nfts.nftTokenMetadata[k]!;
        _nfts[nftTokenMetadata.publicKey] = {
          nftToken,
          nftTokenMetadata,
        };
      }
      return {
        ...wallets[index],
        nfts: _nfts,
        itemIds: nfts.nftTokenMetadata.map((t) => t?.publicKey.toString()),
      };
    });
    const collectionWithIds: any = {};
    collectionsForAllWallets.forEach((c) => {
      collectionWithIds[c.publicKey!] = {
        ...c,
      };
    });
    return collectionWithIds;
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
      const collectionsAllWallets = get(nftCollectionsWithIds);
      const collections = collectionsAllWallets[publicKey];
      const { nftToken, nftTokenMetadata } = collections.nfts[nftId];

      // TODO
      return {} as { publicKey: string; connectionUrl: string; nftId: string };
    },
  equals: (m1, m2) => JSON.stringify(m1) === JSON.stringify(m2),
});
