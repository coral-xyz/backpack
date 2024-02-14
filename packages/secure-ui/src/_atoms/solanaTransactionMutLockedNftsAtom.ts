import { selectorFamily, waitForAll } from "recoil";

import { solanaTransactionAccountsAtom } from "./solanaTransactionAccountsAtom";
import {
  GetCollectionNftForWalletResponse,
  userLockedNftsAtom,
} from "./userLockedNftsAtom";

export const solanaTransactionMutLockedNftsAtom = selectorFamily<
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
