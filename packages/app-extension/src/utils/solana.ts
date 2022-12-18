import type {
  SolanaFeeConfig} from "@coral-xyz/common";
import {
  deserializeLegacyTransaction,
  deserializeTransaction
} from "@coral-xyz/common";
import { ComputeBudgetProgram } from "@solana/web3.js";
import { ethers } from "ethers";
const { base58: bs58 } = ethers.utils;

export const sanitizeTransactionWithFeeConfig = (
  txStr: string,
  feeConfig?: SolanaFeeConfig
) => {
  let tx = deserializeTransaction(txStr);
  if (feeConfig && feeConfig.priorityFee && tx.version === "legacy") {
    const transaction = deserializeLegacyTransaction(txStr);
    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
      units: feeConfig.computeUnits,
    });

    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: feeConfig.priorityFee,
    });

    transaction.add(modifyComputeUnits);
    transaction.add(addPriorityFee);
    tx = deserializeTransaction(
      bs58.encode(transaction.serialize({ requireAllSignatures: false }))
    );
  }
  return tx;
};
