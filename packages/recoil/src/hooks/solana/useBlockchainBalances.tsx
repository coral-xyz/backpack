import { useRecoilValue } from "recoil";
import { Blockchain } from "@coral-xyz/common";
import * as atoms from "../../atoms";

export function useSolanaBalance(): any {
  return useRecoilValue(atoms.blockchainTotalBalance(Blockchain.SOLANA));
}

export function useSolanaNftCollections(): Array<any> {
  return useRecoilValue(atoms.solanaNftCollections);
}

export function useEthereumNftCollections(): Array<any> {
  return useRecoilValue(atoms.ethereumNftCollections);
}
