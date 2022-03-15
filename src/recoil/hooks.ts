import { useRecoilCallback, useRecoilTransaction_UNSTABLE } from "recoil";
import { solanaTokenAccountKeys, solanaTokenAccountsMap } from "./atoms";
import { TokenAccountWithKey } from "./types";

/**
 * Insert all of the token accounts.
 */
export const useUpdateAllSplTokenAccounts = () =>
  useRecoilCallback(
    ({ set }: any) =>
      async ({
        tokenAccounts,
        tokenMetadata,
      }: {
        tokenAccounts: TokenAccountWithKey[];
        tokenMetadata: any;
      }) => {
        // TODO: do we want to check if the atoms have changed before setting
        //       them?
        set(
          solanaTokenAccountKeys,
          tokenAccounts.map((a) => a.key.toString())
        );
        tokenAccounts.forEach((tokenAccount) => {
          set(
            solanaTokenAccountsMap(tokenAccount.key.toString()),
            tokenAccount
          );
        });

        //
        // TODO: set metadata and reset atoms?.
        //
        // set `atoms.solanaNftMetadata` here.
      }
  );
