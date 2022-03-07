import { useRecoilTransaction_UNSTABLE } from "recoil";
import { tokenAccountKeys, tokenAccountsMap } from "./atoms";
import { TokenAccountWithKey } from "./types";

/**
 * Insert all of the token accounts.
 */
export const useUpdateAllSplTokenAccounts = () =>
  useRecoilTransaction_UNSTABLE<[TokenAccountWithKey[], boolean]>(
    ({ get, reset, set }) =>
      (splTokenAccounts, shouldReset) => {
        if (shouldReset) {
          const keys = get(tokenAccountKeys) as string[];
          keys.forEach((key: string) => {
            reset(tokenAccountsMap(key));
          });
        }
        set(
          tokenAccountKeys,
          splTokenAccounts.map((a) => a.key.toString())
        );
        splTokenAccounts.forEach((splTokenAccount) => {
          set(
            tokenAccountsMap(splTokenAccount.key.toString()),
            splTokenAccount
          );
        });
      },
    []
  );
