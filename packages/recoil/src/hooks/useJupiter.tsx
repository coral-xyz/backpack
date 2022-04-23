import { useRecoilValue } from "recoil";
import * as atoms from "../atoms";

export function useJupiterWalletTokens(): Array<string> {
  return useRecoilValue(atoms.walletJupiterTokens);
}

export function useJupiterOutputTokens(inputTokenMint: string): Array<string> {
  return useRecoilValue(atoms.jupiterTokenList);
}

export function useSwapTokenList(mint: string, isFrom: boolean): Array<any> {
  return useRecoilValue(atoms.swapTokenList({ mint, isFrom }));
}
