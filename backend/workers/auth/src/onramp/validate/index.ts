import { ethers } from "ethers";
import { PublicKey } from "@solana/web3.js";
import { BlockChain } from "../zodTypes";

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
