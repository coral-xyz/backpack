import { useActiveWallet } from "@coral-xyz/recoil";
import type { TokenInfo } from "@solana/spl-token-registry";

import type { HeliusParsedTransaction } from "./types";
import { heliusSourceTypes, heliusTransactionTypes } from "./types";

export const isNFTTransaction = (
  transaction: HeliusParsedTransaction
): boolean => {
  return (
    (transaction?.type?.includes("NFT") ||
      transaction?.tokenTransfers[0]?.tokenStandard === "NonFungible") &&
    transaction?.metadata?.offChainData?.image
  );
};

export const formatTimestamp = (date: Date): string => {
  let hours = date.getHours();
  let minutes: string | number = date.getMinutes();
  let ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  return (
    date.getDate() +
    " " +
    new Intl.DateTimeFormat("en-US", { month: "long" }).format(date) +
    ", at " +
    hours +
    ":" +
    minutes +
    " " +
    ampm
  );
};

export const getSourceOrTypeFormatted = (sourceOrType: string): string => {
  return sourceOrType
    .replaceAll("_", " ")
    .split(" ")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
};

export const getTruncatedAddress = (address: string): string => {
  return `${address.slice(0, 5)}...${address.slice(address.length - 5)}`;
};

export const isUserTxnSender = (transaction: HeliusParsedTransaction) => {
  const activeWallet = useActiveWallet();

  if (
    transaction?.tokenTransfers[0]?.fromUserAccount === activeWallet.publicKey
  )
    return true;

  if (transaction?.tokenTransfers[0]?.toUserAccount === activeWallet.publicKey)
    return false;

  return null;
};

export const getTransactionTitle = (transaction: HeliusParsedTransaction) => {
  switch (transaction.type) {
    case heliusTransactionTypes.burn:
      return "Burned";
    case heliusTransactionTypes.unknown:
    case heliusTransactionTypes.transfer:
      if (isUserTxnSender(transaction)) return "Sent";
      else if (isUserTxnSender(transaction) === false) return "Recieved";
      if (heliusTransactionTypes.transfer) return "Transferred";
      return "Transaction";

    case heliusTransactionTypes.swap:
      return "Token Swap";
    default:
      let title = "Transaction";

      if (transaction?.source) title = "App Interaction";
      // if transaction is an NFT, set the NFT name as the Title
      if (
        (isNFTTransaction(transaction) &&
          transaction?.metadata?.onChainData?.data?.name) ||
        (isNFTTransaction(transaction) &&
          transaction?.metadata?.offChainData?.name)
      ) {
        title =
          transaction?.metadata?.onChainData?.data?.name ||
          transaction?.metadata?.offChainData?.name;
        return title;
      }

      if (transaction?.type?.includes("MINT")) return "Minted";

      // txn has a transactionError
      if (transaction?.transactionError) {
        title = "Failed";
      }

      // if we have a type, format it and set it as the title
      if (
        transaction?.type &&
        transaction?.type !== heliusTransactionTypes.unknown
      ) {
        title = getSourceOrTypeFormatted(transaction.type);
        return title;
      }

      return title;
  }
};

// used to display txn caption in list view
export const getTransactionCaption = (
  transaction: HeliusParsedTransaction,
  tokenData: (TokenInfo | undefined)[]
): string => {
  const activeWallet = useActiveWallet();

  switch (transaction.type) {
    case heliusTransactionTypes.unknown:
    case heliusTransactionTypes.transfer:
      if (isUserTxnSender(transaction)) {
        return `To: ${getTruncatedAddress(
          transaction?.tokenTransfers[0]?.toUserAccount
        )}`;
      } else if (isUserTxnSender(transaction) === false) {
        return `From: ${getTruncatedAddress(
          transaction?.tokenTransfers[0]?.fromUserAccount
        )}`;
      }
      // if (heliusTransactionTypes.transfer) return "Transferred";
      return transaction?.source &&
        transaction?.source !== heliusSourceTypes.unknown
        ? getSourceOrTypeFormatted(transaction?.source)
        : "";
    case heliusTransactionTypes.swap:
      // fallback to truncated mint address if token metadata was not found
      return `${
        tokenData?.[0]?.symbol ??
        getTruncatedAddress(transaction?.tokenTransfers?.[0]?.mint)
      } -> ${
        tokenData?.[1]?.symbol ??
        getTruncatedAddress(transaction?.tokenTransfers?.[1]?.mint)
      }`;

    case heliusTransactionTypes.nftListing:
      return `Listed on ${getSourceOrTypeFormatted(transaction.source)}`;
    case heliusTransactionTypes.nftSale:
      return `${
        transaction.feePayer === activeWallet.publicKey ? "Bought" : "Sold"
      } on ${getSourceOrTypeFormatted(transaction.source)}`;

    case heliusTransactionTypes.nftCancelListing:
      return `
        Canceled listing on ${getSourceOrTypeFormatted(transaction.source)}`;

    default:
      if (transaction?.source === heliusSourceTypes.cardinalRent)
        return "Rent Paid";

      if (transaction?.description)
        return transaction?.description.split(" ").slice(1).join(" ");

      if (
        transaction?.source &&
        transaction?.source !== heliusTransactionTypes.unknown
      )
        return getSourceOrTypeFormatted(transaction.source);
      return "";
  }
};
