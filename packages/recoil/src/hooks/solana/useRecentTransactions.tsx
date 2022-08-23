import { ParsedTransactionWithMeta } from "@solana/web3.js";
import { useRecoilValue } from "recoil";
import { Blockchain } from "@coral-xyz/common";
import * as atoms from "../../atoms";

export function useRecentTransactions(
  blockchain: Blockchain,
  address: string
): Array<ParsedTransactionWithMeta> {
  return useRecoilValue(atoms.recentTransactions({ blockchain, address }))!;
}
