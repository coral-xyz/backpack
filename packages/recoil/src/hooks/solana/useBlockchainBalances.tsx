import { useRecoilValue } from "recoil";
import { Blockchain } from "@coral-xyz/common";
import * as atoms from "../../atoms";
import { useActiveWallet } from "../wallet";

export function useSolanaBalance(): any {
  return useRecoilValue(atoms.blockchainTotalBalance(Blockchain.SOLANA));
}

export function useNftMetadata(): Map<string, any> {
  const { publicKey } = useActiveWallet();
  return useRecoilValue(atoms.solanaNftMetadata(publicKey.toString()));
}

export function useNftCollections(): Array<any> {
  return useRecoilValue(atoms.solanaNftCollections);
}
