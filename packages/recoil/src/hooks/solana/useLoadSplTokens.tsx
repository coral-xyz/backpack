import { useRecoilValue, useRecoilCallback } from "recoil";
import { SolanaTokenAccountWithKey } from "../../types";
import * as atoms from "../../atoms";

export function useTokenAddresses(): string[] {
  return useRecoilValue(atoms.solanaTokenAccountKeys)!;
}

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
          tokenAccounts: SolanaTokenAccountWithKey[];
          tokenMetadata: Array<null | any>;
          nftMetadata: Array<[string, any]>;
        };
      }) => {
        // TODO: Do we want to check if the atoms have changed before setting
        //       them? Probably since we don't have a recoil transaction and
        //       so this hook may cause unnecessary rerenders.
        set(atoms.customSplTokenAccounts({ connectionUrl, publicKey }), {
          splTokenAccounts: customSplTokenAccounts.tokenAccounts,
          splTokenMetadata: customSplTokenAccounts.tokenMetadata,
          splNftMetadata: new Map(customSplTokenAccounts.nftMetadata),
        });
      }
  );
