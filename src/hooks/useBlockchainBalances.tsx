import { useRecoilValue } from "recoil";
import * as atoms from "../recoil/atoms";

export function useBlockchains(): Array<string> {
  const blockchains = useRecoilValue(atoms.blockchainKeys);
  return blockchains;
}

export function useBlockchainTokens(blockchain: string): Array<string> {
  return useRecoilValue(atoms.blockchainTokens(blockchain));
}

export function useBlockchainBalance(blockchain: string, address: string) {
  const balance = useRecoilValue(
    atoms.blockchainTokenAccounts({ blockchain, address })
  );
  return balance;
}

export function useBlockchainLogo(blockchain: string): string {
  switch (blockchain) {
    case "solana":
      return "solana.png";
    default:
      throw new Error("invariant violation");
  }
}

export function useTotal(): any {
  return useRecoilValue(atoms.total);
}

export function useBlockchainTokensSorted(blockchain: string) {
  return useRecoilValue(atoms.blockchainTokensSorted(blockchain));
}

export function usePriceData(mintAddress: string): any {
  return useRecoilValue(atoms.priceData(mintAddress));
}
