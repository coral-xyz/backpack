import { Blockhash, Commitment } from "@solana/web3.js";
import { useRecoilValue, useRecoilCallback } from "recoil";
import * as atoms from "@200ms/recoil";

export function useRecentBlockhash(): Blockhash {
  const bh = useRecoilValue(atoms.recentBlockhash);
  if (bh === null) {
    throw new Error("blockhash not found");
  }
  return bh;
}

export function useCommitment(): Commitment {
  return useRecoilValue(atoms.commitment);
}

export const useUpdateRecentBlockhash = () =>
  useRecoilCallback(({ set }: any) => async (bh: Blockhash) => {
    set(atoms.recentBlockhash, bh);
  });
