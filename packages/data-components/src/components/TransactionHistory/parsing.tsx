import type { ReactNode } from "react";
import { Suspense } from "react";
import {
  formatSnakeToTitleCase,
  formatTitleCase,
  formatWalletAddress,
} from "@coral-xyz/common";
import { StyledText, YStack } from "@coral-xyz/tamagui";
import { TransactionType } from "helius-sdk";

import {
  TransactionListItemIconBurn,
  TransactionListItemIconNft,
  TransactionListItemIconSwap,
  TransactionListItemIconTransfer,
} from "./TransactionListItemIcon";
import type { ResponseTransaction } from "./utils";

export type ParseTransactionDetails = {
  details: {
    amount?: string;
    headerText?: ReactNode;
    icon?: JSX.Element;
    item?: string;
    nft?: string;
    title: string;
    transferInfo?: {
      directionLabel: string;
      otherWallet: string;
    };
  };
  card: {
    br?: string;
    bl?: string;
    tl: string;
    tr: string;
    icon?: JSX.Element;
  };
};

/**
 * Natural language/semantic parsing of a transaction description string
 * to pull out and aggregate key details that can be displayed to users.
 * @export
 * @param {ResponseTransaction} transaction
 * @param {(str: string) => string} t
 * @returns {(ParseTransactionDetails)}
 */
export function parseTransaction(
  transaction: ResponseTransaction,
  t: (str: string) => string
): ParseTransactionDetails | null {
  try {
    const desc = transaction.description?.replace(/\.$/, "") ?? "";
    switch (transaction.type) {
      case TransactionType.BURN:
      case TransactionType.BURN_NFT: {
        return _parseNftBurnDescription(transaction, desc, t);
      }

      case TransactionType.CREATE_MERKLE_TREE: {
        return _parseCreateMerkleTreeDescription(desc, t);
      }

      case TransactionType.NFT_AUCTION_CREATED: {
        return _parseNftAuctionCreatedDescription(transaction, desc, t);
      }

      case TransactionType.NFT_BID: {
        return _parseNftBidDescription(transaction, desc, t);
      }

      case TransactionType.NFT_BID_CANCELLED: {
        return _parseNftBidCancelledDescription(transaction, desc, t);
      }

      case TransactionType.NFT_CANCEL_LISTING: {
        return _parseNftListingCanceledDescription(transaction, desc, t);
      }

      case TransactionType.NFT_LISTING: {
        return _parseNftListingDescription(transaction, desc, t);
      }

      case TransactionType.NFT_MINT: {
        return _parseNftMintDescription(transaction, desc, t);
      }

      case TransactionType.NFT_SALE: {
        return _parseNftSaleDescription(transaction, desc, t);
      }

      case TransactionType.STAKE_SOL:
      case TransactionType.UNSTAKE_SOL: {
        return _parseNativeStakingDescription(desc);
      }

      case TransactionType.STAKE_TOKEN:
      case TransactionType.UNSTAKE_TOKEN: {
        return _parseTokenStakingDescription(desc);
      }

      case TransactionType.SWAP: {
        return _parseSwapDescription(desc, t);
      }

      case TransactionType.TOKEN_MINT: {
        return _parseTokenMintDescription(desc, t);
      }

      case TransactionType.TRANSFER: {
        return _parseTransferDescription(transaction, desc, t);
      }

      case TransactionType.UPGRADE_PROGRAM_INSTRUCTION: {
        return _parseUpgradeProgramTransaction(transaction, t);
      }

      default: {
        return null;
      }
    }
  } catch {
    return null;
  }
}

/**
 * Parse the description string for a merkle tree creation transaction.
 * @param {string} description
 * @param {(key: string) => string} t
 * @returns {ParseTransactionDetails}
 * @example "<WALLET> created <AMOUNT> merkle trees"
 * @example "<WALLET> created a merkle tree"
 */
function _parseCreateMerkleTreeDescription(
  description: string,
  t: (key: string) => string
): ParseTransactionDetails {
  const base = description.split("created ")[1];
  let amount = "1";
  if (base[0] !== "a") {
    amount = base.split(" ")[0];
  }

  return {
    card: {
      tl: t("created_merkle_trees"),
      tr: amount,
    },
    details: {
      amount,
      title: t("created_merkle_trees"),
    },
  };
}

