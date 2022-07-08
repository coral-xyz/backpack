import { useRecoilValue } from "recoil";
import * as atoms from "../atoms";

export function useHistoricalPrices() {
  return useRecoilValue(atoms.historicalPriceData);
}
