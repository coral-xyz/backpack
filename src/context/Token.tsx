import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useEffect } from "react";
//import { deserializeSplTokenAccount } from "../../utils/deserializeSplTokenAccount";

/*
import {
  TokenAccountWithKey,
  useUpdateAllSplTokenAccounts,
} from "../recoil";
*/
/*
export const useLoadSplTokens = () => {
  const wallet = useWallet();
  const connection = useConnection();
  const updateAllSplTokenAccounts = useUpdateAllSplTokenAccounts();

  useEffect(() => {
    if (!publicKey) {
      return;
    }
    (async () => {
      try {
        const resp = await connection.getTokenAccountsByOwner(publicKey, {
          programId: TOKEN_PROGRAM_ID,
        });
        const tokenAccounts: TokenAccountWithKey[] = resp.value.map(
          ({ account, pubkey }) => ({
            ...deserializeSplTokenAccount(account),
            key: pubkey,
          })
        );
        updateAllSplTokenAccounts(tokenAccounts, true);
      } catch (err) {
        // TODO show error notification
        console.error(err);
      }
    })();
  }, [connection, publicKey, updateAllSplTokenAccounts]);
};
*/

/*
Game plan
- atom family per token account
- on app load use hook to load alltoken accounts
- whe loading the token accounts, set the atoms inside a transaction
*/