/**
 * Parse the description string for a native stake or unstake transaction.
 * @param {string} description
 * @returns {ParseTransactionDetails}
 * @example "<WALLET> <STAKED | UNSTAKED> <AMOUNT> SOL"
 */
function _parseNativeStakingDescription(
  description: string
): ParseTransactionDetails {
  const [_, action, amount] = description.split(" ");
  const title = `${formatTitleCase(action)} Native`;
  return {
    card: {
      tl: title,
      tr: _truncateAmount(`${amount} SOL`),
    },
    details: {
      amount: `${amount} SOL`,
      title,
    },
  };
}

/**
 * Parses the description string for an NFT auction creation transaction.
 * @param {ResponseTransaction} transaction
 * @param {string} description
 * @param {(key: string) => string} t
 * @returns {ParseTransactionDetails}
 * @example "<WALLET> created an auction for <TOKEN_NAME> on <SOURCE>"
 */
function _parseNftAuctionCreatedDescription(
  transaction: ResponseTransaction,
  description: string,
  t: (key: string) => string
): ParseTransactionDetails {
  const base = description.split("auction for ")[1];
  const [item, source] = base.split(" on ");
  const mint = transaction.nfts?.[0] ?? undefined;
  return {
    card: {
      tl: item,
      tr: "",
      bl: `${t("created_auction_on")} ${formatSnakeToTitleCase(source)}`,
      icon: <TransactionListItemIconNft mint={mint} size={44} />,
    },
    details: {
      item,
      nft: mint,
      title: t("create_nft_auction"),
    },
  };
}

/**
 * Parses the description string for an NFT bid transaction.
 * @param {ResponseTransaction} transaction
 * @param {string} description
 * @param {(key: string) => string} t
 * @returns {ParseTransactionDetails}
 * @example "<WALLET> bid <AMOUNT> SOL on <TOKEN_NAME> on <SOURCE>"
 */
function _parseNftBidDescription(
  transaction: ResponseTransaction,
  description: string,
  t: (key: string) => string
): ParseTransactionDetails {
  const base = description.split("bid ")[1];
  const [amount, item, source] = base.split(" on ").map((x) => x.trim());
  const mint = transaction.nfts?.[0] ?? undefined;
  return {
    card: {
      tl: item,
      tr: _truncateAmount(amount),
      bl: `${t("bid_on")} ${formatSnakeToTitleCase(source)}`,
      icon: <TransactionListItemIconNft mint={mint} size={44} />,
    },
    details: {
      amount,
      item,
      nft: mint,
      title: `${t("bid_on")} NFT`,
    },
  };
}

/**
 * Parses the description string for an NFT bid cancellation transaction.
 * @param {ResponseTransaction} transaction
 * @param {string} description
 * @param {(key: string) => string} t
 * @returns {ParseTransactionDetails}
 * @example "<WALLET> cancelled <AMOUNT> SOL bid for <TOKEN_NAME> on <SOURCE>"
 */
function _parseNftBidCancelledDescription(
  transaction: ResponseTransaction,
  description: string,
  t: (key: string) => string
): ParseTransactionDetails {
  const base = description.split("cancelled ")[1];
  const [amount, itemOther] = base.split(" bid for ");
  const [item, source] = itemOther.split(" on ");
  const mint = transaction.nfts?.[0] ?? undefined;
  return {
    card: {
      tl: item,
      tr: _truncateAmount(amount),
      bl: `${t("cancelled_bid_on")} ${formatSnakeToTitleCase(source)}`,
      icon: <TransactionListItemIconNft mint={mint} size={44} />,
    },
    details: {
      amount,
      item,
      nft: mint,
      title: `${t("cancelled_bid_on")} NFT`,
    },
  };
}

/**
 * Parses the description string for an NFT burn transaction.
 * @param {ResponseTransaction} transaction
 * @param {string} description
 * @param {(key: string) => string} t
 * @returns {ParseTransactionDetails}
 * @example "<WALLET> burned 1 Mad Lads Coin"
 */
