import { atom, atomFamily, selector, selectorFamily } from "recoil";
import { Connection, Blockhash, PublicKey } from "@solana/web3.js";
import { Provider } from "@project-serum/anchor";
import { BackgroundSolanaConnection } from "../background";
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
          const { provider } = get(anchorContext);
          return await fetchRecentTransactions(
            connection,
            new PublicKey(address),
            provider
          );
        }
      },
  }),
});

export const recentBlockhash = atom<Blockhash | null>({
  key: "recentBlockhash",
  default: selector({
    key: "recentBlockhashDefault",
    get: ({ get }) => {
      const bs = get(bootstrap);
      return bs.recentBlockhash;
    },
  }),
});

export async function fetchRecentTransactions(
  connection: Connection,
  publicKey: PublicKey,
  provider: Provider
) {
  const resp = await connection.getConfirmedSignaturesForAddress2(publicKey, {
    limit: 15,
  });

  const signatures = resp.map((s) => s.signature);
  const transactions = await connection.getParsedTransactions(signatures);
  return transactions;
}
