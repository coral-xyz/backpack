import type { RecentTransaction } from "@coral-xyz/common";
import { Blockchain, ETH_NATIVE_MINT } from "@coral-xyz/common";
import { atomFamily, selectorFamily } from "recoil";

import { ethersContext } from "./ethereum/provider";
import {
  fetchNftMetadata,
  fetchRecentSolanaTransactionDetails,
} from "./solana/recent-transactions";

/**
 * Retrieve recent Ethereum transactions using alchemy_getAssetTransfers.
 * https://docs.alchemy.com/reference/alchemy-getassettransfers
 */
export const recentEthereumTransactions = atomFamily<
  Array<RecentTransaction>,
  {
    address: string;
    contractAddresses?: Array<string>;
  }
>({
  key: "recentEthereumTransactions",
  default: selectorFamily({
    key: "recentEthereumTransactionsDefault",
    get:
      ({
        address,
        contractAddresses,
      }: {
        address: string;
        contractAddresses: Array<string>;
      }) =>
      async ({ get }: any) => {
        const { provider: ethereumProvider } = get(ethersContext);
        const parameters: {
          withMetadata: boolean;
          order: string;
          contractAddresses?: Array<string>;
          category?: Array<string>;
        } = {
          withMetadata: true,
          order: "desc",
        };
        if (contractAddresses) {
          if (
            contractAddresses.length === 1 &&
            contractAddresses[0] === ETH_NATIVE_MINT
          ) {
            parameters.category = ["external"];
            // Don't use contract addresses here because ETH_NATIVE_MINT is just a
            // representation of native ETH in Backpack, not a real contract.
          } else {
            parameters.category = ["erc20"];
            parameters.contractAddresses = contractAddresses;
          }
        } else {
          // All asset transfers
          parameters.category = [
            "external",
            "erc20",
            "erc721",
            "erc1155",
            "specialnft",
          ];
        }
        const fromTransferPromise = ethereumProvider.send(
          "alchemy_getAssetTransfers",
          [
            {
              fromAddress: address,
              ...parameters,
            },
          ]
        );
        const toTransferPromise = ethereumProvider.send(
          "alchemy_getAssetTransfers",
          [
            {
              toAddress: address,
              ...parameters,
            },
          ]
        );
        const results = await Promise.allSettled([
          fromTransferPromise,
          toTransferPromise,
        ]);

        const isFulfilled = <T,>(
          input: PromiseSettledResult<T>
        ): input is PromiseFulfilledResult<T> => input.status === "fulfilled";

        const merged = results
          // Don't crash on promise rejections
          .filter(isFulfilled)
          .map((r) => r.value.transfers)
          .flat()
          .sort((a: any, b: any) => Number(b.blockNum) - Number(a.blockNum));

        return merged.map((t) => ({
          blockchain: Blockchain.ETHEREUM,
          date: new Date(t.metadata.blockTimestamp),
          signature: t.hash,
          // alchemy_getAssetTransfers doesn't support error status
          didError: false,
        }));
      },
  }),
});

/**
 * Retrieve recent Solana transactions using Helius API.
 */
export const recentSolanaTransactions = atomFamily<
  Array<any>,
  {
    address: string;
  }
>({
  key: "recentSolanaTransactions",
  default: selectorFamily({
    key: "recentSolanaTransactionsDefault",
    get:
      ({ address }: { address: string }) =>
      async () => {
        try {
          // get parsed transactions from Helius
          const heliusTransactionDetails =
            await fetchRecentSolanaTransactionDetails(address);

          return heliusTransactionDetails?.map((t: any) => ({
            blockchain: Blockchain.SOLANA,
            ...t,
          }));
        } catch (err) {
          console.error(err);
          return [];
        }
      },
  }),
});

export const metadataForRecentSolanaTransaction = selectorFamily<
  any,
  { transaction: any }
>({
  key: "metadataForRecentSolanaTransaction",
  get:
    ({ transaction }) =>
    async () => {
      try {
        const mint =
          transaction?.events?.nft?.nfts[0]?.mint ||
          transaction?.tokenTransfers[0]?.mint;
        if (!mint) {
          return undefined;
        }
        return await fetchNftMetadata(mint);
      } catch (err) {
        console.error(err);
        return undefined;
      }
    },
});
