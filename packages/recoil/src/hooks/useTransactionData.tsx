import { useEffect, useState } from "react";
import { ethers, BigNumber } from "ethers";
import { UnsignedTransaction } from "@ethersproject/transactions";
import { TransactionRequest } from "@ethersproject/abstract-provider";
import { Message, PublicKey } from "@solana/web3.js";
import { AccountLayout, u64, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  Blockchain,
  deserializeTransaction,
  UI_RPC_METHOD_SOLANA_SIMULATE,
} from "@coral-xyz/common";
import {
  useBackgroundClient,
  useBlockchainNativeTokens,
  useEthereumCtx,
  useEthereumPrice,
  useSolanaCtx,
  useSplTokenRegistry,
} from "./";

const { base58: bs58 } = ethers.utils;
const DEFAULT_GAS_LIMIT = BigNumber.from("150000");

type TransactionData = {
  loading: boolean;
  transaction: string;
  transactionOverrides?: TransactionOverrides;
  setTransactionOverrides?: (overrides: object) => void;
  from: string;
  simulationError: boolean;
  balanceChanges: {
    [symbol: string]: { nativeChange: BigNumber; decimals: Number };
  } | null;
  network: string;
  networkFee: string;
  networkFeeUsd?: string;
};

type TransactionOverrides = {
  type: number;
  nonce: number | null;
  gasLimit: BigNumber | null;
  maxFeePerGas: BigNumber | null;
  maxPriorityFeePerGas: BigNumber | null;
};

export function useTransactionData(
  blockchain: Blockchain,
  transaction: any
): TransactionData {
  return blockchain === Blockchain.ETHEREUM
    ? useEthereumTxData(transaction)
    : useSolanaTxData(transaction);
}

//
// Transaction data for Ethereum
//
export function useEthereumTxData(serializedTx: any): TransactionData {
  const ethereumCtx = useEthereumCtx();
  const ethPrice = useEthereumPrice();
  const [loading, setLoading] = useState(true);
  const [simulationError, setSimulationError] = useState(false);
  const [estimatedGas, setEstimatedGas] = useState(BigNumber.from(0));
  const [estimatedTxFee, setEstimatedTxFee] = useState(BigNumber.from(0));
  const [transaction, setTransaction] = useState<TransactionRequest | null>(
    null
  );
  const [transactionOverrides, setTransactionOverrides] =
    useState<TransactionOverrides>({
      type: 2,
      nonce: null,
      gasLimit: estimatedGas,
      maxFeePerGas: ethereumCtx.feeData.maxFeePerGas,
      maxPriorityFeePerGas: ethereumCtx.feeData.maxPriorityFeePerGas,
    });

  //
  // Parse the serialized transaction and remove defaults ethers adds, then
  // repopulate with our own data.
  //
  useEffect(() => {
    (async () => {
      const parsed = ethers.utils.parseTransaction(bs58.decode(serializedTx));
      // EIP 1559 compatability
      delete parsed.gasPrice;
      // Use a void signer to populate transaction with data we need, e.g. from
      // field and nonce
      const voidSigner = new ethers.VoidSigner(
        ethereumCtx.walletPublicKey,
        ethereumCtx.provider
      );
      // Make sure to populate missing fields and resolve ENS
      const populatedTx = await voidSigner.populateTransaction({
        ...transaction,
        gasLimit: DEFAULT_GAS_LIMIT,
      });
      setTransaction(populatedTx);
    })();
  }, [serializedTx]);

  //
  // Estimate gas for the transaction
  //
  useEffect(() => {
    (async () => {
      if (transaction) {
        setLoading(true);
        // Estimate gas for the transaction
        let estimatedGas: BigNumber;
        try {
          estimatedGas = BigNumber.from(
            await ethereumCtx.provider.estimateGas(
              transaction as TransactionRequest
            )
          );
        } catch (error) {
          // Fee estimate failed, transaction is unlikely to succeed
          console.error("could not estimate gas", error);
          // Use a fallback value for estimate gas, but this is not likely to be
          // accurate given the gas estimate call failed. 150k is a good value
          // for all ERC20 methods.
          estimatedGas = DEFAULT_GAS_LIMIT;
          setSimulationError(true);
        }
        setEstimatedGas(estimatedGas);
        // populateTransaction should have added a nonce, add it to overrides
        setTransactionOverrides({
          ...transactionOverrides,
          nonce: transaction.nonce
            ? BigNumber.from(transaction.nonce).toNumber()
            : null,
          gasLimit: estimatedGas,
        });
        setLoading(false);
      }
    })();
  }, [transaction]);

  //
  // Updated the estimated transaction fee on changes to the gas estimate.
  //
  useEffect(() => {
    (async () => {
      if (estimatedGas) {
        setEstimatedTxFee(
          estimatedGas
            .mul(transactionOverrides.maxFeePerGas!)
            .add(estimatedGas.mul(transactionOverrides.maxPriorityFeePerGas!))
        );
      }
    })();
  }, [
    estimatedGas,
    transactionOverrides.maxFeePerGas,
    transactionOverrides.maxPriorityFeePerGas,
  ]);

  const networkFeeUsd = (
    (estimatedTxFee.toNumber() * ethPrice.usd) /
    1e18
  ).toFixed(2);

  return {
    loading,
    transaction: bs58.encode(
      ethers.utils.serializeTransaction({
        ...transaction,
        ...transactionOverrides,
      } as UnsignedTransaction)
    ),
    transactionOverrides,
    setTransactionOverrides,
    from: ethereumCtx.walletPublicKey,
    balanceChanges: null,
    simulationError,
    network: "Ethereum",
    networkFee: ethers.utils.formatUnits(estimatedTxFee, 18),
    networkFeeUsd: networkFeeUsd,
  };
}

//
// Transaction data for Solana.
//
export function useSolanaTxData(serializedTx: any): TransactionData {
  const background = useBackgroundClient();
  const tokenRegistry = useSplTokenRegistry();
  const tokenAccountsSorted = useBlockchainNativeTokens(Blockchain.SOLANA);
  const { connection, walletPublicKey } = useSolanaCtx();

  const [loading, setLoading] = useState(true);
  const [simulationError, setSimulationError] = useState(false);
  const [estimatedTxFee, setEstimatedTxFee] = useState(0);
  const [balanceChanges, setBalanceChanges] = useState({});

  useEffect(() => {
    const estimateTxFee = async () => {
      const transaction = deserializeTransaction(serializedTx);
      let fee;
      try {
        // TODO: Remove type inference after the API for `getFeeForMessage` changes
        const response = await connection.getFeeForMessage(
          transaction.message as Message
        );
        fee = response.value;
      } catch (e) {
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
    transaction: serializedTx,
    from: walletPublicKey.toString(),
    simulationError,
    balanceChanges,
    network: "Solana",
    networkFee: ethers.utils.formatUnits(estimatedTxFee, 9),
  };
}
