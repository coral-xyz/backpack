import { useRecoilValue } from "recoil";

import * as atoms from "../../atoms";

export function useEthereumExplorer(): string {
  return useRecoilValue(atoms.ethereumExplorer)!;
}