function _parseNftBurnDescription(
  transaction: ResponseTransaction,
  description: string,
  t: (key: string) => string
): ParseTransactionDetails {
  const item = description.split("burned ")[1];
  const [amount, ...name] = item.split(" ");
  return {
    card: {
      tl: t("burned"),
      tr: `-${item}`,
      icon: <TransactionListItemIconBurn size={30} containerSize={44} />,
    },
    details: {
      amount,
      headerText: (
        <StyledText color="$redText" fontSize="$lg">{`-${amount}`}</StyledText>
      ),
      icon: <TransactionListItemIconBurn size={100} />,
      item: name.join(" "),
      nft: transaction.nfts?.[0] ?? undefined,
      title: `${t("burned")} NFT`,
    },
  };
}

/**
 * Parses the description string for an NFT listing cancellation transaction.
 * @param {ResponseTransaction} transaction
 * @param {string} description
 * @param {(key: string) => string} t
 * @returns {ParseTransactionDetails}
 * @example "<WALLET> cancelled 80 SOL listing for Mad Lads #2699 on TENSOR"
 */
function _parseNftListingCanceledDescription(
  transaction: ResponseTransaction,
  description: string,
  t: (key: string) => string
): ParseTransactionDetails {
  const base = description.split("cancelled ")[1];
  const [amount, itemOther] = base.split(" listing for ");
  const [item, source] = itemOther.split(" on ");
  const mint = transaction.nfts?.[0] ?? undefined;
  return {
    card: {
      tl: item,
      tr: _truncateAmount(amount),
      bl: `${t("cancelled_listing_on")} ${formatSnakeToTitleCase(source)}`,
      icon: <TransactionListItemIconNft mint={mint} size={44} />,
    },
    details: {
      amount,
      item,
      nft: mint,
      title: t("cancelled_nft_listing"),
    },
  };
}

/**
 * Parses the description string for an NFT listing transaction.
 * @param {ResponseTransaction} transaction
 * @param {string} description
 * @param {(key: string) => string} t
 * @returns {ParseTransactionDetails}
 * @example "<WALLET> listed Mad Lad #8811 for 131 SOL on MAGIC_EDEN."
 */
function _parseNftListingDescription(
  transaction: ResponseTransaction,
  description: string,
  t: (key: string) => string
): ParseTransactionDetails {
  const base = description.split("listed ")[1];
  const [item, other] = base.split(" for ");
  const [amount, source] = other.split(" on ");
  const mint = transaction.nfts?.[0] ?? undefined;
  return {
    card: {
      tl: item,
      tr: _truncateAmount(amount),
      bl: `${t("listed_on")} ${formatSnakeToTitleCase(source)}`,
      icon: <TransactionListItemIconNft mint={mint} size={44} />,
    },
    details: {
      amount,
      item,
      nft: mint,
      title: t("listed_nft"),
    },
  };
}

/**
 * Parses the description string for an NFT mint transaction.
 * @param {ResponseTransaction} transaction
 * @param {string} description
 * @param {(key: string) => string} t
 * @returns {ParseTransactionDetails}
 * @example "<WALLET> minted Mad Lads #6477 for 6.9114946 SOL on CANDY_MACHINE_V3"
 */
function _parseNftMintDescription(
  transaction: ResponseTransaction,
  description: string,
  t: (key: string) => string
): ParseTransactionDetails {
  const base = description.split("minted ")[1];
  const [item, amountOther] = base.split(" for ");
  const [amount, source] = amountOther.split(" on ");
  const mint = transaction.nfts?.[0] ?? undefined;
  return {
    card: {
      tl: item,
      tr: `-${_truncateAmount(amount)}`,
      bl: `${t("minted_on")} ${formatSnakeToTitleCase(source)}`,
      icon: <TransactionListItemIconNft mint={mint} size={44} />,
    },
    details: {
      amount,
      headerText: <StyledText fontSize="$lg">{amount}</StyledText>,
      item,
      nft: mint,
      title: `${t("minted")} NFT`,
    },
  };
}

