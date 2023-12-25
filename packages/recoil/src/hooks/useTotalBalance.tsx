import { useRecoilValue } from "recoil";

import * as atoms from "../atoms";

export function useTotalBalance(): any {
  return useRecoilValue(atoms.totalBalance);
}
