import { useRecoilValue } from "recoil";
import * as atoms from "@200ms/recoil";

export function useRecentTransactions(address: string): any[] {
  return useRecoilValue(atoms.recentTransactions(address));
}
