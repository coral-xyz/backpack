import { useRecoilValue } from "recoil";
import { Nft } from "@coral-xyz/common";
import * as atoms from "../atoms";

export function useNftMetadata(): Map<string, Nft> {
  return useRecoilValue(atoms.nftMetadata);
}
