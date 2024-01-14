import { useCallback } from "react";
import type { Blockchain } from "@coral-xyz/common";
import type { TensorMintDataType } from "@coral-xyz/secure-clients/types";
import { useRecoilState } from "recoil";

import { tensorMintAtom } from "./tensorMintAtom";

export function useTensorMintData(
  mint: string | undefined,
  owner: string | undefined,
  blockchain: Blockchain
): [TensorMintDataType | null, () => void] {
  const [tensorMintData, refetchTensorMintData] = useRecoilState(
    tensorMintAtom({ mint, owner, blockchain })
  );

  const refreshTensorMintData = useCallback(() => {
    refetchTensorMintData((prev) => (prev ? { ...prev } : null));
  }, [refetchTensorMintData]);

  return [tensorMintData, refreshTensorMintData];
}
