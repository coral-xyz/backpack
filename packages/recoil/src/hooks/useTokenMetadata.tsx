import type { Blockchain } from "@coral-xyz/common";
import { useRecoilValue } from "recoil";

import { tokenMetadata } from "../atoms/tokenMetadata";

export const useTokenMetadata = ({
  mintAddress,
  blockchain,
}: {
  mintAddress: string;
  blockchain: Blockchain;
}) => {
  return useRecoilValue(tokenMetadata({ mintAddress, blockchain }));
};
