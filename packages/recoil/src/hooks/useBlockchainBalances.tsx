import { useRecoilValue } from "recoil";
import { Blockchain } from "@coral-xyz/common";
import * as atoms from "../atoms";

export function useBlockchains() {
  const blockchains = useRecoilValue(atoms.blockchainKeys);
  return blockchains;
}

export function useBlockchainTokens(blockchain: Blockchain) {
  return useRecoilValue(atoms.blockchainTokens(blockchain));
}

export function useBlockchainLogo(blockchain: Blockchain): string {
  switch (blockchain) {
    case Blockchain.SOLANA:
      return "/solana.png";
    default:
      throw new Error("invariant violation");
  }
}

export function useTotal(): any {
  return useRecoilValue(atoms.total);
}

export function useBlockchainTotal(blockchain: Blockchain): any {
  return useRecoilValue(atoms.blockchainTotal(blockchain));
}

export function useBlockchainTokenAccount(
  blockchain: Blockchain,
  address: string
): any {
  return useRecoilValue(atoms.blockchainTokenAccounts({ blockchain, address }));
}

export function useBlockchainTokensSorted(blockchain: Blockchain) {
  return useRecoilValue(atoms.blockchainTokensSorted(blockchain));
}

export function usePriceData(mintAddress: string): any {
  return useRecoilValue(atoms.priceData(mintAddress));
}

export function useNftMetadata(): Map<string, any> {
  return useRecoilValue(atoms.solanaNftMetadata);
}

export function useNftCollections(): Array<any> {
  return useRecoilValue(atoms.solanaNftCollections);
}
