import { useRecoilValue } from "recoil";
import * as atoms from "../";

export function useTotalBalance(): any {
  return useRecoilValue(atoms.totalBalance);
}
