import { selectorFamily, waitForAll } from "recoil";

import { solanaTransactionAccountsAtom } from "./solanaTransactionAccountsAtom";
import {
  GetCollectionNftForWalletResponse,
  userLockedNftsAtom,
} from "./userLockedNftsAtom";

export const solanaTransactionMutLockedNftsAtom = selectorFamily<
  GetCollectionNftForWalletResponse,
  {
    tx: string;
    publicKey: string;
  }
>({
  key: "solanaTransactionMutLockedNftsAtom",
  get:
    (request) =>
    async ({ get }) => {
      const lockedNfts = get(userLockedNftsAtom(request.publicKey));
      const transactionAccounts = get(
        solanaTransactionAccountsAtom(request.tx)
      );

      if (lockedNfts.length <= 0) {
        return [];
      }

      const writableAccounts = [
        ...transactionAccounts.writable,
        ...transactionAccounts.signedWritable,
      ];

      return lockedNfts.filter((nft) => writableAccounts.includes(nft.token));
    },
});

export const solanaAllTransactionMutLockedNftsAtom = selectorFamily<
  GetCollectionNftForWalletResponse,
  {
    txs: string[];
    publicKey: string;
  }
>({
  key: "solanaAllTransactionMutLockedNftsAtom",
  get:
    (request) =>
    async ({ get }) => {
      const lockedNfts = get(userLockedNftsAtom(request.publicKey));
      const allTransactionAccounts = get(
        waitForAll(request.txs.map((tx) => solanaTransactionAccountsAtom(tx)))
      );

      if (lockedNfts.length <= 0) {
        return [];
      }

      const writableAccounts = allTransactionAccounts.reduce<string[]>(
        (collectedAccounts, accounts) => {
          const writable = [...accounts.writable, ...accounts.signedWritable];
          collectedAccounts.push(...writable);
          return collectedAccounts;
        },
        []
      );

      return lockedNfts.filter((nft) => writableAccounts.includes(nft.token));
    },
});