/**
 * Parses the description string for an NFT sale transaction.
 * @param {ResponseTransaction} transaction
 * @param {string} description
 * @param {(key: string, args?: any) => string} t
 * @returns {ParseTransactionDetails}
 * @example "<WALLET> sold Mad Lad #3150 to <WALLET> for 131 SOL on MAGIC_EDEN"
 */
function _parseNftSaleDescription(
  transaction: ResponseTransaction,
  description: string,
  t: (key: string, args?: any) => string
): ParseTransactionDetails {
  const [seller, base] = description.split(" sold ");
  const [item, recipientOther] = base.split(" to ");
  const [_, amountOther] = recipientOther.split(" for ");
  const [amount, source] = amountOther.split(" on ");
  const mint = transaction.nfts?.[0] ?? undefined;
  const actionOn =
    transaction.address === seller
      ? t("sold_on_marketplace", {
          marketplace: formatSnakeToTitleCase(source),
        })
      : t("bought_on_marketplace", {
          marketplace: formatSnakeToTitleCase(source),
        });
  const actionTitle =
    transaction.address === seller ? t("sold_nft") : t("bought_nft");
  return {
    card: {
      tl: item,
      tr: _truncateAmount(amount),
      bl: actionOn,
      icon: <TransactionListItemIconNft mint={mint} size={44} />,
    },
    details: {
      amount,
      headerText: (
        <StyledText color="$greenText" fontSize="$lg">{`+${_truncateAmount(
          amount
        )}`}</StyledText>
      ),
      item,
      nft: mint,
      title: actionTitle,
    },
  };
}

/**
 * Parses the description string for a swap transaction.
 * @param {string} description
 * @param {(key: string) => string} t
 * @returns {ParseTransactionDetails}
 * @example "<WALLET> swapped 0.001 SOL for 0.022 USDC"
 */
function _parseSwapDescription(
  description: string,
  t: (key: string) => string
): ParseTransactionDetails {
  const items = description.split("swapped ")[1].split(" for ");
  const entries = items.map((i) => i.split(" ")) as [string, string][];

  const fromSymbol = entries[0]?.[1] ?? "";
  const toSymbol = entries[1]?.[1] ?? "";

  return {
    card: {
      tl: t("token_swap"),
      bl: `${fromSymbol} -> ${toSymbol}`,
      tr: `+${_truncateAmount(items[1])}`,
      br: `-${_truncateAmount(items[0])}`,
      icon: (
        <Suspense>
          <TransactionListItemIconSwap
            borderColor="$baseBackgroundL1"
            containerSize={44}
            symbols={[fromSymbol, toSymbol]}
          />
        </Suspense>
      ),
    },
    details: {
      headerText: (
        <YStack alignItems="center" gap={4}>
          <StyledText color="$redText" fontSize="$lg">{`-${_truncateAmount(
            items[0]
          )}`}</StyledText>
          <StyledText color="$greenText" fontSize="$lg">{`+${_truncateAmount(
            items[1]
          )}`}</StyledText>
        </YStack>
      ),
      icon: (
        <Suspense>
          <TransactionListItemIconSwap
            borderColor="$baseBackgroundL0"
            containerSize={100}
            symbols={[entries[0][1], entries[1][1]]}
          />
        </Suspense>
      ),
      title: `${t("swapped")} ${entries[0][1]} for ${entries[1][1]}`,
    },
  };
}

/**
 * Parses the description string for a token mint transaction.
 * @param {string} description
 * @param {(key: string) => string} t
 * @returns {ParseTransactionDetails}
 * @example "<WALLET> minted <AMOUNT> <TOKEN NAME>"
 */
function _parseTokenMintDescription(
  description: string,
  t: (key: string) => string
): ParseTransactionDetails {
  const [amount, ...rest] = description.split(" minted ")[1].split(" ");
  const name = rest.join(" ");
  return {
    card: {
      tl: name,
      bl: t("minted"),
      tr: _truncateAmount(amount),
      icon: (
        <Suspense>
          <TransactionListItemIconTransfer name={name} size={44} />
        </Suspense>
      ),
    },
    details: {
      amount,
      headerText: <StyledText fontSize="$lg">{name}</StyledText>,
      icon: (
        <Suspense>
          <TransactionListItemIconTransfer name={name} size={100} />
        </Suspense>
      ),
      title: t("token_mint"),
    },
  };
}

