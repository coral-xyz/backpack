import { atom, atomFamily, selector } from "recoil";
import { PublicKey, Blockhash } from "@solana/web3.js";
import { Provider } from "@project-serum/anchor";
import { txHistoryConnection } from "./ignore";
import { bootstrap } from "./bootstrap";
import { anchorContext } from "./wallet";

export const recentTransactions = atomFamily<any | null, string>({
  key: "recentTransactionsMap",
  default: null,
  effects: (address: string) => [
    ({ setSelf, getPromise }: any) => {
      // TODO: This won't reload individual tokens unless we poll in the background.
      //       Easier thing to do would be to just fetch everytime on component mount.
      setSelf(
        getPromise(bootstrap).then((b: any) => {
          if (b.walletPublicKey.toString() === address) {
            return b.recentTransactions;
          } else {
            return getPromise(anchorContext).then(({ provider }: any) => {
              return fetchRecentTransactions(new PublicKey(address), provider);
            });
          }
        })
      );
    },
  ],
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
  publicKey: PublicKey,
  provider: Provider
) {
  const connection = txHistoryConnection();
  const resp = await connection.getConfirmedSignaturesForAddress2(publicKey, {
    limit: 15,
  });
  // @ts-ignore
  const signatures = resp.map((s) => s.signature);
  const transactions = await connection.getParsedTransactions(signatures);
  return transactions;
}
