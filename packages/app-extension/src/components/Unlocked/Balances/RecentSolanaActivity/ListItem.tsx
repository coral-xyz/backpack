import { useMemo } from "react";
import { isFirstLastListItemStyle } from "@coral-xyz/react-common";
import {
  metadataForRecentSolanaTransaction,
  useActiveWallet,
} from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { ListItem, Skeleton, Typography } from "@mui/material";
import type { TokenInfo } from "@solana/spl-token-registry";
import { Source, TransactionType } from "helius-sdk/dist/types";
import { useRecoilValueLoadable } from "recoil";

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
  setMetadata,
  setTransactionDetail,
}: any) {
  const classes = useStyles();
  const theme = useCustomTheme();
  const { contents, state } = useRecoilValueLoadable(
    metadataForRecentSolanaTransaction({ transaction })
  );
  const activeWallet = useActiveWallet();
  const tokenData = getTokenData(transaction);
  const metadata = (state === "hasValue" && contents) || undefined;

  const onClick = () => {
    setMetadata(metadata);
    setTransactionDetail(transaction);
  };

  const transactionTitle = getTransactionTitle(
    activeWallet,
    transaction,
    metadata
  );

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
            <RecentActivityListItemIcon
              loading={state === "loading"}
              transaction={transaction}
              tokenData={tokenData}
              metadata={metadata}
            />
          </div>
          <div>
            <Typography className={classes.title}>
              {transactionTitle}
            </Typography>
            <Typography className={classes.caption}>
              {getTransactionCaption(
                activeWallet,
                transaction,
                tokenData,
                metadata
              )}
            </Typography>
          </div>
        </div>
        <div className={classes.lineDataWrapper}>
          <RecentActivityListItemData
            transaction={transaction}
            tokenData={tokenData}
            metadata={metadata}
          />
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
function RecentActivityListItemIcon({
  loading,
  transaction,
  tokenData,
  metadata,
}: {
  loading: boolean;
  transaction: HeliusParsedTransaction;
  tokenData: (TokenInfo | undefined)[];
  metadata?: any;
}) {
  const activeWallet = useActiveWallet();
  if (loading) {
    return (
      <Skeleton
        sx={{ mr: "15px" }}
        variant="rounded"
        height="44px"
        width="44px"
      />
    );
  }

  if (transaction?.transactionError) return <ListItemIcons.ERROR />;

  if (transaction.type === TransactionType.SWAP) {
    return (
      <ListItemIcons.SWAP
        tokenLogoOne={tokenData[0]?.logoURI}
        tokenLogoTwo={tokenData[1]?.logoURI}
      />
    );
  }

  // if NFT url available, display it. Check on-chain data first
  const nftImage = undefined;
  // TODO: metadata?.onChaindata?.data?.uri || metadata?.offChainData?.image;

  if (isNFTTransaction(transaction) && nftImage) {
    return <ListItemIcons.NFT nftUrl={nftImage} />;
  }

  if (transaction.type === TransactionType.TRANSFER) {
    //SOL transfer
    if (transaction.source === Source.SYSTEM_PROGRAM) {
      return <ListItemIcons.SOL />;
    }

    // other SPL token Transfer. Check tokenRegistry first, then Helius metadata
    const transferIcon = undefined;
    // FIXME: tokenData[0]?.logoURI ||
    // metadata?.onChaindata?.data?.uri ||
    // metadata?.offChainData?.image;

    if (transferIcon)
      return <ListItemIcons.TRANSFER tokenLogo={transferIcon} />;

    // if it is an NFT transfer and no NFT image was found above, show default Icon
    if (transaction?.tokenTransfers?.[0]?.tokenStandard === "NonFungible") {
      return <ListItemIcons.NFT_DEFAULT />;
    }
    // default
    if (isUserTxnSender(transaction, activeWallet))
      return <ListItemIcons.SENT />;
    return <ListItemIcons.RECEIVED />;
  }

  if (
    transaction?.type === TransactionType.BURN ||
    transaction?.type === TransactionType.BURN_NFT
  )
    return <ListItemIcons.BURN />;

  return <ListItemIcons.DEFAULT />;
}

// Controls data displayed on right side of 'Transactions' list
function RecentActivityListItemData({
  transaction,
  tokenData,
  metadata,
}: {
  transaction: HeliusParsedTransaction;
  tokenData: (TokenInfo | undefined)[];
  metadata?: any;
}) {
  const activeWallet = useActiveWallet();
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
  if (
    transaction?.type === TransactionType.BURN ||
    transaction?.type === TransactionType.BURN_NFT
  ) {
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
    if (isUserTxnSender(transaction, activeWallet)) {
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
              metadata?.onChainMetadata?.metadata?.data?.symbol ||
              metadata?.offChainData?.symbol ||
              "")}
        </div>
      );

      // USER === RECEIVER
    } else if (isUserTxnSender(transaction, activeWallet) === false) {
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
              metadata?.onChainMetadata?.metadata?.data?.symbol ||
              metadata?.offChainData?.symbol ||
              "")}
        </div>
      );
    }
  }

  // default
  return <div></div>;
}
