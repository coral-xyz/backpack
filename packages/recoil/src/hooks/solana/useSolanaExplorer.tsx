import { Blockchain } from "@coral-xyz/common";
import { useRecoilValue } from "recoil";

import * as atoms from "../../atoms";

export function useSolanaExplorer(): string {
  return useRecoilValue(atoms.blockchainExplorer(Blockchain.SOLANA))!;
}
