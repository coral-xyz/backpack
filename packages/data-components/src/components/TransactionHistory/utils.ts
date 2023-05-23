import { walletAddressDisplay } from "@coral-xyz/common";
import { TransactionType } from "helius-sdk";

import type { Transaction } from "../../apollo/graphql";
import { formatDate } from "../../utils";

export type TransactionGroup = {
  date: string;
  data: Partial<Transaction>[];
};

/**
 * Group the argued list of transactions by date.
 * @export
 * @param {Transaction[]} transactions
 * @returns {TransactionGroup[]}
 */
export function getGroupedTransactions(
  transactions: Partial<Transaction>[]
): TransactionGroup[] {
  const groupedTxs: TransactionGroup[] = [];
  const filteredTxs = transactions.filter((t) => t.timestamp);

  for (let i = 0; i < filteredTxs.length; i++) {
    const date = formatDate(new Date(transactions[i].timestamp!));

    if (
      groupedTxs.length === 0 ||
      groupedTxs[groupedTxs.length - 1].date !== date
    ) {
      groupedTxs.push({
        date,
        data: [filteredTxs[i]],
      });
    } else {
      groupedTxs[groupedTxs.length - 1].data.push(filteredTxs[i]);
    }
  }
  return groupedTxs;
}

export type ParseTransactionDetails = {
  br?: string;
  bl?: string;
  tl: string;
  tr: string;
};

/**
 * Natural language/semantic parsing of a transaction description string
 * to pull out and aggregate key details that can be displayed to users.
 * @export
 * @param {string} description
 * @param {string} type
 * @returns {(ParseTransactionDetails | null)}
 */
export function parseTransactionDescription(
  description: string,
  type: string
): ParseTransactionDetails | null {
  const desc = description.replace(/\.$/, "");
  switch (type) {
    case TransactionType.SWAP: {
      return _parseSwapDescription(desc);
    }

    case TransactionType.TRANSFER: {
      return _parseTransferDescription(desc);
    }

    case TransactionType.NFT_LISTING: {
      return _parseNftListingDescription(desc);
    }

    case TransactionType.NFT_SALE: {
      return _parseNftSoldDescription(desc);
    }

    default: {
      return null;
    }
  }
}

/**
 * Convert a snake case string into normalized title case.
 * @export
 * @param {string} input
 * @returns {string}
 */
export function snakeToTitleCase(input: string): string {
  const parts = input.split("_").map((t) => t.toLowerCase());
  const titleCasesParts = parts.map((p) =>
    p.length === 1 ? p : `${p[0].toUpperCase()}${p.slice(1)}`
  );

  if (titleCasesParts[0] === "Nft") {
    titleCasesParts[0] = titleCasesParts[0].toUpperCase();
  }

  return titleCasesParts.join(" ");
}

/**
 * Parses the description string for an NFT listing transaction.
 * @param {string} description
 * @returns {(ParseTransactionDetails | null)}
 * @example "EcxjN4mea6Ah9WSqZhLtSJJCZcxY73Vaz6UVHFZZ5Ttz listed Mad Lad #8811 for 131 SOL on MAGIC_EDEN."
 */
function _parseNftListingDescription(
  description: string
): ParseTransactionDetails | null {
  try {
    const base = description.split("listed ")[1];
    const [item, other] = base.split(" for ");
    const [amount, source] = other.split(" on ");
    return {
      bl: `Listed on ${snakeToTitleCase(source)}`,
      tl: item,
      tr: amount,
    };
  } catch {
    return null;
  }
}

/**
 * Parses the description string for an NFT sale transaction.
 * @param {string} description
 * @returns {(ParseTransactionDetails | null)}
 * @example "EcxjN4mea6Ah9WSqZhLtSJJCZcxY73Vaz6UVHFZZ5Ttz sold Mad Lad #3150 to 69X4Un6qqC8QBeBKk6zrqUVKGccnWqgUkwdLcC7wiLFB for 131 SOL on MAGIC_EDEN"
 */
function _parseNftSoldDescription(
  description: string
): ParseTransactionDetails | null {
  try {
    const base = description.split("sold ")[1];
    const [item, recipientOther] = base.split(" to ");
    const [_, amountOther] = recipientOther.split(" for "); // FIXME: use recipient address
    const [amount, source] = amountOther.split(" on ");
    return {
      bl: `Sold on ${snakeToTitleCase(source)}`,
      tl: item,
      tr: amount,
    };
  } catch {
    return null;
  }
}

/**
 * Parses the description string for a swap transaction.
 * @param {string} description
 * @returns {(ParseTransactionDetails | null)}
 * @example "EcxjN4mea6Ah9WSqZhLtSJJCZcxY73Vaz6UVHFZZ5Ttz swapped 0.001 SOL for 0.022 USDC"
 */
function _parseSwapDescription(
  description: string
): ParseTransactionDetails | null {
  try {
    const items = description.split("swapped ")[1].split(" for ");
    const entries = items.map((i) => i.split(" ")) as [string, string][];
    return {
      br: `-${items[0]}`,
      tl: `${entries[0][0]} -> ${entries[1][0]}`,
      tr: `+${items[1]}`,
    };
  } catch {
    return null;
  }
}

/**
 * Parses the description string for a transfer transaction.
 * @param {string} description
 * @returns {(ParseTransactionDetails | null)}
 * @example "EcxjN4mea6Ah9WSqZhLtSJJCZcxY73Vaz6UVHFZZ5Ttz transferred 0.1 SOL to 47iecF4gWQYrGMLh9gM3iuQFgb1581gThgfRw69S55T8"
 */
function _parseTransferDescription(
  description: string
): ParseTransactionDetails | null {
  try {
    const base = description.split("transferred ")[1];
    const [amount, to] = base.split(" to ");
    const action = "Sent"; // FIXME: sent or received?
    return {
      bl: `To: ${walletAddressDisplay(to)}`, // FIXME: to or from?
      tl: action,
      tr: `${action === "Sent" ? "-" : "+"} ${amount}`,
    };
  } catch {
    return null;
  }
}
