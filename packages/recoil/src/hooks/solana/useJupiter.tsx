import { useRecoilValue } from "recoil";

import * as atoms from "../../atoms";

export function useJupiterInputMints(publicKey: string): Array<any> {
  return useRecoilValue(atoms.jupiterInputMints({ publicKey }));
}

export function useJupiterOutputMints(inputMint: string): Array<any> {
  return useRecoilValue(atoms.jupiterOutputMints({ inputMint }));
}
