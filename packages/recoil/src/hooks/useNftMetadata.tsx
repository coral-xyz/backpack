import type { Nft } from "@coral-xyz/common";
import { useRecoilValue } from "recoil";

import * as atoms from "../atoms";

export function useNftMetadata(): Map<string, Nft> {
  return useRecoilValue(atoms.nftMetadata);
}
