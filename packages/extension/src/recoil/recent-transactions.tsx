import { atom, atomFamily, selector } from "recoil";
import { Blockhash, PublicKey, Connection } from "@solana/web3.js";
import { Provider } from "@project-serum/anchor";
import { bootstrap } from "./bootstrap";
import { anchorContext } from "./wallet";
import { BackgroundSolanaConnection } from "../background/solana-connection/client";

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
  const connection = process.env.RPC_WITH_TX_HISTORY
    ? new BackgroundSolanaConnection(process.env.RPC_WITH_TX_HISTORY)
    : provider.connection;

  const resp = await connection.getConfirmedSignaturesForAddress2(publicKey, {
    limit: 15,
  });

  const signatures = resp.map((s) => s.signature);
  const transactions = await connection.getParsedTransactions(signatures);
  return transactions;
}
