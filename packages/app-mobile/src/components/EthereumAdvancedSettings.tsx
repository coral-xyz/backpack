import { useState } from "react";

import { Blockchain } from "@coral-xyz/common";
import { useTransactionData } from "@coral-xyz/recoil";
import { ethers } from "ethers";

import { EthereumSettingsDrawer } from "~components/TransactionData";
const { base58: bs58 } = ethers.utils;

type TransactionMode = "normal" | "fast" | "degen" | "custom";

export function EthereumAdvancedSettings({
  // blockchain,
  // token,
  // destinationAddress,
  transaction,
  // amount,
  onClose,
}: any): JSX.Element {
  const [mode, setMode] = useState<TransactionMode>("normal");
  const transactionData = useTransactionData(
    Blockchain.ETHEREUM,
    bs58.encode(ethers.utils.serializeTransaction(transaction))
  );

  const {
    // loading,
    // network,
    // networkFee,
    networkFeeUsd,
    transactionOverrides,
    setTransactionOverrides,
    // simulationError,
  } = transactionData;

  return (
    <EthereumSettingsDrawer
      mode={mode}
      setMode={setMode}
      transactionOverrides={transactionOverrides}
      setTransactionOverrides={setTransactionOverrides}
      networkFeeUsd={networkFeeUsd}
      onClose={onClose}
    />
  );
}
