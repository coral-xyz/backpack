import { useRecoilValue } from "recoil";
import * as atoms from "../../atoms";

export function useXnfts(): Array<any> {
  return useRecoilValue(atoms.xnfts);
}
