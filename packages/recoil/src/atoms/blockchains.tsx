import { atom } from "recoil";
import { Blockchain } from "@coral-xyz/common";

/**
 * All blockchains.
 */
export const blockchainKeys = atom<ReadonlyArray<Blockchain>>({
  key: "blockchainKeys",
  default: [Blockchain.SOLANA],
});