/**
 * Parses the description string for a token stake or unstake transaction.
 * @param {string} description
 * @returns {ParseTransactionDetails}
 * @example "<WALLET> <STAKED | UNSTAKED | CLAIMED> <AMOUNT> token on <SOURCE>"
 */
function _parseTokenStakingDescription(
  description: string
): ParseTransactionDetails {
  const [_, action, amount, ...remainder] = description.split(" ");
  const title = `${formatTitleCase(action)} Tokens`;
  const source = remainder[remainder.length - 1];
  return {
    card: {
      tl: title,
      bl: formatTitleCase(source),
      tr: _truncateAmount(amount),
    },
    details: {
      amount,
      title,
    },
  };
}

/**
 * Parses the description string for a transfer transaction.
 * @param {ResponseTransaction} transaction
 * @param {string} description
 * @param {(key: string) => string} t
 * @returns {ParseTransactionDetails}
 * @example "<WALLET> transferred 0.1 SOL to <WALLET>"
 */
function _parseTransferDescription(
  transaction: ResponseTransaction,
  description: string,
  t: (key: string) => string
): ParseTransactionDetails {
  const [sender, base] = description.split(" transferred ");
  const [amount, to] = base.split(" to ");
  const isSend = sender === transaction.address;
  const action = isSend ? t("sent") : t("received");
  const amt = `${isSend ? "-" : "+"}${_truncateAmount(amount)}`;
  return {
    card: {
      tl: action,
      tr: amt,
      bl: isSend
        ? `${t("to")}: ${formatWalletAddress(to)}`
        : `${t("from")}: ${formatWalletAddress(sender)}`,
      icon:
        transaction.nfts && transaction.nfts.length > 0 ? (
          <TransactionListItemIconNft size={44} mint={transaction.nfts[0]} />
        ) : (
          <Suspense>
            <TransactionListItemIconTransfer
              size={44}
              symbol={amount.split(" ")[1]}
            />
          </Suspense>
        ),
    },
    details: {
      amount,
      headerText: (
        <StyledText
          color={amt.startsWith("-") ? "$redText" : "$greenText"}
          fontSize="$lg"
        >
          {amt[0]}
          {amount}
        </StyledText>
      ),
      icon: (
        <Suspense>
          <TransactionListItemIconTransfer
            size={100}
            symbol={amount.split(" ")[1]}
          />
        </Suspense>
      ),
      nft: transaction.nfts?.[0],
      title: action,
      transferInfo: {
        directionLabel: isSend ? t("to") : t("from"),
        otherWallet: isSend ? to : sender,
      },
    },
  };
}

/**
 * Parses a transaction object for details about a program upgrade.
 * @param {ResponseTransaction} transaction
 * @param {(key: string) => string} t
 * @returns {ParseTransactionDetails}
 */
function _parseUpgradeProgramTransaction(
  transaction: ResponseTransaction,
  t: (key: string) => string
): ParseTransactionDetails {
  return {
    card: {
      tl: t("program_upgrade"),
      tr: "",
      bl: transaction.source
        ? formatSnakeToTitleCase(transaction.source)
        : undefined,
    },
    details: {
      // FIXME:
      title: t("program_upgraded"),
    },
  };
}

/**
 * Parse out the float amount of tokens and truncate to the argued decimals.
 * @param {string} val
 * @param {number} [decimals=5]
 * @returns {string}
 */
function _truncateAmount(val: string, decimals: number = 5): string {
  try {
    const [numStr, ...others] = val.split(" ");
    if (!numStr.includes(".")) {
      return val;
    }

    const _decimals = val.endsWith("USDC") ? 2 : decimals;

    const num = parseFloat(numStr);
    return `${num.toFixed(_decimals).replace(/\.?0+$/, "")} ${others.join(
      " "
    )}`;
  } catch {
    return val;
  }
}
