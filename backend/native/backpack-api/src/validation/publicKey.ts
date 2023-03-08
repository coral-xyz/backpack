import { PublicKey } from "@solana/web3.js";
import type { BlockChain } from "auth/src/onramp/zodTypes";
import { ethers } from "ethers";

export const validatePublicKey = (address: string, chain: BlockChain) => {
  if (chain === "solana") {
    try {
      new PublicKey(address);
    } catch (err) {
      return false;
    }
    return true;
  }
  if (chain === "ethereum") {
    try {
      ethers.utils.getAddress(address);
    } catch (e) {
      return false;
    }
    return true;
  }
};
