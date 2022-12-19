import type { SolanaFeeConfig } from "@coral-xyz/common";
import {
  Blockchain,
  deserializeLegacyTransaction,
  deserializeTransaction,
} from "@coral-xyz/common";
import { ComputeBudgetProgram } from "@solana/web3.js";
import { ethers } from "ethers";

const { base58: bs58 } = ethers.utils;

export const sanitizeTransactionWithFeeConfig = (
  txStr: string,
  blockchain: Blockchain,
  feeConfig?: SolanaFeeConfig
) => {
  let tx = deserializeTransaction(txStr);
  if (
    blockchain === Blockchain.SOLANA &&
    feeConfig &&
    feeConfig.priorityFee &&
    tx.version === "legacy"
  ) {
    const transaction = deserializeLegacyTransaction(txStr);
    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
      units: feeConfig.computeUnits,
    });

    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: feeConfig.priorityFee,
    });

    transaction.add(modifyComputeUnits);
    transaction.add(addPriorityFee);
    return bs58.encode(
      transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      })
    );
  } else {
    return txStr;
  }
};
