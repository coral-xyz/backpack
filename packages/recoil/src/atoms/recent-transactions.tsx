import { atomFamily, selectorFamily } from "recoil";
import {
  ParsedTransactionWithMeta,
  Connection,
  PublicKey,
} from "@solana/web3.js";
import { bootstrap } from "./bootstrap";
import { anchorContext } from "./wallet";

export const recentTransactions = atomFamily<
  Array<ParsedTransactionWithMeta> | null,
  string
>({
  key: "recentTransactionsMap",
  default: selectorFamily({
    key: "recentTransactionsMapDefault",
    get:
      (address: string) =>
      async ({ get }: any) => {
        const b = get(bootstrap);
        const { connection } = get(anchorContext);
        if (b.walletPublicKey.toString() === address) {
          return b.recentTransactions;
        } else {
          return await fetchRecentTransactions(
            connection,
            new PublicKey(address)
          );
        }
      },
  }),
});

export async function fetchRecentTransactions(
  connection: Connection,
  publicKey: PublicKey
): Promise<Array<ParsedTransactionWithMeta>> {
  const resp = await connection.getConfirmedSignaturesForAddress2(publicKey, {
    limit: 15,
  });

  const signatures = resp.map((s) => s.signature);
  const transactions: Array<ParsedTransactionWithMeta | null> =
    await connection.getParsedTransactions(signatures);
  return transactions.filter(
    (tx) => tx !== null
  ) as Array<ParsedTransactionWithMeta>;
}
