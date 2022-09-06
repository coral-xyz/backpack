import { useEffect, useState } from "react";
import { ethers, BigNumber } from "ethers";
import { TransactionRequest } from "@ethersproject/abstract-provider";
import { PublicKey, Transaction } from "@solana/web3.js";
import { AccountLayout, u64, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Blockchain, UI_RPC_METHOD_SOLANA_SIMULATE } from "@coral-xyz/common";
import {
  useBackgroundClient,
  useBlockchainTokensSorted,
  useEthereumCtx,
  useSolanaCtx,
  useSplTokenRegistry,
} from "./";

const { base58: bs58 } = ethers.utils;

type TransactionData = {
  loading: boolean;
  from: string;
  simulationError: boolean;
  balanceChanges: {
    [symbol: string]: { nativeChange: BigNumber; decimals: Number };
  } | null;
  network: string;
  networkFee: string;
};

export function useTransactionData(
  blockchain: Blockchain,
  serializedTx: any
): TransactionData {
  return blockchain === Blockchain.ETHEREUM
    ? useEthereumTxData(serializedTx)
    : useSolanaTxData(serializedTx);
}

//
// Transaction data for Ethereum
//
export function useEthereumTxData(serializedTx: any): TransactionData {
  const ethereumCtx = useEthereumCtx();

  const [loading, setLoading] = useState(true);
  const [simulationError, setSimulationError] = useState(false);
  const [estimatedTxFee, setEstimatedTxFee] = useState(0);

  const transaction = ethers.utils.parseTransaction(bs58.decode(serializedTx));

  useEffect(() => {
    const estimateTxFee = async () => {
      // Estimate gas for the transaction
      let estimatedGas;
      try {
        estimatedGas = await ethereumCtx.provider.estimateGas(
          transaction as TransactionRequest
        );
      } catch (error) {
        // Fee estimate failed, transaction is unlikely to succeed
        console.error("could not estimate gas", error);
        // Use a fallback value for estimate gas, but this is not likely to be
        // accurate given the gas estimate call failed. 150k is a good value
        // for all ERC20 methods.
        estimatedGas = BigNumber.from("150000");
        setSimulationError(true);
      }
      setEstimatedTxFee(
        estimatedGas
          .mul(ethereumCtx.feeData.maxFeePerGas!)
          .add(estimatedGas.mul(ethereumCtx.feeData.maxPriorityFeePerGas!))
      );
      setLoading(false);
    };
    estimateTxFee();
  }, [serializedTx]);

  return {
    loading,
    from: ethereumCtx.walletPublicKey,
    balanceChanges: null,
    simulationError,
    network: "Ethereum",
    networkFee: `${ethers.utils.formatUnits(estimatedTxFee, 18)} ETH`,
  };
}

//
// Transaction data for Solana.
//
export function useSolanaTxData(serializedTx: any): TransactionData {
  const background = useBackgroundClient();
  const tokenRegistry = useSplTokenRegistry();
  const tokenAccountsSorted = useBlockchainTokensSorted(Blockchain.SOLANA);
  const { connection, walletPublicKey } = useSolanaCtx();

  const [loading, setLoading] = useState(true);
  const [simulationError, setSimulationError] = useState(false);
  const [estimatedTxFee, setEstimatedTxFee] = useState(0);
  const [balanceChanges, setBalanceChanges] = useState({});

  useEffect(() => {
    const estimateTxFee = async () => {
      const transaction = Transaction.from(bs58.decode(serializedTx));
      let fee;
      try {
        fee = await transaction.getEstimatedFee(connection);
      } catch {
        // ignore
      }
      setEstimatedTxFee(fee || 5000);
    };
    estimateTxFee();
  }, [serializedTx]);

  useEffect(() => {
    const estimateBalanceChanges = async () => {
      if (walletPublicKey && serializedTx) {
        const result = await background.request({
          method: UI_RPC_METHOD_SOLANA_SIMULATE,
          params: [serializedTx, walletPublicKey, true],
        });
        if (result.value.err) {
          console.warn("failed to simulate", result.value.err);
          setSimulationError(true);
        } else {
          console.log(result);
          const balanceChanges = result.value.accounts.reduce(
            (result: any, a: any) => {
              if (a.owner === TOKEN_PROGRAM_ID.toString()) {
                try {
                  const buf = Buffer.from(a.data[0], a.data[1]);
                  const account = AccountLayout.decode(buf);
                  // Check account owner is active Solana public key
                  if (
                    !new PublicKey(account.owner).equals(
                      new PublicKey(walletPublicKey)
                    )
                  ) {
                    return result;
                  }
                  // Find the existing token account
                  const existingTokenAccount = tokenAccountsSorted.find((t) =>
                    new PublicKey(t.mint!).equals(new PublicKey(account.mint))
                  );
                  // Find the token in the registry to get the symbol for return
                  const token = tokenRegistry.get(
                    new PublicKey(account.mint).toString()
                  );
                  if (!token) {
                    return result;
                  }
                  const existingNativeBalance = existingTokenAccount
                    ? existingTokenAccount.nativeBalance
                    : ethers.constants.Zero;
                  //
                  // Calculate the native balance change
                  const nativeChange = BigNumber.from(
                    u64.fromBuffer(account.amount).toString()
                  ).sub(existingNativeBalance);

                  result[token.symbol] = {
                    nativeChange,
                    decimals: token.decimals,
                  };
                } catch (err) {
                  // ignore, probably not a token account or some other
                  // failure, we don't want to fail displaying the popup
                  console.warn("failed to get balance changes", err);
                }
              }
              return result;
            },
            {}
          );
          setBalanceChanges(balanceChanges);
        }
        setLoading(false);
      }
    };
    estimateBalanceChanges();
  }, []);

  return {
    loading,
    from: walletPublicKey.toString(),
    simulationError,
    balanceChanges,
    network: "Solana",
    networkFee: `${ethers.utils.formatUnits(estimatedTxFee, 9)} SOL`,
  };
}
