import { useRecoilValue } from "recoil";

import * as atoms from "../atoms";

export function useEthereumPrice() {
  return useRecoilValue(atoms.ethereumPrice);
}
