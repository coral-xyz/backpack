import { useRecoilValue } from "recoil";
import * as atoms from "../atoms";

export function useJupiterWalletTokens(): Array<any> {
  return useRecoilValue(atoms.walletJupiterTokens);
}

export function useSwapTokenList(mint: string, isFrom: boolean): Array<any> {
  return useRecoilValue(atoms.swapTokenList({ mint, isFrom }));
}

/**
export function useJupiterRoutes(
  inputMint: string,
  outputMint: string,
  amount: Number,
  slippage: float,
  feeBps: Number
) {
  return useRecoilValue(
    atoms.swapRoutes({ inputMint, outputMint, amount, slippage, feeBps })
  );
}
**/
