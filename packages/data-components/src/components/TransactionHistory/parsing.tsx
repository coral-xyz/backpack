import { walletAddressDisplay } from "@coral-xyz/common";
import { TransactionType } from "helius-sdk";

import type { Transaction } from "../../apollo/graphql";
import { snakeToTitleCase } from "../../utils";

import {
  TransactionListItemIconBurn,
  TransactionListItemIconNft,
  TransactionListItemIconSwap,
  TransactionListItemIconTransfer,
} from "./TransactionListItemIcon";

export type ParseTransactionDetails = {
  br?: string;
  bl?: string;
  tl: string;
  tr: string;
  icon?: JSX.Element;
};

/**
 * Natural language/semantic parsing of a transaction description string
 * to pull out and aggregate key details that can be displayed to users.
 * @export
 * @param {string} activeWallet
 * @param {Partial<Transaction>} transaction
 * @returns {(ParseTransactionDetails | null)}
 */
export function parseTransaction(
  activeWallet: string,
  transaction: Partial<Transaction>
): ParseTransactionDetails | null {
  const desc = transaction.description?.replace(/\.$/, "") ?? "";
  switch (transaction.type) {
    case TransactionType.BURN:
    case TransactionType.BURN_NFT: {
      return _parseNftBurnDescription(desc);
    }

    case TransactionType.NFT_LISTING: {
      return _parseNftListingDescription(transaction, desc);
    }

    case TransactionType.NFT_CANCEL_LISTING: {
      return _parseNftListingCanceledDescription(transaction, desc);
    }

    case TransactionType.NFT_MINT: {
      return _parseNftMintDescription(transaction, desc);
    }

    case TransactionType.NFT_SALE: {
      return _parseNftSaleDescription(activeWallet, transaction, desc);
    }

    case TransactionType.SWAP: {
      return _parseSwapDescription(desc);
    }

    case TransactionType.TRANSFER: {
      return _parseTransferDescription(activeWallet, desc);
    }

    case TransactionType.UPGRADE_PROGRAM_INSTRUCTION: {
      return _parseUpgradeProgramTransaction(transaction);
    }

    default: {
      return null;
    }
  }
}

/**
 * Parses the description string for an NFT burn transaction.
 * @param {string} description
 * @returns {(ParseTransactionDetails | null)}
 * @example "EcxjN4mea6Ah9WSqZhLtSJJCZcxY73Vaz6UVHFZZ5Ttz burned 1 Mad Lads Coin"
 */
function _parseNftBurnDescription(
  description: string
): ParseTransactionDetails | null {
  try {
    const item = description.split("burned ")[1];
    return {
      tl: "Burned",
      tr: `-${item}`,
      icon: <TransactionListItemIconBurn size={44} />,
    }; // TODO: add image icon (maybe?)
  } catch {
    return null;
  }
}

/**
 * Parses the description string for an NFT listing cancellation transaction.
 * @param {Partial<Transaction>} transaction
 * @param {string} description
 * @returns {(ParseTransactionDetails | null)}
 * @example "EcxjN4mea6Ah9WSqZhLtSJJCZcxY73Vaz6UVHFZZ5Ttz cancelled 80 SOL listing for Mad Lads #2699 on TENSOR"
 */
function _parseNftListingCanceledDescription(
  transaction: Partial<Transaction>,
  description: string
): ParseTransactionDetails | null {
  try {
    const base = description.split("cancelled ")[1];
    const [amount, itemOther] = base.split(" listing for ");
    const [item, source] = itemOther.split(" on ");
    return {
      tl: item,
      tr: _truncateAmount(amount),
      bl: `Canceled listing on ${snakeToTitleCase(source)}`,
      icon: (
        <TransactionListItemIconNft
          mint={transaction.nfts?.[0] ?? undefined}
          size={44}
        />
      ),
    };
  } catch {
    return null;
  }
}

/**
 * Parses the description string for an NFT listing transaction.
 * @param {Partial<Transaction>} transaction
 * @param {string} description
 * @returns {(ParseTransactionDetails | null)}
 * @example "EcxjN4mea6Ah9WSqZhLtSJJCZcxY73Vaz6UVHFZZ5Ttz listed Mad Lad #8811 for 131 SOL on MAGIC_EDEN."
 */
function _parseNftListingDescription(
  transaction: Partial<Transaction>,
  description: string
): ParseTransactionDetails | null {
  try {
    const base = description.split("listed ")[1];
    const [item, other] = base.split(" for ");
    const [amount, source] = other.split(" on ");
    return {
      tl: item,
      tr: _truncateAmount(amount),
      bl: `Listed on ${snakeToTitleCase(source)}`,
      icon: (
        <TransactionListItemIconNft
          mint={transaction.nfts?.[0] ?? undefined}
          size={44}
        />
      ),
    };
  } catch {
    return null;
  }
}

