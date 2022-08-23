import { useRecoilValue } from "recoil";
import { Blockchain } from "@coral-xyz/common";
import * as atoms from "../../atoms";
import { useActiveWallet } from "../wallet";

export function useBlockchainTokens(blockchain: Blockchain) {
  return useRecoilValue(atoms.blockchainTokenAddresses(blockchain));
}

export function useBlockchainLogo(blockchain: Blockchain): string {
  switch (blockchain) {
    case Blockchain.SOLANA:
      return "/solana.png";
    case Blockchain.ETHEREUM:
      return "./ethereum.png";
    default:
      throw new Error("invariant violation");
  }
}

export function useSolanaBalance(): any {
  return useRecoilValue(atoms.blockchainTotalBalance(Blockchain.SOLANA));
}

export function useBlockchainTokenAccount(
  blockchain: Blockchain,
  address: string
): any {
  return useRecoilValue(atoms.blockchainTokenData({ blockchain, address }));
}

export function useBlockchainTokensSorted(blockchain: Blockchain) {
  return useRecoilValue(atoms.blockchainBalancesSorted(blockchain));
}

export function useNftMetadata(): Map<string, any> {
  const { publicKey } = useActiveWallet();
  return useRecoilValue(atoms.solanaNftMetadata(publicKey.toString()));
}

export function useNftCollections(): Array<any> {
  return useRecoilValue(atoms.solanaNftCollections);
}
