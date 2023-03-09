import { useRecoilValue } from "recoil";

import * as atoms from "../../atoms";

export function useCompressedNfts(): boolean {
  return useRecoilValue(atoms.solanaCompressedNftsEnabled)!;
}
