import { useRecoilValue } from "recoil";
import * as atoms from "../recoil/atoms";

export function useRecentTransactions(): any[] {
  return useRecoilValue(atoms.recentTransactions);
}

export function useRecentTokenTransactions(address: string): any[] {
  return useRecoilValue(atoms.recentTokenTransactions(address));
}
