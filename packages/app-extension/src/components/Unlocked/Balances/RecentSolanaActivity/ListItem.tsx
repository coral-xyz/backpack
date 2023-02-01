import { isFirstLastListItemStyle } from "@coral-xyz/react-common";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { ListItem, Typography } from "@mui/material";
import type { TokenInfo } from "@solana/spl-token-registry";
import { Source, TransactionType } from "helius-sdk/dist/types";

import {
  getTokenData,
  getTransactionCaption,
  getTransactionTitle,
  getTruncatedAddress,
  isNFTTransaction,
  isUserTxnSender,
} from "./detail-parser";
import { ListItemIcons } from "./Icons";
import type { HeliusParsedTransaction } from "./types";

// TODO: clean this up. lot of duplicate styling, more efficient way to write this.
const useStyles = styles((theme) => ({
  title: {
    color: theme.custom.colors.fontColor,
    fontSize: "16px",
    fontWeight: 500,
    lineHeight: "24px",
  },
  caption: {
    color: theme.custom.colors.secondary,
    fontSize: "12px",
    fontWeight: 500,
    lineHeight: "24px",
    whiteSpace: "nowrap",
    overflow: "hidden",
  },
  textReceived: {
    fontSize: "16px",
    color: theme.custom.colors.positive,
    lineHeight: "24px",
    textAlign: "end",
  },
  textSent: {
    fontSize: "16px",
    color: theme.custom.colors.negative,
    lineHeight: "24px",
    textAlign: "end",
  },
  textSecondary: {
    fontSize: "16px",
    color: theme.custom.colors.secondary,
    lineHeight: "24px",
    textAlign: "end",
  },
  lineDataWrapper: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
}));

