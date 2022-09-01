import { useRecoilValue } from "recoil";
import { Commitment } from "@solana/web3.js";
import * as atoms from "../../atoms";

export function useSolanaCommitment(): Commitment {
  return useRecoilValue(atoms.solanaCommitment)!;
}
