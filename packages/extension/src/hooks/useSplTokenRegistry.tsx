import { TokenInfo } from "@solana/spl-token-registry";
import { useRecoilValue } from "recoil";
import * as atoms from "@200ms/recoil";

export function useSplTokenRegistry(): Map<string, TokenInfo> {
  return useRecoilValue(atoms.splTokenRegistry)!;
}
