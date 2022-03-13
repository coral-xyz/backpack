import { useRecoilCallback, useRecoilTransaction_UNSTABLE } from "recoil";
import { solanaTokenAccountKeys, solanaTokenAccountsMap } from "./atoms";
import { TokenAccountWithKey } from "./types";

/**
 * Insert all of the token accounts.
 */
export const useUpdateAllSplTokenAccounts = () =>
  useRecoilCallback(
    ({ set }: any) =>
      async (splTokenAccounts: TokenAccountWithKey[]) => {
				// TODO: do we want to check if the atoms have changed before setting
				//       them?
        set(
          solanaTokenAccountKeys,
          splTokenAccounts.map((a) => a.key.toString())
        );
        splTokenAccounts.forEach((splTokenAccount) => {
          set(
            solanaTokenAccountsMap(splTokenAccount.key.toString()),
            splTokenAccount
          );
        });
      }
  );
