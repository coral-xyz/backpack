import { Transaction, VersionedTransaction } from "@solana/web3.js";
import { ethers } from "ethers";
const { base58: bs58 } = ethers.utils;

export class TransactionV2 {
  static from(serializedTx: string): Transaction | VersionedTransaction {
    try {
      const transaction = Transaction.from(bs58.decode(serializedTx));
      return transaction;
    } catch (e) {
      return VersionedTransaction.deserialize(bs58.decode(serializedTx));
    }
  }
  static isVersioned(tx: Transaction | VersionedTransaction) {
    if ("version" in tx) {
      return true;
    }
    return false;
  }
  static getSerializedMessage(txStr: string) {
    const tx = this.from(txStr);
    const versioned = "version" in tx;
    return !versioned
      ? Transaction.from(bs58.decode(txStr)).serializeMessage()
      : VersionedTransaction.deserialize(
          bs58.decode(txStr)
        ).message.serialize();
  }
}