/**
 * Parses the description string for an NFT mint transaction.
 * @param {Partial<Transaction>} transaction
 * @param {string} description
 * @returns {(ParseTransactionDetails | null)}
 * @example "EcxjN4mea6Ah9WSqZhLtSJJCZcxY73Vaz6UVHFZZ5Ttz minted Mad Lads #6477 for 6.9114946 SOL on CANDY_MACHINE_V3"
 */
function _parseNftMintDescription(
  transaction: Partial<Transaction>,
  description: string
): ParseTransactionDetails | null {
  try {
    const base = description.split("minted ")[1];
    const [item, amountOther] = base.split(" for ");
    const [amount, source] = amountOther.split(" on ");
    return {
      tl: item,
      tr: `-${_truncateAmount(amount)}`,
      bl: `Minted on ${snakeToTitleCase(source)}`,
      icon: (
        <TransactionListItemIconNft
          mint={transaction.nfts?.[0] ?? undefined}
          size={44}
        />
      ),
    };
  } catch {
    return null;
  }
}

/**
 * Parses the description string for an NFT sale transaction.
 * @param {string} activeWallet
 * @param {Partial<Transaction>} transaction
 * @param {string} description
 * @returns {(ParseTransactionDetails | null)}
 * @example "EcxjN4mea6Ah9WSqZhLtSJJCZcxY73Vaz6UVHFZZ5Ttz sold Mad Lad #3150 to 69X4Un6qqC8QBeBKk6zrqUVKGccnWqgUkwdLcC7wiLFB for 131 SOL on MAGIC_EDEN"
 */
function _parseNftSaleDescription(
  activeWallet: string,
  transaction: Partial<Transaction>,
  description: string
): ParseTransactionDetails | null {
  try {
    const [seller, base] = description.split(" sold ");
    const [item, recipientOther] = base.split(" to ");
    const [_, amountOther] = recipientOther.split(" for ");
    const [amount, source] = amountOther.split(" on ");
    return {
      tl: item,
      tr: _truncateAmount(amount),
      bl: `${activeWallet === seller ? "Sold" : "Bought"} on ${snakeToTitleCase(
        source
      )}`,
      icon: (
        <TransactionListItemIconNft
          mint={transaction.nfts?.[0] ?? undefined}
          size={44}
        />
      ),
    };
  } catch (err) {
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
      tl: `${entries[0][1]} -> ${entries[1][1]}`,
      tr: `+${_truncateAmount(items[1])}`,
      br: `-${_truncateAmount(items[0])}`,
      icon: (
        <TransactionListItemIconSwap
          size={44}
          symbols={[entries[0][1], entries[1][1]]}
        />
      ),
    };
  } catch {
    return null;
  }
}

/**
 * Parses the description string for a transfer transaction.
 * @param {string} activeWallet
 * @param {string} description
 * @returns {(ParseTransactionDetails | null)}
 * @example "EcxjN4mea6Ah9WSqZhLtSJJCZcxY73Vaz6UVHFZZ5Ttz transferred 0.1 SOL to 47iecF4gWQYrGMLh9gM3iuQFgb1581gThgfRw69S55T8"
 */
function _parseTransferDescription(
  activeWallet: string,
  description: string
): ParseTransactionDetails | null {
  try {
    const [sender, base] = description.split(" transferred ");
    const [amount, to] = base.split(" to ");
    const action = sender === activeWallet ? "Sent" : "Received";
    return {
      tl: action,
      tr: `${action === "Sent" ? "-" : "+"}${_truncateAmount(amount)}`,
      bl:
        action === "Sent"
          ? `To: ${walletAddressDisplay(to)}`
          : `From: ${walletAddressDisplay(sender)}`,
      icon: (
        <TransactionListItemIconTransfer
          size={44}
          symbol={amount.split(" ")[1]}
        />
      ),
    };
  } catch {
    return null;
  }
}

/**
 * Parses a transaction object for details about a program upgrade.
 * @param {Partial<Transaction>} transaction
 * @returns {ParseTransactionDetails}
 */
function _parseUpgradeProgramTransaction(
  transaction: Partial<Transaction>
): ParseTransactionDetails {
  return {
    tl: "Program Upgrade",
    tr: "",
    bl: transaction.source ? snakeToTitleCase(transaction.source) : undefined,
  };
}

/**
 * Parse out the float amount of tokens and truncate to the argued decimals.
 * @param {string} val
 * @param {number} [decimals]
 * @returns {string}
 */
function _truncateAmount(val: string, decimals?: number): string {
  try {
    const [numStr, ...others] = val.split(" ");
    if (!numStr.includes(".")) {
      return val;
    }

    const num = parseFloat(numStr);
    return `${num.toFixed(decimals ?? 5).replace(/0+$/, "")} ${others.join(
      " "
    )}`;
  } catch {
    return val;
  }
}
