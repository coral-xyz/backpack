import { useActiveWallet } from "@coral-xyz/recoil";
import type { TokenInfo } from "@solana/spl-token-registry";
import { NftEventTypes, Source, TransactionType } from "helius-sdk/dist/types";

import type { HeliusParsedTransaction } from "./types";

export const isNFTTransaction = (
  transaction: HeliusParsedTransaction
): boolean => {
  return (
    NftEventTypes.includes(transaction?.type as TransactionType) ||
    transaction?.tokenTransfers[0]?.tokenStandard === "NonFungible"
  );
};

export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
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

export const formatTimestampListView = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return (
    date.getDate() +
    " " +
    new Intl.DateTimeFormat("en-US", { month: "long" }).format(date) +
    ", " +
    date.getFullYear()
  );
};

export const groupTxnsByDate = (
  arr: HeliusParsedTransaction[]
): HeliusParsedTransaction[][] => {
  const result: HeliusParsedTransaction[][] = [];
  let currentDate = "";

  for (const item of arr) {
    const date = new Date(item?.timestamp * 1000).toDateString();
    if (date !== currentDate) {
      console.log(date, "!");
      currentDate = date;
      result.push([]);
    }
    result[result.length - 1].push(item);
  }
  return result;
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
    transaction?.tokenTransfers[0]?.fromUserAccount ===
      activeWallet.publicKey ||
    transaction?.nativeTransfers[0]?.fromUserAccount === activeWallet.publicKey
  )
    return true;

  if (
    transaction?.tokenTransfers[0]?.toUserAccount === activeWallet.publicKey ||
    transaction?.nativeTransfers[0]?.toUserAccount === activeWallet.publicKey
  )
    return false;

  return null;
};

export const getTransactionTitle = (transaction: HeliusParsedTransaction) => {
  switch (transaction.type) {
    case TransactionType.BURN:
      return "Burned";
    // case TransactionType.UNKNOWN:
    case TransactionType.TRANSFER:
      // send/receive NFT's are returned as TransactionType.TRANSFER

      const nftName =
        transaction?.metadata?.onChainData?.data?.name ||
        transaction?.metadata?.offChainData?.name;
      if (isNFTTransaction(transaction) && nftName) {
        return nftName;
      }
      if (isUserTxnSender(transaction)) return "Sent";
      else if (isUserTxnSender(transaction) === false) return "Received";

      // SOL TRANSFER
      // if (transaction.source === Source.SYSTEM_PROGRAM) {
      // }
      // if (TransactionType.TRANSFER) return "Transferred";
      return "App Interaction";

    case TransactionType.SWAP:
      return "Token Swap";
    default:
      let title = "App Interaction";

      // if (transaction?.source) title = "App Interaction";
      // if transaction is an NFT, set the NFT name as the Title
      if (
        isNFTTransaction(transaction)
        // &&
        //   transaction?.metadata?.onChainData?.data?.name) ||
        // (isNFTTransaction(transaction) &&
        //   transaction?.metadata?.offChainData?.name
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
      // if (transaction?.type && transaction?.type !== TransactionType.UNKNOWN) {
      //   title = getSourceOrTypeFormatted(transaction.type);
      //   return title;
      // }

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
    // case TransactionType.UNKNOWN:
    case TransactionType.TRANSFER:
      if (isUserTxnSender(transaction)) {
        return `To: ${getTruncatedAddress(
          transaction?.tokenTransfers[0]?.toUserAccount ||
            transaction?.nativeTransfers[0]?.toUserAccount
        )}`;
      } else if (isUserTxnSender(transaction) === false) {
        return `From: ${getTruncatedAddress(
          transaction?.tokenTransfers[0]?.fromUserAccount ||
            transaction?.nativeTransfers[0]?.fromUserAccount
        )}`;
      }
      // if (TransactionType.TRANSFER) return "Transferred";
      return transaction?.source &&
        transaction?.source !== TransactionType.UNKNOWN
        ? getSourceOrTypeFormatted(transaction?.source)
        : "";
    case TransactionType.SWAP:
      // fallback to truncated mint address if token metadata was not found
      return `${
        tokenData?.[0]?.symbol ??
        getTruncatedAddress(transaction?.tokenTransfers?.[0]?.mint)
      } -> ${
        tokenData?.[1]?.symbol ??
        getTruncatedAddress(transaction?.tokenTransfers?.[1]?.mint)
      }`;

    case TransactionType.NFT_LISTING:
      return `Listed on ${getSourceOrTypeFormatted(transaction.source)}`;
    case TransactionType.NFT_SALE:
      return `${
        transaction.feePayer === activeWallet.publicKey ? "Bought" : "Sold"
      } on ${getSourceOrTypeFormatted(transaction.source)}`;

    case TransactionType.NFT_CANCEL_LISTING:
      return `
        Canceled listing on ${getSourceOrTypeFormatted(transaction.source)}`;

    default:
      if (transaction?.source === Source.CARDINAL_RENT) return "Rent Paid";

      if (transaction?.description)
        return transaction?.description.split(" ").slice(1).join(" ");

      if (
        transaction?.source &&
        transaction?.source !== TransactionType.UNKNOWN
      )
        return getSourceOrTypeFormatted(transaction.source);
      return "";
  }
};
