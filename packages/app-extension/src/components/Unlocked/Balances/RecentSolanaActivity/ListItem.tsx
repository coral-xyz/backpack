import { isFirstLastListItemStyle } from "@coral-xyz/react-common";
import { useSplTokenRegistry } from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import {
  ArrowDownwardRounded,
  Check,
  ClearRounded,
  SendRounded,
  WhatshotRounded,
} from "@mui/icons-material";
import { ListItem, Typography } from "@mui/material";
import type { TokenInfo } from "@solana/spl-token-registry";

import {
  getTransactionCaption,
  getTransactionTitle,
  getTruncatedAddress,
  isNFTTransaction,
  isUserTxnSender,
} from "./detail-parser";
import type { HeliusParsedTransaction } from "./types";
import { heliusTransactionTypes } from "./types";

const useStyles = styles((theme) => ({
  recentActivityListItemIconContainer: {
    width: "44px",
    height: "44px",
    borderRadius: "22px",
    marginRight: "12px",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
  },
  recentActivityListItemIconDefault: {
    color: theme.custom.colors.alpha,
    marginLeft: "auto",
    marginRight: "auto",
  },
  recentActivityListItemIconPositive: {
    color: theme.custom.colors.positive,
    marginLeft: "auto",
    marginRight: "auto",
  },
  recentActivityListItemIconNegative: {
    color: theme.custom.colors.negative,
    marginLeft: "auto",
    marginRight: "auto",
  },
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
  const tokenRegistry = useSplTokenRegistry();
  let tokenData: (TokenInfo | undefined)[] = [];

  // add appropriate metadata
  if (transaction?.tokenTransfers?.length > 0)
    transaction?.tokenTransfers?.map((transfer: any) => {
      if (transfer?.mint && tokenRegistry.get(transfer?.mint)) {
        tokenData.push(tokenRegistry.get(transfer?.mint));
      }
    });

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
          : `solid 1pt ${theme.custom.colors.border}`,
        ...isFirstLastListItemStyle(isFirst, isLast, 12),
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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {RecentActivityListItemData(transaction, tokenData)}
          <div></div>
        </div>
      </div>
    </ListItem>
  );
}

// Controls left icon on 'Transactions' list
function RecentActivityListItemIcon(
  transaction: HeliusParsedTransaction,
  tokenData: (TokenInfo | undefined)[]
): JSX.Element {
  const classes = useStyles();

  // SWAP token icon -> token icon
  if (transaction.type === heliusTransactionTypes.swap) {
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          style={{
            borderRadius: "50%",
            width: "24px",
            height: "24px",
            marginRight: "10px",
            marginBottom: "15px",
            zIndex: "10",
          }}
          src={tokenData[0] && tokenData[0]?.logoURI}
        />
        <img
          style={{
            borderRadius: "50%",
            width: "24px",
            height: "24px",
            marginRight: "15px",
            marginLeft: "-15px",
          }}
          src={tokenData[1] && tokenData[1]?.logoURI}
        />
      </div>
    );
  }

  // if NFT url available, display it
  if (
    isNFTTransaction(transaction) &&
    transaction?.metadata?.offChainData?.image
  ) {
    return (
      <img
        style={{
          borderRadius: "4px",
          width: "44px",
          height: "44px",
          marginRight: "15px",
        }}
        src={transaction?.metadata?.offChainData?.image}
      />
    );
  }

  // TRANSFER, display token logo if available, otherwise appropriate sent/recieved icon
  if (
    transaction.type === heliusTransactionTypes.transfer ||
    transaction.type === heliusTransactionTypes.unknown
  ) {
    if (tokenData[0]?.logoURI) {
      return (
        <img
          style={{
            borderRadius: "4px",
            width: "44px",
            height: "44px",
            marginRight: "15px",
          }}
          src={tokenData[0]?.logoURI}
        />
      );
    }

    // USER === SENDER
    if (isUserTxnSender(transaction)) {
      return (
        <div className={classes.recentActivityListItemIconContainer}>
          <SendRounded className={classes.recentActivityListItemIconDefault} />
        </div>
      );

      // USER === RECEIVER
    } else if (isUserTxnSender(transaction) === false) {
      return (
        <div className={classes.recentActivityListItemIconContainer}>
          <ArrowDownwardRounded
            className={classes.recentActivityListItemIconDefault}
          />
        </div>
      );
    }
  }

  // FAILURE
  if (transaction?.transactionError) {
    return (
      <div className={classes.recentActivityListItemIconContainer}>
        <ClearRounded className={classes.recentActivityListItemIconNegative} />
      </div>
    );
  }
  // BURN
  if (transaction?.type === heliusTransactionTypes.burn) {
    return (
      <div className={classes.recentActivityListItemIconContainer}>
        <WhatshotRounded
          className={classes.recentActivityListItemIconNegative}
        />
      </div>
    );
  }
  // default green check
  return (
    <div className={classes.recentActivityListItemIconContainer}>
      <Check className={classes.recentActivityListItemIconPositive} />
    </div>
  );
}

