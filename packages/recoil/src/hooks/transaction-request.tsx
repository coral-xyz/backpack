import { useRecoilState } from "recoil";

import * as atoms from "../atoms";
import type { TransactionRequest } from "../atoms/transaction-request";

export function useTransactionRequest(): [
  TransactionRequest | undefined,
  (tx: TransactionRequest | undefined) => void
] {
  return useRecoilState(atoms.transactionRequest);
}
