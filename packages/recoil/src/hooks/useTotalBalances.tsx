import { useRecoilValue } from "recoil";
import * as atoms from "../";

export function useTotalBalances(): any {
  return useRecoilValue(atoms.totalBalance);
}
