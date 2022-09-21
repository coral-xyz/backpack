import { useRecoilValue } from "recoil";
import * as atoms from "../../atoms";

export function usePakkus() {
  return useRecoilValue(atoms.pakkus);
}
