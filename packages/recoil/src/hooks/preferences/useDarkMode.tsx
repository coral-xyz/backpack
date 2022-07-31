import { useRecoilValue } from "recoil";
import * as atoms from "../../atoms";

export function useDarkMode(): boolean {
  return useRecoilValue(atoms.isDarkMode)!;
}
