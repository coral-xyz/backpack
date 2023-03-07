import type { TokenInfo } from "@solana/spl-token-registry";
import { useRecoilValue } from "recoil";

import * as atoms from "../../atoms";
import type { TokenData } from "../../types";

export function useJupiterTokenList(): Array<TokenInfo> {
  return useRecoilValue(atoms.jupiterTokenList);
}

export function useJupiterTokenMap(): Map<string, TokenInfo> {
  return useRecoilValue(atoms.jupiterTokenMap);
}

export function useJupiterOutputTokens(inputMint: string): Array<TokenData> {
  return useRecoilValue(atoms.jupiterOutputTokens({ inputMint }));
}
