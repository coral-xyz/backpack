import { useRecoilState } from "recoil";
import * as atoms from "../atoms";
import { TransactionRequest } from "../atoms/transaction-request";

export function useTransactionRequest(): [
  TransactionRequest | undefined,
  (tx: TransactionRequest | undefined) => void
] {
  return useRecoilState(atoms.transactionRequest);
}
