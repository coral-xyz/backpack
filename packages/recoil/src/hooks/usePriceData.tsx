import { useRecoilValue } from "recoil";
import * as atoms from "../atoms";

export function usePriceData(mintAddress: string): any {
  return useRecoilValue(atoms.priceData(mintAddress));
}