export function SolanaTransactionListItem({
  transaction,
  isFirst,
  isLast,
  setTransactionDetail,
}: any) {
  const classes = useStyles();
  const theme = useCustomTheme();

  const tokenData = getTokenData(transaction);

  const onClick = () => {
    setTransactionDetail(transaction);
  };

  return (
    <ListItem
      button
      disableRipple
      onClick={onClick}
      style={{
        paddingLeft: "12px",
        paddingRight: "12px",
        paddingTop: "10px",
        paddingBottom: "10px",
        display: "flex",
        height: "68px",
        backgroundColor: theme.custom.colors.nav,
        borderBottom: isLast
          ? undefined
          : `solid 1pt ${theme.custom.colors.border1}`,
        ...isFirstLastListItemStyle(isFirst, isLast, 12),
        borderBottomLeftRadius: isLast ? "12px" : 0,
        borderBottomRightRadius: isLast ? "12px" : 0,
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div style={{ flex: 1, display: "flex" }}>
          <div className={classes.lineDataWrapper}>
            {RecentActivityListItemIcon(transaction, tokenData)}
          </div>
          <div>
            <Typography className={classes.title}>
              {getTransactionTitle(transaction)}
            </Typography>
            <Typography className={classes.caption}>
              {getTransactionCaption(transaction, tokenData)}
            </Typography>
          </div>
        </div>
        <div className={classes.lineDataWrapper}>
          {RecentActivityListItemData(transaction, tokenData)}
          <div></div>
        </div>
      </div>
    </ListItem>
  );
}

// Controls left icon on 'Transactions' list. Created in a way
//  that may be easily extended to further/future Helius types
// To add a new ruleset for helius parsed TXN type or source
// 1.) add desired icon to ListItemIcons in "./Icons";
// 2.) map txn to icon below
function RecentActivityListItemIcon(
  transaction: HeliusParsedTransaction,
  tokenData: (TokenInfo | undefined)[]
): JSX.Element {
  if (transaction?.transactionError) return ListItemIcons["ERROR"]();

  if (transaction.type === TransactionType.SWAP) {
    return ListItemIcons[TransactionType.SWAP](
      tokenData[0]?.logoURI,
      tokenData[1]?.logoURI
    );
  }

  // if NFT url available, display it. Check on-chain data first
  const nftImage =
    transaction?.metadata?.onChaindata?.data?.uri ||
    transaction?.metadata?.offChainData?.image;
  if (isNFTTransaction(transaction) && nftImage) {
    return ListItemIcons["NFT"](nftImage);
  }

  if (transaction.type === TransactionType.TRANSFER) {
    //SOL transfer
    if (transaction.source === Source.SYSTEM_PROGRAM) {
      return ListItemIcons["SOL"]();
    }
    // other SPL token Transfer. Check tokenRegistry first, then Helius metadata
    const transferIcon =
      tokenData[0]?.logoURI ||
      transaction?.metadata?.onChaindata?.data?.uri ||
      transaction?.metadata?.offChainData?.image;
    if (transferIcon)
      return ListItemIcons[TransactionType.TRANSFER](transferIcon);

    // if it is an NFT transfer and no NFT image was found above, show default Icon
    if (transaction?.tokenTransfers?.[0]?.tokenStandard === "NonFungible") {
      return ListItemIcons["NFT_DEFAULT"]();
    }
    // default
    if (isUserTxnSender(transaction)) return ListItemIcons["SENT"]();
    return ListItemIcons["RECEIVED"]();
  }

  if (transaction?.type === TransactionType.BURN)
    return ListItemIcons[TransactionType.BURN]();

  return ListItemIcons["DEFAULT"]();
}

// Controls data displayed on right side of 'Transactions' list
function RecentActivityListItemData(
  transaction: HeliusParsedTransaction,
  tokenData: (TokenInfo | undefined)[]
): JSX.Element {
  const classes = useStyles();

  // FAILURE
  if (transaction?.transactionError) {
    return <div className={classes.caption}>Failed</div>;
  }

  if (transaction.type === TransactionType.SWAP) {
    return (
      <>
        <div className={classes.textReceived}>
          {"+ " +
            transaction?.tokenTransfers?.[1]?.tokenAmount.toFixed(5) +
            " " +
            tokenData[1]?.symbol ||
            getTruncatedAddress(transaction?.tokenTransfers?.[1]?.mint)}
        </div>
        <div className={classes.textSecondary}>
          {"- " +
            transaction?.tokenTransfers[0]?.tokenAmount.toFixed(5) +
            " " +
            tokenData[0]?.symbol ||
            getTruncatedAddress(transaction?.tokenTransfers?.[0]?.mint)}
        </div>
      </>
    );
  }
  // BURN
  if (transaction?.type === TransactionType.BURN) {
    return (
      <div className={classes.textSecondary}>
        {transaction?.tokenTransfers[0]?.tokenAmount}
      </div>
    );
  }

  // finish
  if (isNFTTransaction(transaction)) {
    return <div></div>;
  }

  if (
    transaction.type === TransactionType.TRANSFER
    // || transaction.type === TransactionType.UNKNOWN
  ) {
    // USER === SENDER
    if (isUserTxnSender(transaction)) {
      // SOL Transfer
      if (transaction.source === Source.SYSTEM_PROGRAM) {
        return (
          <div className={classes.textSent}>
            - {transaction?.nativeTransfers[0]?.amount / 10 ** 9 + " SOL"}
          </div>
        );
      }
      return (
        <div className={classes.textSent}>
          -{" "}
          {new Number(
            transaction?.tokenTransfers?.[0]?.tokenAmount.toFixed(5)
          ) +
            " " +
            (tokenData[0]?.symbol ||
              transaction?.metadata?.onChaindata?.data?.symbol ||
              transaction?.metadata?.offChainData?.symbol ||
              "")}
        </div>
      );

      // USER === RECEIVER
    } else if (isUserTxnSender(transaction) === false) {
      // SOL Transfer
      if (transaction.source === Source.SYSTEM_PROGRAM) {
        return (
          <div className={classes.textReceived}>
            + {transaction?.nativeTransfers[0]?.amount / 10 ** 9 + " SOL"}
          </div>
        );
      }
      return (
        <div className={classes.textReceived}>
          +{" "}
          {new Number(
            transaction?.tokenTransfers?.[0]?.tokenAmount.toFixed(5)
          ) +
            " " +
            (tokenData[0]?.symbol ||
              transaction?.metadata?.onChaindata?.data?.symbol ||
              transaction?.metadata?.offChainData?.symbol ||
              "")}
        </div>
      );
    }
  }

  // default
  return <div></div>;
}
