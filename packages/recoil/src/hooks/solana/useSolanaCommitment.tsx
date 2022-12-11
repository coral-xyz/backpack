import type { Commitment } from "@solana/web3.js";
import { useRecoilValue } from "recoil";

import * as atoms from "../../atoms";

export function useSolanaCommitment(): Commitment {
  return useRecoilValue(atoms.solanaCommitment)!;
}
