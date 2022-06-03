import { atomFamily, selectorFamily } from "recoil";
import { Connection, PublicKey } from "@solana/web3.js";
import { anchorContext } from "../";
import { bootstrap } from "./bootstrap";

export const recentTransactions = atomFamily<any | null, string>({
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
) {
  const resp = await connection.getConfirmedSignaturesForAddress2(publicKey, {
    limit: 15,
  });

  const signatures = resp.map((s) => s.signature);
  const transactions = await connection.getParsedTransactions(signatures);
  return transactions.filter((tx) => tx !== null);
}
