import { useRecoilValue } from "recoil";
import { Blockchain } from "@coral-xyz/common";
import * as atoms from "../../atoms";

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

export function useSolanaNftCollections(): Array<any> {
  return useRecoilValue(atoms.solanaNftCollections);
}

export function useEthereumNftCollections(): Array<any> {
  return useRecoilValue(atoms.ethereumNftCollections);
}
