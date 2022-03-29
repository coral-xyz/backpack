import { useEffect } from "react";
import { useRecoilValue, useRecoilCallback } from "recoil";
import { TokenAccountWithKey } from "../recoil/types";
import { useSolanaWalletLoadable } from "../hooks/useWallet";
import * as atoms from "../recoil/atoms";
import {
  fetchTokens,
  fetchSplMetadata,
  fetchSplMetadataUri,
  removeNfts,
} from "../recoil/atoms";
import { useAnchorContextLoadable } from "../hooks/useWallet";

const REFRESH_INTERVAL = 10 * 1000;

export function useLoadSplTokens() {
  const walletLoadable = useSolanaWalletLoadable();
  const anchorLoadable = useAnchorContextLoadable();
  const updateAllSplTokenAccounts = useUpdateAllSplTokenAccounts();
  useEffect(() => {
    if (
      walletLoadable.state !== "hasValue" ||
      anchorLoadable.state !== "hasValue"
    ) {
      return;
    }
    const wallet = walletLoadable.contents;
    const { tokenClient, provider } = anchorLoadable.contents;
    const publicKey = wallet.publicKey;

    const interval = setInterval(async () => {
      if (!publicKey) {
        return;
      }
      try {
        //
        // Fetch tokens.
        //
        const tokenAccounts = await fetchTokens(wallet, tokenClient);
        const tokenAccountsArray = Array.from(tokenAccounts.values());

        //
        // Fetch metadata.
        //
        const tokenMetadata = await fetchSplMetadata(
          provider,
          tokenAccountsArray
        );

        //
        // Fetch the metadata uri and interpert as NFTs.
        //
        const nftMetadata = await fetchSplMetadataUri(
          tokenAccountsArray,
          tokenMetadata
        );

        //
        // Set the recoil atoms.
        //
        updateAllSplTokenAccounts({
          tokenAccounts: Array.from(
            removeNfts(tokenAccounts, nftMetadata).values()
          ),
          tokenMetadata,
          nftMetadata,
        });
      } catch (err) {
        // TODO show error notification
        console.error(err);
      }
    }, REFRESH_INTERVAL);
    return () => {
      clearInterval(interval);
    };
  }, [walletLoadable, anchorLoadable, updateAllSplTokenAccounts]);
}

export function useTokenAddresses(): string[] {
  return useRecoilValue(atoms.solanaTokenAccountKeys)!;
}

/**
 * Insert all of the token accounts.
 */
// TODO: It would be nice to use a recoil transaction here, but alas, atoms
//       with default values that are selectors are not yet supported.
//
//       See https://recoiljs.org/docs/api-reference/core/useRecoilTransaction.
const useUpdateAllSplTokenAccounts = () =>
  useRecoilCallback(
    ({ set }: any) =>
      async ({
        tokenAccounts,
        tokenMetadata,
        nftMetadata,
      }: {
        tokenAccounts: TokenAccountWithKey[];
        tokenMetadata: Array<null | any>;
        nftMetadata: Map<string, any>;
      }) => {
        // TODO: Do we want to check if the atoms have changed before setting
        //       them? Probably since we don't have a recoil transaction and
        //       so this hook may cause unnecessary rerenders.

        //
        // Regular tokens.
        //
        set(
          atoms.solanaTokenAccountKeys,
          tokenAccounts.map((a) => a.key.toString())
        );
        tokenAccounts.forEach((tokenAccount) => {
          set(
            atoms.solanaTokenAccountsMap(tokenAccount.key.toString()),
            tokenAccount
          );
        });

        //
        // Nfts.
        //
        set(atoms.solanaNftMetadataKeys, Array.from(nftMetadata.keys()));
        // @ts-ignore
        for (let [key, value] of nftMetadata) {
          set(atoms.solanaNftMetadataMap(key), value);
        }
      }
  );
