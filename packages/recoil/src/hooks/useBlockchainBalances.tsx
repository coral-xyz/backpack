import { useRecoilValue } from "recoil";
import * as atoms from "../atoms";

export function useBlockchains(): Array<string> {
  const blockchains = useRecoilValue(atoms.blockchainKeys);
  return blockchains;
}

export function useBlockchainTokens(blockchain: string): Array<string> {
  return useRecoilValue(atoms.blockchainTokens(blockchain));
}

export function useBlockchainLogo(blockchain: string): string {
  switch (blockchain) {
    case "solana":
      return "/solana.png";
    default:
      throw new Error("invariant violation");
  }
}

export function useTotal(blockchain?: string): any {
  return useRecoilValue(
    blockchain ? atoms.blockchainTotal(blockchain) : atoms.total
  );
}

export function useBlockchainTotal(blockchain: string): any {
  return useRecoilValue(atoms.blockchainTotal(blockchain));
}

export function useBlockchainTokenAccount(
  blockchain: string,
  address: string
): any {
  return useRecoilValue(atoms.blockchainTokenAccounts({ blockchain, address }));
}

export function useBlockchainTokensSorted(blockchain: string) {
  return useRecoilValue(atoms.blockchainTokensSorted(blockchain));
}

export function usePriceData(mintAddress: string): any {
  return useRecoilValue(atoms.priceData(mintAddress));
}

export function useNftMetadataAddresses(blockchain: string): Array<string> {
  if (blockchain !== "solana") {
    throw new Error("only solana currently supported");
  }
  return useRecoilValue(atoms.solanaNftMetadataKeys);
}

export function useNftMetadata(address: string): any {
  return useRecoilValue(atoms.solanaNftMetadataMap(address));
}
