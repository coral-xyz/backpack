import { ParsedTransactionWithMeta } from "@solana/web3.js";
import { useRecoilValue } from "recoil";
import * as atoms from "../atoms";

export function useRecentTransactions(
  address: string
): Array<ParsedTransactionWithMeta> {
  return useRecoilValue(atoms.recentTransactions(address))!;
}
