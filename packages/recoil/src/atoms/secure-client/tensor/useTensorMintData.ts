import type { Blockchain } from "@coral-xyz/common";
import type { TensorMintDataType } from "@coral-xyz/secure-clients/types";
import { useCallback } from "react";
import { useRecoilState } from "recoil";

import type { TensorMintAtomType } from "./tensorMintAtom";
import { tensorMintAtom } from "./tensorMintAtom";

export function useTensorMintData(
  mint: string | undefined,
  owner: string | undefined,
  blockchain: Blockchain
): [TensorMintAtomType, () => void] {
  const [tensorMintData, refetchTensorMintData] = useRecoilState(
    tensorMintAtom({ mint, owner, blockchain })
  );

  const refreshTensorMintData = useCallback(() => {
    refetchTensorMintData((prev) => ({ ...prev }));
  }, [refetchTensorMintData]);

  return [tensorMintData, refreshTensorMintData];
}
