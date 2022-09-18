import { useRecoilValue } from "recoil";
import * as atoms from "../";
import { Blockchain } from "@coral-xyz/common";

export function useTotalBalances(): any {
  const solanaTotalBalance = useRecoilValue(
    atoms.blockchainTotalBalance(Blockchain.SOLANA)
  );
  const ethereumTotalBalance = useRecoilValue(
    atoms.blockchainTotalBalance(Blockchain.ETHEREUM)
  );
  return {
    totalBalance:
      solanaTotalBalance.totalBalance + ethereumTotalBalance.totalBalance,
    totalChange:
      solanaTotalBalance.totalChange + ethereumTotalBalance.totalChange,
    percentChange:
      solanaTotalBalance.percentChange + ethereumTotalBalance.percentChange,
  };
}
