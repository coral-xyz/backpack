import { atom } from "recoil";

/**
 * All blockchains.
 */
export const blockchainKeys = atom<Array<string>>({
  key: "blockchainKeys",
  default: ["solana"],
});
