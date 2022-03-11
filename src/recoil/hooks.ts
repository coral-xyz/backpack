import { useRecoilTransaction_UNSTABLE } from "recoil";
import { solanaTokenAccountKeys, solanaTokenAccountsMap } from "./atoms";
import { TokenAccountWithKey } from "./types";

/**
 * Insert all of the token accounts.
 */
export const useUpdateAllSplTokenAccounts = () =>
  useRecoilTransaction_UNSTABLE<[TokenAccountWithKey[], boolean]>(
    ({ get, reset, set }) =>
      (splTokenAccounts, shouldReset) => {
        if (shouldReset) {
          const keys = get(solanaTokenAccountKeys) as string[];
          keys.forEach((key: string) => {
            reset(solanaTokenAccountsMap(key));
          });
        }
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
      },
    []
  );