// Controls data displayed on right side of 'Transactions' list
function RecentActivityListItemData(
  transaction: HeliusParsedTransaction,
  tokenData: (TokenInfo | undefined)[]
): JSX.Element {
  const theme = useCustomTheme();

  if (transaction.type === heliusTransactionTypes.swap) {
    return (
      <>
        <div
          style={{
            fontSize: "16px",
            color: theme.custom.colors.positive,
            lineHeight: "24px",
          }}
        >
          +{" "}
          {new Number(transaction?.description?.split(" ")[5]).toFixed(2) +
            " " +
            tokenData[1]?.symbol ||
            getTruncatedAddress(transaction?.tokenTransfers?.[0]?.mint)}
        </div>
        <div
          style={{
            fontSize: "14px",
            color: theme.custom.colors.secondary,
            lineHeight: "20px",
          }}
        >
          -{" "}
          {new Number(transaction?.description?.split(" ")[2]).toFixed(2) +
            " " +
            tokenData[0]?.symbol ||
            getTruncatedAddress(transaction?.tokenTransfers?.[1]?.mint)}
        </div>
      </>
    );
  }
  // BURN
  if (transaction?.type === heliusTransactionTypes.burn) {
    return (
      <div
        style={{
          fontSize: "16px",
          color: theme.custom.colors.secondary,
          lineHeight: "24px",
        }}
      >
        {transaction?.tokenTransfers[0]?.tokenAmount}
      </div>
    );
  }

  // finish
  if (isNFTTransaction(transaction)) {
    return <div></div>;
  }

  // TRANSFER, display token logo if available, otherwise appropriate sent/recieved icon
  if (
    transaction.type === heliusTransactionTypes.transfer ||
    transaction.type === heliusTransactionTypes.unknown
  ) {
    // USER === SENDER
    if (isUserTxnSender(transaction)) {
      return (
        <div
          style={{
            fontSize: "16px",
            color: theme.custom.colors.negative,
            lineHeight: "24px",
          }}
        >
          -{" "}
          {(new Number(
            transaction?.tokenTransfers?.[0]?.tokenAmount.toFixed(5)
          ) || new Number(transaction?.description?.split(" ")[5]).toFixed(3)) +
            " " +
            (tokenData[0]?.symbol || "")}
        </div>
      );

      // USER === RECEIVER
    } else if (isUserTxnSender(transaction) === false) {
      return (
        <div
          style={{
            fontSize: "16px",
            color: theme.custom.colors.positive,
            lineHeight: "24px",
          }}
        >
          +{" "}
          {(new Number(
            transaction?.tokenTransfers?.[0]?.tokenAmount.toFixed(5)
          ) || new Number(transaction?.description?.split(" ")[5]).toFixed(3)) +
            " " +
            (tokenData[0]?.symbol || "")}
        </div>
      );
    }
  }

  // FAILURE
  if (transaction?.transactionError) {
    return (
      <div
        style={{
          fontSize: "16px",
          color: theme.custom.colors.secondary,
          lineHeight: "24px",
        }}
      >
        Failed
      </div>
    );
  }

  // default
  return <div></div>;
}
