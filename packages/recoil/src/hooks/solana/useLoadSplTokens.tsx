import { useRecoilCallback } from "recoil";
import type { CustomSplTokenAccountKey } from "@coral-xyz/common";
import * as atoms from "../../atoms";

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
        customSplTokenAccounts: CustomSplTokenAccountKey;
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
