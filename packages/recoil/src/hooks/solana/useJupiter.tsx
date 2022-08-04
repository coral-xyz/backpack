import { useRecoilValue } from "recoil";
import * as atoms from "../../atoms";

export function useJupiterInputMints(): Array<any> {
  return useRecoilValue(atoms.jupiterInputMints);
}

export function useJupiterOutputMints(inputMint: string): Array<any> {
  return useRecoilValue(atoms.jupiterOutputMints({ inputMint }));
}
