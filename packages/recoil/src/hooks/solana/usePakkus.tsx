import { useRecoilValue } from "recoil";
import * as atoms from "../../atoms";

export function usePakkus(): Array<any> {
  return useRecoilValue(atoms.pakkus);
}
