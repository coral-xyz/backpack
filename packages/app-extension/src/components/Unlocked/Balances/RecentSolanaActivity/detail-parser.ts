import { activeWallet, useActiveWallet } from "@coral-xyz/recoil";

export const isNFTTransaction = (transaction: any): boolean => {
  return (
    (transaction?.type?.includes("NFT") ||
      transaction?.tokenTransfers[0]?.tokenStandard === "NonFungible") &&
    transaction?.metaData?.offChainData?.image
  );
};

export const getTransactionTitle = (transaction: any) => {
  const activeWallet = useActiveWallet();
  switch (transaction.type) {
    case "TRANSFER":
      if (
        transaction?.tokenTransfers[0]?.fromUserAccount ===
        activeWallet.publicKey
      ) {
        return "Sent";
      } else if (
        transaction?.tokenTransfers[0]?.toUserAccount === activeWallet.publicKey
      ) {
        return "Recieved";
      } else {
        return "Transferred";
      }
    case "SWAP":
      return "Token Swap";
    default:
      if (
        isNFTTransaction(transaction) &&
        (transaction?.metaData?.onChainData?.data?.name ||
          transaction?.metaData?.offChainData?.name)
      ) {
        return (
          transaction?.metaData?.onChainData?.data?.name ||
          transaction?.metaData?.offChainData?.name
        );
      }
      return "App Interaction";
  }
};

export const getSourceNameFormatted = (source: string): string => {
  return source
    .replace("_", " ")
    .toLowerCase()
    .replace(/(^\w|\s\w)/g, (c: string) => c.toUpperCase());
};

export const getTransactionCaption = (transaction: any): string => {
  const activeWallet = useActiveWallet();
  switch (transaction.type) {
    // case "TRANSFER":
    case "SWAP":
      const desc = transaction.description.split(" ");
      return `${desc[3]} -> ${desc[6]}`;

    case "NFT_LISTING":
      return `Listed on ${getSourceNameFormatted(transaction.source)}`;
    case "NFT_SALE":
      return `${
        // activeWallet.publicKey
        transaction.feePayer === activeWallet.publicKey ? "Bought" : "Sold"
      } on ${getSourceNameFormatted(transaction.source)}`;

    case "NFT_CANCEL_LISTING":
      return `
        Canceled listing on ${getSourceNameFormatted(transaction.source)}`;

    default:
      if (isNFTTransaction(transaction))
        return getSourceNameFormatted(transaction.source);
      if (transaction?.source === "CARDINAL_RENT") return "Rent Paid";
      return "App Interaction";
  }
};
