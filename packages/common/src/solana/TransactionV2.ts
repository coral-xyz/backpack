import { Transaction, VersionedTransaction } from "@solana/web3.js";
import { ethers } from "ethers";
const { base58: bs58 } = ethers.utils;

export const deserializeTransaction = (serializedTx: string) => {
  try {
    const transaction = Transaction.from(bs58.decode(serializedTx));
    return transaction;
  } catch (e) {
    return VersionedTransaction.deserialize(bs58.decode(serializedTx));
  }
};

export const getSerializedMessage = (txStr: string) => {
  const tx = deserializeTransaction(txStr);
  const versioned = "version" in tx;
  return !versioned
    ? Transaction.from(bs58.decode(txStr)).serializeMessage()
    : VersionedTransaction.deserialize(bs58.decode(txStr)).message.serialize();
};
