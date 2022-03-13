import { useEffect } from "react";
import { useRecoilValue } from "recoil";
import { useSolanaWallet } from "../context/Wallet";
import { useUpdateAllSplTokenAccounts } from "../recoil/hooks";
import { TokenAccountWithKey } from "../recoil/types";
import * as atoms from "../recoil/atoms";
import { useSolanaConnection } from "../context/Connection";

const REFRESH_INTERVAL = 10 * 1000;

export function useLoadSplTokens() {
  const wallet = useSolanaWallet();
  const { tokenClient } = useRecoilValue(atoms.anchorContext);
  const { connection } = useSolanaConnection();
  const updateAllSplTokenAccounts = useUpdateAllSplTokenAccounts();
  const publicKey = wallet.publicKey;
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!publicKey) {
        return;
      }
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
        updateAllSplTokenAccounts(tokenAccounts);
      } catch (err) {
        // TODO show error notification
        console.error(err);
      }
    }, REFRESH_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [connection, publicKey, updateAllSplTokenAccounts]);
}

export function useTokenAddresses(): string[] {
  return useRecoilValue(atoms.solanaTokenAccountKeys)!;
}
