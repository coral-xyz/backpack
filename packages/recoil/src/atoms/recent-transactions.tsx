import { atomFamily, selectorFamily } from "recoil";
import { ParsedTransactionWithMeta, PublicKey } from "@solana/web3.js";
import { Blockchain } from "@coral-xyz/common";
import { anchorContext } from "./solana/wallet";
import { fetchRecentSolanaTransactions } from "./solana/recent-transactions";

export const recentTransactions = atomFamily<
  Array<ParsedTransactionWithMeta> | null,
  { blockchain: Blockchain; address: string }
>({
  key: "recentTransactionsMap",
  default: selectorFamily({
    key: "recentTransactionsMapDefault",
    get:
      ({ blockchain, address }: { blockchain: Blockchain; address: string }) =>
      async ({ get }: any) => {
        switch (blockchain) {
          case Blockchain.SOLANA:
            const { connection } = get(anchorContext);
            return await fetchRecentSolanaTransactions(
              connection,
              new PublicKey(address)
            );
          case Blockchain.ETHEREUM:
            return [];
        }
      },
  }),
});
