import type { CSSProperties } from "react";
import { SOL_LOGO_URI, UNKNOWN_ICON_SRC } from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownwardRounded";
import CheckIcon from "@mui/icons-material/CheckRounded";
import ClearIcon from "@mui/icons-material/ClearRounded";
import WhatshotIcon from "@mui/icons-material/WhatshotRounded";
import Skeleton from "@mui/material/Skeleton";
import { Source, TransactionType } from "helius-sdk";

import type { Transaction } from "../../../graphql/graphql";

const useStyles = styles(() => ({
  listItemBasicIconContainer: {
    width: "44px",
    height: "44px",
    borderRadius: "22px",
    marginRight: "12px",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
  },
}));

export function TransactionListItemIcon({
  loading,
  transaction,
}: {
  loading?: boolean;
  transaction: Partial<Transaction>;
}) {
  if (loading) {
    return <TransactionListItemIconLoader />;
  } else if (transaction.error) {
    return <TransactionListItemIconError />;
  } else if (transaction.type === TransactionType.SWAP) {
    return (
      // FIXME:
      <TransactionListItemIconSwap
        tokenLogos={[UNKNOWN_ICON_SRC, UNKNOWN_ICON_SRC]}
      />
    );
  } else if (transaction.type === TransactionType.TRANSFER) {
    if (transaction.source === Source.SYSTEM_PROGRAM) {
      return <TransactionListItemIconTransfer tokenLogo={SOL_LOGO_URI} />;
    }

    return <TransactionListItemIconReceived />;
  } else if (
    transaction.type === TransactionType.BURN ||
    transaction.type === TransactionType.BURN_NFT
  ) {
    return <TransactionListItemIconBurn />;
  }

  return <TransactionListItemIconDefault />;
}

function TransactionListItemIconError() {
  const classes = useStyles();
  const theme = useCustomTheme();
  return (
    <div className={classes.listItemBasicIconContainer}>
      <ClearIcon
        style={{
          color: theme.custom.colors.negative,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      />
    </div>
  );
}

function TransactionListItemIconBurn() {
  const classes = useStyles();
  const theme = useCustomTheme();
  return (
    <div className={classes.listItemBasicIconContainer}>
      <WhatshotIcon
        style={{
          color: theme.custom.colors.negative,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      />
    </div>
  );
}

function TransactionListItemIconDefault() {
  const classes = useStyles();
  const theme = useCustomTheme();
  return (
    <div className={classes.listItemBasicIconContainer}>
      <CheckIcon
        style={{
          color: theme.custom.colors.positive,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      />
    </div>
  );
}

function TransactionListItemIconLoader() {
  return (
    <Skeleton
      sx={{ mr: "15px" }}
      variant="rounded"
      height="44px"
      width="44px"
    />
  );
}

function TransactionListItemIconReceived() {
  const classes = useStyles();
  const theme = useCustomTheme();
  return (
    <div className={classes.listItemBasicIconContainer}>
      <ArrowDownwardIcon
        style={{
          color: theme.custom.colors.icon,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      />
    </div>
  );
}

function TransactionListItemIconSwap({
  tokenLogos,
}: {
  tokenLogos: [string, string];
}) {
  const commonStyle: CSSProperties = {
    borderRadius: "50%",
    height: "24px",
    width: "24px",
  };

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <img
        style={{
          ...commonStyle,
          marginRight: "10px",
          marginBottom: "15px",
          zIndex: "10",
        }}
        src={tokenLogos[0]}
      />
      <img
        style={{
          ...commonStyle,
          marginRight: "15px",
          marginLeft: "-15px",
        }}
        src={tokenLogos[1]}
      />
    </div>
  );
}

function TransactionListItemIconTransfer({ tokenLogo }: { tokenLogo: string }) {
  return (
    <img
      style={{
        borderRadius: "50%",
        width: "44px",
        height: "44px",
        marginRight: "15px",
      }}
      src={tokenLogo}
    />
  );
}
