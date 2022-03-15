import { useEffect } from "react";
import { useRecoilValue } from "recoil";
import { useSolanaWallet } from "../context/Wallet";
import { useUpdateAllSplTokenAccounts } from "../recoil/hooks";
import * as atoms from "../recoil/atoms";
import { fetchTokens, fetchSplMetadata } from "../recoil/atoms";

const REFRESH_INTERVAL = 10 * 1000;

export function useLoadSplTokens() {
  const wallet = useSolanaWallet();
  const { tokenClient, provider } = useRecoilValue(atoms.anchorContext);
  const updateAllSplTokenAccounts = useUpdateAllSplTokenAccounts();
  const publicKey = wallet.publicKey;
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!publicKey) {
        return;
      }
      try {
        //
        // Fetch tokens.
        //
        const tokenAccounts = Array.from(
          (await fetchTokens(wallet, tokenClient)).values()
        );

        //
        // Fetch metadata.
        //
        const tokenMetadata = await fetchSplMetadata(provider, tokenAccounts);

        //
        // Set the recoil atoms.
        //
        updateAllSplTokenAccounts({ tokenAccounts, tokenMetadata });
      } catch (err) {
        // TODO show error notification
        console.error(err);
      }
    }, REFRESH_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [provider, publicKey, updateAllSplTokenAccounts]);
}

export function useTokenAddresses(): string[] {
  return useRecoilValue(atoms.solanaTokenAccountKeys)!;
}
