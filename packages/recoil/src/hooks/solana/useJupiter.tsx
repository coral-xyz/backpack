import { useRecoilValue } from "recoil";

import * as atoms from "../../atoms";

export function useJupiterInputTokens(publicKey: string): Array<any> {
  return useRecoilValue(atoms.jupiterInputTokens({ publicKey }));
}

export function useJupiterOutputTokens(inputMint: string): Array<any> {
  return useRecoilValue(atoms.jupiterOutputTokens({ inputMint }));
}
