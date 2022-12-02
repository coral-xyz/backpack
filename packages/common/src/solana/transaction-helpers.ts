import type { Transaction } from "@solana/web3.js";
import { VersionedTransaction } from "@solana/web3.js";
import { ethers } from "ethers";
const { base58: bs58 } = ethers.utils;

export const deserializeTransaction = (serializedTx: string) => {
  return VersionedTransaction.deserialize(bs58.decode(serializedTx));
};

export const isVersionedTransaction = (
  tx: Transaction | VersionedTransaction
): tx is VersionedTransaction => {
  return "version" in tx;
};
