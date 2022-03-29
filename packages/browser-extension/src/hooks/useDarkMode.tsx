import { useRecoilValue } from "recoil";
import * as atoms from "../recoil/atoms";

export function useDarkMode(): boolean {
  return useRecoilValue(atoms.isDarkMode)!;
}
