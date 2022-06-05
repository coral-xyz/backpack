import { useRecoilValue, useRecoilCallback } from "recoil";
import { TokenAccountWithKey } from "../types";
import * as atoms from "../atoms";

export function useTokenAddresses(): string[] {
  const publicKey = useRecoilValue(atoms.activeWallet)!;
  const connectionUrl = useRecoilValue(atoms.connectionUrl)!;
  return useRecoilValue(
    atoms.solanaTokenAccountKeys({ connectionUrl, publicKey })
  )!;
}

/**
 * Insert all of the token accounts.
 */
// TODO: It would be nice to use a recoil transaction here, but alas, atoms
//       with default values that are selectors are not yet supported.
//
//       See https://recoiljs.org/docs/api-reference/core/useRecoilTransaction.
export const useUpdateAllSplTokenAccounts = () =>
  useRecoilCallback(
    ({ set }: any) =>
      async ({
        connectionUrl,
        publicKey,
        customSplTokenAccounts,
      }: {
        connectionUrl: string;
        publicKey: string;
        customSplTokenAccounts: {
          tokenAccounts: TokenAccountWithKey[];
          tokenMetadata: Array<null | any>;
          nftMetadata: Map<string, any>;
        };
      }) => {
        // TODO: Do we want to check if the atoms have changed before setting
        //       them? Probably since we don't have a recoil transaction and
        //       so this hook may cause unnecessary rerenders.

        //
        // Regular tokens.
        //
        set(
          atoms.solanaTokenAccountKeys({
            connectionUrl,
            publicKey,
          }),
          customSplTokenAccounts.tokenAccounts.map((a) => a.key.toString())
        );
        customSplTokenAccounts.tokenAccounts.forEach((tokenAccount) => {
          set(
            atoms.solanaTokenAccountsMap(tokenAccount.key.toString()),
            tokenAccount
          );
        });

        //
        // Nfts.
        //
        set(
          atoms.solanaNftMetadataKeys,
          Array.from(customSplTokenAccounts.nftMetadata.keys())
        );
        // @ts-ignore
        for (let [key, value] of nftMetadata) {
          set(atoms.solanaNftMetadataMap(key), value);
        }
      }
  );
