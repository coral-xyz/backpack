import { useRecoilValue } from "recoil";
import * as atoms from "@200ms/recoil";

export function useDarkMode(): boolean {
  return useRecoilValue(atoms.isDarkMode)!;
}
