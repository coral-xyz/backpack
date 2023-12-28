import { Blockchain } from "@coral-xyz/common";
import { useRecoilValue } from "recoil";

import * as atoms from "../../atoms";

export function useEthereumConnectionUrl(): string {
  return useRecoilValue(atoms.blockchainConnectionUrl(Blockchain.ETHEREUM))!;
}
