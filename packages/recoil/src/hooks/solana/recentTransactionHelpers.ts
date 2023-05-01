// Note(peter): copied from extension
import {
  SOL_NATIVE_MINT,
  walletAddressDisplay,
  WSOL_MINT,
} from "@coral-xyz/common";
import type { TokenInfo } from "@solana/spl-token-registry";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { NftEventTypes, Source, TransactionType } from "helius-sdk/dist/types";

export const UNKNOWN_ICON_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12ZM10.9645 15.3015C10.9645 15.7984 11.3677 16.2015 11.8645 16.2015C12.3612 16.2015 12.7645 15.7984 12.7645 15.3015C12.7645 14.8047 12.3612 14.4015 11.8645 14.4015C11.3677 14.4015 10.9645 14.8047 10.9645 15.3015ZM13.3939 11.8791C13.9135 11.5085 14.2656 11.1748 14.4511 10.8777C14.8776 10.1948 14.8728 9.02088 14.0532 8.35291C12.9367 7.44383 10.8943 7.77224 9.6001 8.49763L10.2067 9.7155C10.9189 9.35193 11.553 9.17 12.1092 9.17C12.6546 9.17 13.1214 9.36453 13.1214 9.91004C13.1214 10.4891 12.6543 10.8231 12.1713 11.1684L12.171 11.1686L12.1645 11.173C11.9915 11.2996 11.8416 11.4235 11.7147 11.5442C11.5451 11.7059 11.4168 11.8621 11.3298 12.013C11.1013 12.4085 11.1014 12.736 11.1019 13.152V13.2015H12.5761L12.576 13.158C12.5755 12.6312 12.5753 12.4844 13.3939 11.8791ZM20.5 12C20.5 16.6944 16.6944 20.5 12 20.5C7.30558 20.5 3.5 16.6944 3.5 12C3.5 7.30558 7.30558 3.5 12 3.5C16.6944 3.5 20.5 7.30558 20.5 12ZM22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z' fill='%238F929E'/%3E%3C/svg%3E";

export type Instruction = {
  accounts: Array<any>;
  data: string;
  programId: string;
  innerInstructions: Array<any>;
};

export type TokenTransfer = {
  fromTokenAccount: string;
  fromUserAccount: string;
  mint: string;
  toTokenAccount: string;
  toUserAccount: string;
  tokenAmount: number;
  tokenStandard: string;
};

export type AccountData = {
  accounts: string;
  nativeBalanceChange: number;
  tokenBalanceChanges: Array<any>;
  innerInstructions: Array<any>;
};

export type HeliusParsedTransaction = {
  accountData: Array<AccountData>;
  blockchain: string;
  description: string;
  events: any;
  fee: number;
  feePayer: string;
  instructions: Array<Instruction>;
  nativeTransfers: Array<any>;
  signature: string;
  slot: number;
  source: string;
  timestamp: number;
  tokenTransfers: Array<TokenTransfer>;
  transactionError: string | null;
  type: string;
};

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
  return (
    sourceOrType
      // @ts-expect-error this does exist in the browser context
      .replaceAll("_", " ")
      .split(" ")
      .map((word: string) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ")
  );
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

export const parseSwapTransaction = (
  transaction: HeliusParsedTransaction,
  tokenData: ReturnType<typeof getTokenData>
) => {
  try {
    const {
      nativeInput,
      nativeOutput,
      tokenInputs: [tokenInput],
      tokenOutputs: [tokenOutput],
    } = transaction.events.swap;

    return [
      [nativeInput, tokenInput],
      [nativeOutput, tokenOutput],
    ].map(([n, t], i) => {
      const { mint, amount } = n
        ? {
            mint: SOL_NATIVE_MINT,
            amount: (Number(n.amount) / LAMPORTS_PER_SOL).toFixed(5),
          }
        : {
            mint: t.mint,
            amount: (
              Number(t.rawTokenAmount.tokenAmount) /
              10 ** t.rawTokenAmount.decimals
            ).toFixed(5),
          };

      return {
        tokenIcon: tokenData[i]?.logoURI || UNKNOWN_ICON_SRC,
        amountWithSymbol: `${amount} ${
          tokenData?.[i]?.symbol || walletAddressDisplay(mint)
        }`,
      };
    });
  } catch (err) {
    console.error(err);
    // TODO: remove this previous behavior after some testing
    return Array(2).map((_, i) => ({
      tokenIcon: tokenData[i]?.logoURI || UNKNOWN_ICON_SRC,
      amountWithSymbol: [
        transaction?.tokenTransfers?.[i]?.tokenAmount.toFixed(5),
        tokenData[i]?.symbol ||
          walletAddressDisplay(transaction?.tokenTransfers?.[i]?.mint),
      ].join(" "),
    }));
  }
};
