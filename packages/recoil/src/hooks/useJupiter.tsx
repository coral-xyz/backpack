import { useRecoilValue } from "recoil";
import * as atoms from "../atoms";

export function useJupiterWalletTokens(): Array<any> {
  return useRecoilValue(atoms.walletJupiterTokens);
}

export function useSwapTokenList(mint: string, isFrom: boolean): Array<any> {
  return useRecoilValue(atoms.swapTokenList({ mint, isFrom }));
}
