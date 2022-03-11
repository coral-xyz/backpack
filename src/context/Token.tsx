import { useEffect } from "react";
import { useRecoilValue } from "recoil";
import { useSolanaWallet } from "../context/Wallet";
import { useUpdateAllSplTokenAccounts } from "../recoil/hooks";
import { TokenAccountWithKey } from "../recoil/types";
import * as atoms from "../recoil/atoms";
import { useSolanaConnection } from "../context/Connection";
import { useAnchorContext } from "../context/Anchor";

export function useLoadSplTokens() {
  const wallet = useSolanaWallet();
  const { tokenClient } = useAnchorContext();
  const { connection } = useSolanaConnection();
  const updateAllSplTokenAccounts = useUpdateAllSplTokenAccounts();
  const publicKey = wallet.publicKey;
  useEffect(() => {
    if (!publicKey) {
      return;
    }
    (async () => {
      try {
        // Fetch the accounts.
        const resp = await connection.getTokenAccountsByOwner(publicKey, {
          programId: tokenClient.programId,
        });
        // Decode the data.
        const tokenAccounts: TokenAccountWithKey[] = resp.value.map(
          ({ account, pubkey }) => ({
            ...tokenClient.coder.accounts.decode("Token", account.data),
            key: pubkey,
          })
        );
        // Set the recoil atoms.
        updateAllSplTokenAccounts(tokenAccounts, true);
      } catch (err) {
        // TODO show error notification
        console.error(err);
      }
    })();
  }, [connection, publicKey, updateAllSplTokenAccounts]);
}

export function useTokenAddresses(): string[] {
  return useRecoilValue(atoms.solanaTokenAccountKeys);
}
