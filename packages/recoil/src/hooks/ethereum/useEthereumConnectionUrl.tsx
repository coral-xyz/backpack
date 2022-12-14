import { useRecoilValue } from "recoil";

import * as atoms from "../../atoms";

export function useEthereumConnectionUrl(): string {
  return useRecoilValue(atoms.ethereumConnectionUrl)!;
}
