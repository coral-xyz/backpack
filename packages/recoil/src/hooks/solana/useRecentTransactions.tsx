// Note(peter): copied from extension
import type { RecentTransaction } from "@coral-xyz/common";
import { Blockchain } from "@coral-xyz/common";
import { useRecoilValue, useRecoilValueLoadable } from "recoil";

import * as atoms from "../../atoms";
import { metadataForRecentSolanaTransaction } from "../../atoms/recent-transactions";
import { useActiveWallet } from "../wallet";

import type { HeliusParsedTransaction } from "./recentTransactionHelpers";
import {
  formatTimestampListView,
  getTokenData,
  getTransactionCaption,
  getTransactionTitle,
  groupTxnsByDate,
  // isNFTTransaction,
  // isUserTxnSender,
  // parseSwapTransaction,
} from "./recentTransactionHelpers";
import { useJupiterTokenMap } from "./useJupiter";

export function useRecentTransactions({
  blockchain,
  address,
  contractAddresses,
  transactions,
}: {
  blockchain: Blockchain;
  address: string;
  contractAddresses: string[];
  transactions?: RecentTransaction[];
}) {
  const _recentSolTransactions = useRecoilValue(
    atoms.recentSolanaTransactions({ address })
  );

  const _recentEthTransactions = useRecoilValue(
    atoms.recentEthereumTransactions({ address, contractAddresses })
  );

  if (transactions) {
    return transactions;
  }

  if (blockchain === Blockchain.SOLANA) {
    return _recentSolTransactions;
  } else if (blockchain === Blockchain.ETHEREUM) {
    return _recentEthTransactions;
  }

  throw new Error("invalid blockchain");
}

export function useRecentTransactionData(transaction: HeliusParsedTransaction) {
  const registry = useJupiterTokenMap();
  const { contents, state } = useRecoilValueLoadable(
    metadataForRecentSolanaTransaction({ transaction })
  );
  const activeWallet = useActiveWallet();
  const tokenData = getTokenData(registry, transaction);
  const metadata = (state === "hasValue" && contents) || undefined;

  const transactionTitle = getTransactionTitle(
    activeWallet,
    transaction,
    metadata
  );

  const transactionCaption = getTransactionCaption(
    activeWallet,
    transaction,
    tokenData,
    metadata
  );

  return {
    title: transactionTitle,
    caption: transactionCaption,
    timestamp: formatTimestampListView(transaction.timestamp),
    tokenData,
    metadata,
  };
}

export function useRecentTransactionsGroupedByDate({
  blockchain,
  address,
  contractAddresses,
  transactions: _transactions,
}) {
  const transactions = useRecentTransactions({
    blockchain: blockchain,
    address: address,
    contractAddresses: contractAddresses,
    transactions: _transactions,
  });

  const sections = groupTxnsByDate(transactions).map((group) => ({
    title: formatTimestampListView(group[0].timestamp),
    data: group,
  }));

  return sections;
}

export function useRecentSolanaTransactions({ address }: { address: string }) {
  return useRecoilValue(atoms.recentSolanaTransactions({ address }));
}

export function useRecentEthereumTransactions({
  address,
  contractAddresses,
}: {
  address: string;
  contractAddresses?: Array<string>;
}) {
  return useRecoilValue(
    atoms.recentEthereumTransactions({ address, contractAddresses })
  );
}
