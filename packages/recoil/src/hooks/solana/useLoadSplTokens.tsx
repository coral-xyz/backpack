import { useRecoilValue, useRecoilCallback } from "recoil";
import type {
  SolanaTokenAccountWithKey,
  SplNftMetadata,
  TokenMetadata,
} from "@coral-xyz/common";
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
        customSplTokenAccounts: {
          tokenAccounts: SolanaTokenAccountWithKey[];
          tokenMetadata: (TokenMetadata | null)[];
          nftMetadata: [string, SplNftMetadata][];
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
