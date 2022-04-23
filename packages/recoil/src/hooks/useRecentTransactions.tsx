import { useRecoilValue } from "recoil";
import * as atoms from "../atoms";

export function useRecentTransactions(address: string): any[] {
  return useRecoilValue(atoms.recentTransactions(address));
}
