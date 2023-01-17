import { useActiveWallet } from "@coral-xyz/recoil";

import { heliusSourceTypes, heliusTransactionTypes } from "./types";

export const isNFTTransaction = (transaction: any): boolean => {
  return (
    (transaction?.type?.includes("NFT") ||
      transaction?.tokenTransfers[0]?.tokenStandard === "NonFungible") &&
    transaction?.metaData?.offChainData?.image
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

export const getSourceNameFormatted = (source: string): string => {
  return source
    .replace("_", " ")
    .toLowerCase()
    .replace(/(^\w|\s\w)/g, (c: string) => c.toUpperCase());
};

export const getTruncatedAddress = (address: string): string => {
  return `${address.slice(0, 5)}...${address.slice(address.length - 5)}`;
};

export const getTransactionTitle = (transaction: any) => {
  const activeWallet = useActiveWallet();
  switch (transaction.type) {
    case heliusTransactionTypes.transfer:
      if (
        transaction?.tokenTransfers[0]?.fromUserAccount ===
        activeWallet.publicKey
      ) {
        return "Sent";
      } else if (
        transaction?.tokenTransfers[0]?.toUserAccount === activeWallet.publicKey
      ) {
        return "Recieved";
      }
      return "Transferred";

    case heliusTransactionTypes.swap:
      return "Token Swap";
    default:
      let title = "App Interaction";
      // if transaction is an NFT, set the NFT name as the tx title
      if (
        isNFTTransaction(transaction) &&
        (transaction?.metaData?.onChainData?.data?.name ||
          transaction?.metaData?.offChainData?.name)
      ) {
        title =
          transaction?.metaData?.onChainData?.data?.name ||
          transaction?.metaData?.offChainData?.name;
      }
      return title;
  }
};

export const getTransactionCaption = (transaction: any): string => {
  const activeWallet = useActiveWallet();
  switch (transaction.type) {
    case heliusTransactionTypes.transfer:
      if (
        transaction?.tokenTransfers[0]?.fromUserAccount ===
        activeWallet.publicKey
      ) {
        return `To: ${getTruncatedAddress(
          transaction?.tokenTransfers[0]?.toUserAccount
        )}`;
      } else if (
        transaction?.tokenTransfers[0]?.toUserAccount === activeWallet.publicKey
      ) {
        return `From: ${getTruncatedAddress(
          transaction?.tokenTransfers[0]?.fromUserAccount
        )}`;
      }
      return "Transferred";
    case heliusTransactionTypes.swap:
      const desc = transaction.description.split(" ");
      return `${desc[3]} -> ${desc[6]}`;

    case heliusTransactionTypes.nftListing:
      return `Listed on ${getSourceNameFormatted(transaction.source)}`;
    case heliusTransactionTypes.nftSale:
      return `${
        // activeWallet.publicKey
        transaction.feePayer === activeWallet.publicKey ? "Bought" : "Sold"
      } on ${getSourceNameFormatted(transaction.source)}`;

    case heliusTransactionTypes.nftCancelListing:
      return `
        Canceled listing on ${getSourceNameFormatted(transaction.source)}`;

    default:
      if (isNFTTransaction(transaction))
        return getSourceNameFormatted(transaction.source);
      if (transaction?.source === heliusSourceTypes.cardinalRent)
        return "Rent Paid";
      return "App Interaction";
  }
};
