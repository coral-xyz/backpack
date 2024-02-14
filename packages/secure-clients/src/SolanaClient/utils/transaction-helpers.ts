import { Transaction, VersionedTransaction } from "@solana/web3.js";
import { ethers } from "ethers5";

const { base58: bs58 } = ethers.utils;

export const deserializeTransaction = (
  serializedTx: string
): VersionedTransaction => {
  return VersionedTransaction.deserialize(bs58.decode(serializedTx));
};

export const deserializeLegacyTransaction = (
  serializedTx: string
): Transaction => {
  return Transaction.from(bs58.decode(serializedTx));
};

export const isVersionedTransaction = (
  tx: Transaction | VersionedTransaction
): tx is VersionedTransaction => {
  return "version" in tx;
};
