import { useRecoilValue } from "recoil";
import { Blockchain } from "@coral-xyz/common";
import * as atoms from "../../atoms";

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

export function useSolanaBalance(): any {
  return useRecoilValue(atoms.solanaBalance);
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

export function useNftMetadata(): Map<string, any> {
  return useRecoilValue(atoms.solanaNftMetadata);
}

export function useNftCollections(): Array<any> {
  return useRecoilValue(atoms.solanaNftCollections);
}
