import { base64 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { solanaClientAtom } from "@coral-xyz/recoil";
import { PublicKey } from "@solana/web3.js";
import { selectorFamily } from "recoil";

import { solanaTransactionAccountsAtom } from "./solanaTransactionAccountsAtom";
import { solanaTransactionAtom } from "./solanaTransactionAtom";

export const solanaTxDowngradableAccountsAtom = selectorFamily<
  string[],
  {
    tx: string;
    publicKey: string;
  }
>({
  key: "solanaTxDowngradableAccountsAtom",
  get:
    (request) =>
    async ({ get }) => {
      try {
        const { transaction } = get(solanaTransactionAtom({ tx: request.tx }));
        const solanaClient = get(solanaClientAtom);
        const transactionAccounts = get(
          solanaTransactionAccountsAtom(request.tx)
        );
        const simulationAccounts = [
          ...transactionAccounts.writable,
          ...transactionAccounts.signedWritable,
        ];
        const writableAccounts = simulationAccounts.map(
          (k) => new PublicKey(k)
        );
        const preSimulationWritableAccounts =
          await solanaClient.connection.getMultipleAccountsInfo(
            writableAccounts
          );
        const simulation = await solanaClient.wallet.simulate({
          publicKey: new PublicKey(request.publicKey),
          tx: transaction,
          includedAccounts: simulationAccounts,
        });

        if (simulation.err || !simulation.accounts) {
          // doesnt need to be handled here since issues should be caught by blowfish.
          return [];
        }

        const unchangedAccounts = preSimulationWritableAccounts
          .map((_, i) => {
            return {
              pubkey: writableAccounts[i],
              account: preSimulationWritableAccounts[i],
            };
          })
          .filter(({ pubkey, account: presimulationAccount }, i) => {
            if (!presimulationAccount) {
              return false;
            }
            const simulationAccount = simulation.accounts![i];
            if (!simulationAccount && !presimulationAccount) {
              return true;
            } else if (!simulationAccount) {
              // TODO: This just means the simulation RPC response doesn't have the account
              // could be an indetermine state of the account.
              return false;
            }
            return (
              presimulationAccount.lamports === simulationAccount.lamports &&
              presimulationAccount.data.equals(
                base64.decode(simulationAccount.data[0]) // [encoded data, encoding name (always 'base64')]
              )
            );
          });

        return unchangedAccounts.map((account) => account.pubkey.toBase58());
      } catch (e) {
        console.error("failed to determine downgradable accounts", e?.message);
        return [];
      }
    },
});
