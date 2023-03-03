import { walletAddressDisplay, WSOL_MINT } from "@coral-xyz/common";
import type { TokenInfo } from "@solana/spl-token-registry";
import { NftEventTypes, Source, TransactionType } from "helius-sdk/dist/types";

import { UNKNOWN_ICON_SRC } from "../../../common/Icon";

import type { HeliusParsedTransaction } from "./types";

const unknownTokenInfo = (mint: string): TokenInfo => ({
  address: mint,
  chainId: 0,
  decimals: 0,
  logoURI: UNKNOWN_ICON_SRC,
  name: "Unknown",
  symbol: "UNK",
});

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

export const isUserTxnSender = (
  transaction: HeliusParsedTransaction,
  activeWallet: any
) => {
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

export function getTransactionTitle(
  activeWallet: any,
  transaction: HeliusParsedTransaction,
  metadata?: any
): string {
  switch (transaction.type) {
    case TransactionType.BURN:
    case TransactionType.BURN_NFT:
      return "Burned";
    case TransactionType.TRANSFER:
      // send/receive NFT's are returned as TransactionType.TRANSFER
      const nftName = metadata?.onChainMetadata?.metadata?.data?.name;
      if (isNFTTransaction(transaction) && nftName) {
        return nftName;
      } else if (isUserTxnSender(transaction, activeWallet)) {
        return "Sent";
      } else if (isUserTxnSender(transaction, activeWallet) === false) {
        return "Received";
      } else {
        return "App Interaction";
      }
    case TransactionType.SWAP:
      return "Token Swap";
    case TransactionType.NFT_MINT: {
      const nftName = metadata?.onChainMetadata?.metadata?.data?.name;
      return `Minted: ${nftName}`;
    }
    default:
      let title = "App Interaction";

      // if (transaction?.source) title = "App Interaction";
      // if transaction is of type NFT and was not caught above under 'TRANSFER' case
      // TODO: test this case to see if it is necessary
      const nonTransferNftName =
        metadata?.onChainMetadata?.metadata?.data?.name;

      if (isNFTTransaction(transaction) && nonTransferNftName) {
        return nonTransferNftName;
      }

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
}

export const getTransactionDetailTitle = (
  activeWallet: any,
  transaction: HeliusParsedTransaction,
  publicKey: string
) => {
  switch (transaction.type) {
    case TransactionType.BURN:
    case TransactionType.BURN_NFT:
      return "Burned";

    case TransactionType.TRANSFER:
      if (isUserTxnSender(transaction, activeWallet)) return "Sent";
      else if (isUserTxnSender(transaction, activeWallet) === false)
        return "Received";
      return "App Interaction";

    case TransactionType.SWAP:
      return "Swap";

    case TransactionType.NFT_SALE:
      return transaction?.events?.nft?.seller === publicKey ? "Sold" : "Bought";

    case TransactionType.NFT_LISTING:
      return "Listed";

    case TransactionType.NFT_CANCEL_LISTING:
      return "Listed Canceled";

    case TransactionType.NFT_MINT:
      return "Minted NFT";

    default:
      let title = "App Interaction";

      if (transaction?.transactionError) {
        title = "Failed";
      }

      return title;
  }
};

// used to display txn caption in list view
export const getTransactionCaption = (
  activeWallet: any,
  transaction: HeliusParsedTransaction,
  tokenData: (TokenInfo | undefined)[],
  metadata?: any
): string => {
  switch (transaction.type) {
    // case TransactionType.UNKNOWN:
    case TransactionType.TRANSFER:
      if (isUserTxnSender(transaction, activeWallet)) {
        return `To: ${walletAddressDisplay(
          transaction?.tokenTransfers[0]?.toUserAccount ||
            transaction?.nativeTransfers[0]?.toUserAccount
        )}`;
      } else if (isUserTxnSender(transaction, activeWallet) === false) {
        return `From: ${walletAddressDisplay(
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
        tokenData?.[0]?.symbol ||
        walletAddressDisplay(transaction?.tokenTransfers?.[0]?.mint)
      } -> ${
        tokenData?.[1]?.symbol ||
        walletAddressDisplay(transaction?.tokenTransfers?.[1]?.mint)
      }`;

    case TransactionType.NFT_LISTING:
      return `Listed on ${getSourceOrTypeFormatted(transaction.source)}`;

    case TransactionType.NFT_SALE:
      return `${
        transaction?.events?.nft?.buyer === activeWallet.publicKey
          ? "Bought"
          : "Sold"
      } on ${getSourceOrTypeFormatted(transaction.source)}`;

    case TransactionType.NFT_CANCEL_LISTING:
      return `Canceled listing on ${getSourceOrTypeFormatted(
        transaction.source
      )}`;

    // case TransactionType.BURN:
    //   return transaction?.
    case TransactionType.NFT_MINT:
      return walletAddressDisplay(
        metadata?.onChainMetadata?.metadata?.collection?.key
      );

    default:
      if (transaction?.source === Source.CARDINAL_RENT) return "Rent Paid";

      // disable additional cases for now. Can uncomment/extend when needed
      // if (transaction?.description)
      //   return transaction?.description.split(" ")?.slice(1).join(" ");

      // if (
      //   transaction?.source &&
      //   transaction?.source !== TransactionType.UNKNOWN
      // )
      //   return getSourceOrTypeFormatted(transaction.source);
      return walletAddressDisplay(transaction?.instructions[0].programId);
  }
};

export const getTokenData = (
  registry: Map<string, TokenInfo>,
  transaction: HeliusParsedTransaction
): (TokenInfo | undefined)[] => {
  let tokenData: (TokenInfo | undefined)[] = [];

  if (transaction.type === TransactionType.SWAP) {
    // if token is isNativeInput/isNativeOutput, token swap is to/from SOL
    const isNativeInput = transaction.events?.swap?.nativeInput;
    const isNativeOutput = transaction.events?.swap?.nativeOutput;

    const tokenInput = isNativeInput
      ? WSOL_MINT
      : transaction.events?.swap?.tokenInputs?.[0]?.mint ||
        transaction.tokenTransfers?.[0]?.mint;

    const tokenOutput = isNativeOutput
      ? WSOL_MINT
      : transaction.events?.swap?.tokenOutputs?.[0]?.mint ||
        transaction.tokenTransfers?.[1]?.mint;

    if (tokenInput && registry.get(tokenInput)) {
      tokenData.push(registry.get(tokenInput) ?? unknownTokenInfo(tokenInput));
    }

    if (tokenOutput && registry.get(tokenOutput)) {
      tokenData.push(
        registry.get(tokenOutput) ?? unknownTokenInfo(tokenOutput)
      );
    }
  } else if (transaction.type === TransactionType.TRANSFER) {
    const transferredToken = transaction.tokenTransfers?.[0]?.mint;
    if (transferredToken && registry.get(transferredToken)) {
      tokenData.push(registry.get(transferredToken));
    }
  }

  return tokenData;
};
