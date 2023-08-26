import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";
import type { SolanaFeeConfig } from "@coral-xyz/common";
import {
  Blockchain,
  deserializeLegacyTransaction,
  deserializeTransaction,
  SOL_NATIVE_MINT,
  UI_RPC_METHOD_SOLANA_SIMULATE,
} from "@coral-xyz/common";
import type { TransactionRequest } from "@ethersproject/abstract-provider";
import type { UnsignedTransaction } from "@ethersproject/transactions";
import { AccountLayout, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import type { AddressLookupTableAccount, Message } from "@solana/web3.js";
import {
  ComputeBudgetInstruction,
  ComputeBudgetProgram,
  PublicKey,
} from "@solana/web3.js";
import { BigNumber, ethers } from "ethers";

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

export type TransactionData = {
  loading: boolean;
  transaction: string;
  solanaFeeConfig?: { config: SolanaFeeConfig; disabled: boolean };
  setSolanaFeeConfig?: Dispatch<
    SetStateAction<{ config: SolanaFeeConfig; disabled: boolean } | null>
  >;
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
  nonce: number | undefined;
  gasLimit: BigNumber;
  maxFeePerGas: BigNumber | undefined;
  maxPriorityFeePerGas: BigNumber | undefined;
};

const blockchainTxDataHooks = {
  [Blockchain.ETHEREUM]: useEthereumTxData,
  [Blockchain.SOLANA]: useSolanaTxData,
} as const;

export function useTransactionData(
  blockchain: Blockchain,
  transaction: any
): TransactionData {
  return blockchainTxDataHooks[blockchain](transaction);
}

export function useMultipleTransactionsData(
  blockchain: Blockchain,
  transactions: string[]
): TransactionData[] {
  return transactions.map((tx) => blockchainTxDataHooks[blockchain](tx));
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
      nonce: undefined,
      gasLimit: estimatedGas,
      maxFeePerGas: ethereumCtx.feeData.maxFeePerGas || undefined,
      maxPriorityFeePerGas:
        ethereumCtx.feeData.maxPriorityFeePerGas || undefined,
    });

  //
  // Parse the serialized transaction and remove defaults ethers adds, then
  // repopulate with our own data.
  //
  useEffect(() => {
    (async () => {
      const parsed = ethers.utils.parseTransaction(bs58.decode(serializedTx));

      if (!parsed.chainId || parsed.chainId === 0) {
        // chainId not passed in serialized transaction, use provider
        parsed.chainId = parseInt(ethereumCtx.chainId);
      }

      // Use a void signer to populate transaction with data we need, e.g. from
      // field and nonce
      const voidSigner = new ethers.VoidSigner(
        ethereumCtx.walletPublicKey,
        ethereumCtx.provider
      );

      // Set any transaction override values that were passed in the serialized
      // transaction
      const overridesToUpdate: Partial<TransactionOverrides> = {};
      if (parsed.nonce != 0) {
        overridesToUpdate.nonce = parsed.nonce;
      } else {
        overridesToUpdate.nonce = await voidSigner.getTransactionCount();
      }
      if (!parsed.gasLimit.isZero()) {
        overridesToUpdate.gasLimit = parsed.gasLimit;
      }
      if (parsed.maxFeePerGas && !parsed.maxFeePerGas.isZero()) {
        overridesToUpdate.maxFeePerGas = parsed.maxFeePerGas;
      }
      if (
        parsed.maxPriorityFeePerGas &&
        !parsed.maxPriorityFeePerGas.isZero()
      ) {
        overridesToUpdate.maxPriorityFeePerGas = parsed.maxPriorityFeePerGas;
      }

      const newTransactionOverrides = {
        ...transactionOverrides,
        ...overridesToUpdate,
      };

      setTransactionOverrides(newTransactionOverrides);

      // Populate any missing fields in resulting transaction, resolve ENS, etc
      const populatedTx = await voidSigner.populateTransaction({
        // Pick only the fields we want from the parsed transaction
        to: parsed.to,
        from: parsed.from,
        data: parsed.data,
        value: parsed.value,
        // Apply the overrides
        ...newTransactionOverrides,
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
    Number(ethers.utils.formatEther(estimatedTxFee)) * ethPrice.usd
  )?.toFixed(2);

  return {
    loading,
    transaction: transaction
      ? bs58.encode(
          ethers.utils.serializeTransaction({
            ...transaction,
            ...transactionOverrides,
          } as UnsignedTransaction)
        )
      : serializedTx,
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
  const { connection, walletPublicKey } = useSolanaCtx();
  const tokenAccountsSorted = useBlockchainNativeTokens({
    publicKey: walletPublicKey.toString(),
    blockchain: Blockchain.SOLANA,
  });

  const [solanaFeeConfig, setSolanaFeeConfig] = useState<{
    config: SolanaFeeConfig;
    disabled: boolean;
  }>({
    config: {
      priorityFee: BigInt(0),
      computeUnits: 100000,
    },
    disabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [simulationError, setSimulationError] = useState(false);
  const [estimatedTxFee, setEstimatedTxFee] = useState(5000);
  const [balanceChanges, setBalanceChanges] = useState({});
  const [simulationAccounts, setSimulationAccounts] = useState<Array<string>>(
    []
  );

  useEffect(() => {
    const estimateTxFee = async () => {
      const transaction = deserializeTransaction(serializedTx);
      try {
        // TODO: Remove type inference after the API for `getFeeForMessage` changes
        const response = await connection.getFeeForMessage(
          transaction.message as Message
        );
        setEstimatedTxFee(response.value ?? 0);
      } catch (e) {
        // ignore
      }
    };

    const refreshSolanaConfig = async () => {
      const transaction = deserializeTransaction(serializedTx);

      if (transaction.version === "legacy") {
        const transaction = deserializeLegacyTransaction(serializedTx);
        setSimulationAccounts(
          transaction
            .compileMessage()
            .nonProgramIds()
            .map((k) => k.toString())
        );
        transaction.instructions.forEach((ix) => {
          if (ix.programId.equals(ComputeBudgetProgram.programId)) {
            try {
              const decodedUnits =
                ComputeBudgetInstruction.decodeSetComputeUnitLimit(ix);
              setSolanaFeeConfig((x) => ({
                ...x,
                config: {
                  ...x.config,
                  computeUnits: decodedUnits.units,
                },
                disabled: true,
              }));
            } catch (e) {
              console.warn(`ix is not of type compute unit`);
            }
            try {
              const decodedParams =
                ComputeBudgetInstruction.decodeSetComputeUnitPrice(ix);
              setSolanaFeeConfig((x) => ({
                ...x,
                config: {
                  ...x.config,
                  priorityFee: BigInt(decodedParams.microLamports),
                },
                disabled: true,
              }));
            } catch (e) {
              console.warn(`ix is not of type priority fee`);
            }
          }
        });
      } else if (transaction.version === 0) {
        // Resolve accounts for versioned transactions
        const addressLookupTableAccounts: Array<AddressLookupTableAccount> = [];
        const { addressTableLookups } = transaction.message;
        if (addressTableLookups.length > 0) {
          for (const addressTableLookup of addressTableLookups) {
            const result = await connection.getAddressLookupTable(
              addressTableLookup.accountKey
            );
            if (result.value) {
              addressLookupTableAccounts.push(result.value);
            }
          }
        }
        const accountKeys = transaction.message.getAccountKeys({
          addressLookupTableAccounts,
        });
        setSimulationAccounts([
          ...new Set(
            accountKeys.staticAccountKeys
              .map((k) => k.toString())
              .concat(
                accountKeys.accountKeysFromLookups
                  ? // Only writable accounts will contribute to balance changes
                    accountKeys.accountKeysFromLookups.writable.map((k) =>
                      k.toString()
                    )
                  : []
              )
          ),
        ]);
      }
    };
    estimateTxFee();
    refreshSolanaConfig();
  }, [serializedTx]);

  useEffect(() => {
    const estimateBalanceChanges = async () => {
      if (walletPublicKey && serializedTx && simulationAccounts.length > 0) {
        const result = await background.request({
          method: UI_RPC_METHOD_SOLANA_SIMULATE,
          params: [serializedTx, simulationAccounts],
        });
        if (result.value.err) {
          console.warn("failed to simulate", result.value.err);
          // TODO handle InsufficientFundsForRent
          setSimulationError(true);
        } else {
          const balanceChanges = result.value.accounts.reduce(
            (
              result: { symbol: { nativeChange: BigNumber; decimals: number } },
              account: any,
              index: number
            ) => {
              // Token changes
              const isToken = account.owner === TOKEN_PROGRAM_ID.toString();
              const isNativeSol = account.owner === SOL_NATIVE_MINT;

              if (isToken || isNativeSol) {
                try {
                  let accountNativeBalance: BigNumber;
                  let tokenMint: PublicKey;

                  // Parse token accounts for change in balances
                  if (isToken) {
                    try {
                      const tokenAccount = AccountLayout.decode(
                        Buffer.from(account.data[0], account.data[1])
                      );
                      if (
                        !new PublicKey(tokenAccount.owner).equals(
                          new PublicKey(walletPublicKey)
                        )
                      ) {
                        // Return the reducer state umodified if token account is not owned
                        return result;
                      }
                      accountNativeBalance = BigNumber.from(
                        tokenAccount.amount.toString()
                      );
                      // Standard token mint
                      tokenMint = new PublicKey(tokenAccount.mint);
                    } catch (error) {
                      // Decoding of token account failed, not a token account
                      return result;
                    }
                    // Parse changes in native SOL balances
                  } else {
                    // Not interested in SOL balance changes for accounts that
                    // are not the current address
                    if (
                      simulationAccounts[index] !== walletPublicKey.toString()
                    ) {
                      return result;
                    }
                    accountNativeBalance = BigNumber.from(
                      account.lamports.toString()
                    );
                    // Faux mint for native SOL
                    tokenMint = new PublicKey(SOL_NATIVE_MINT);
                  }

                  // Find the existing token account
                  const existingTokenAccount = tokenAccountsSorted.find((t) =>
                    new PublicKey(t.mint!).equals(tokenMint)
                  );

                  // Find the token in the registry to get the symbol for return
                  const token = tokenRegistry.get(tokenMint.toString());
                  if (!token) {
                    return result;
                  }

                  const existingNativeBalance = existingTokenAccount
                    ? existingTokenAccount.nativeBalance
                    : ethers.constants.Zero;

                  // Calculate the native balance change
                  const nativeChange = accountNativeBalance.sub(
                    existingNativeBalance
                  );

                  // Filter out zero change
                  if (!nativeChange.eq(ethers.constants.Zero)) {
                    result[token.symbol] = {
                      nativeChange,
                      decimals: token.decimals,
                    };
                  }
                } catch (err) {
                  // ignore, probably not a token account or some other
                  // failure, we don't want to fail displaying the popup
                  console.warn("failed to get balance changes", err);
                  return result;
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
  }, [serializedTx, simulationAccounts]);

  return {
    loading,
    transaction: serializedTx,
    from: walletPublicKey.toString(),
    simulationError,
    balanceChanges,
    network: "Solana",
    networkFee: ethers.utils.formatUnits(estimatedTxFee, 9),
    solanaFeeConfig,
    setSolanaFeeConfig,
  };
}
