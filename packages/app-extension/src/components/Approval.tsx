import { useEffect } from "react";
import * as bs58 from "bs58";
import { Message } from "@solana/web3.js";
import { Typography } from "@mui/material";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { useActiveWallet } from "@coral-xyz/recoil";
import { BottomCard } from "./Unlocked/Balances/TokensWidget/Send";
import { walletAddressDisplay } from "../components/common";
import { WithEphemeralNav } from "../components/common/Layout/NavEphemeral";

const useStyles = styles((theme) => ({
  activeWallet: {
    color: theme.custom.colors.secondary,
    fontSize: "12px",
    lineHeight: "24px",
    fontWeight: 500,
    marginTop: "12px",
    textAlign: "center",
  },
  contentContainer: {
    position: "absolute",
    marginTop: 150,
    paddingLeft: "24px",
    paddingRight: "24px",
    width: "100%",
  },
  contentTitle: {
    fontSize: "18px",
    lineHeight: "24px",
    fontWeight: 500,
    color: theme.custom.colors.fontColor,
  },
  contentSubTitle: {
    marginTop: "16px",
    color: theme.custom.colors.secondary,
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 500,
  },
  contentBullet: {
    marginTop: "12px",
    fontSize: "12px",
    lineHeight: "16px",
    color: theme.custom.colors.fontColor,
    fontWeight: 500,
    marginLeft: "6px",
  },
  txChangesRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  txChangesRowLeft: {
    color: theme.custom.colors.secondary,
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 500,
  },
  txChangesRowRight: {
    color: theme.custom.colors.fontColor,
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 500,
  },
  approveMessageData: {
    textAlign: "center",
    color: theme.custom.colors.fontColor,
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 500,
  },
}));

export function ApproveTransaction({ tx, origin, onCompletion }: any) {
  const classes = useStyles();
  useEffect(() => {
    const msg = Message.from(bs58.decode(tx));
    console.log("got msg", msg);
    // TODO: Fetch all IDLS for each program and decode ix name and description.
  }, [tx]);

  const approve = async () => {
    onCompletion(true);
  };
  const onReject = async () => {
    onCompletion(false);
  };
  const rows = [
    { left: "Network", right: "Solana" },
    { left: "Network Fee", right: "- SOL" },
  ];

  return (
    <WithApproval
      title={"Approve Transaction"}
      onApproval={approve}
      onReject={onReject}
      origin={origin}
    >
      <Typography
        className={classes.contentTitle}
        style={{ marginBottom: "16px" }}
      >
        Transaction Changes
      </Typography>
      {rows.map((r) => (
        <div className={classes.txChangesRow}>
          <Typography className={classes.txChangesRowLeft}>{r.left}</Typography>
          <Typography className={classes.txChangesRowRight}>
            {r.right}
          </Typography>
        </div>
      ))}
    </WithApproval>
  );
}

export function ApproveMessage({ message, origin, onCompletion }: any) {
  const classes = useStyles();
  const approve = async () => {
    onCompletion(true);
  };
  const onReject = async () => {
    onCompletion(false);
  };
  return (
    <WithApproval
      title={"Approve Message"}
      onApproval={approve}
      onReject={onReject}
      origin={origin}
    >
      <Typography
        className={classes.contentTitle}
        style={{ marginBottom: "16px" }}
      >
        Message
      </Typography>
      <Typography className={classes.approveMessageData}>{message}</Typography>
    </WithApproval>
  );
}

function WithApproval({ title, onApproval, onReject, origin, children }: any) {
  const classes = useStyles();
  return (
    <WithEphemeralNav title={title}>
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            flex: 1,
          }}
        >
          <ActiveWallet />
        </div>
        <div
          style={{
            height: "439px",
          }}
        >
          <BottomCard
            buttonLabel={"Approve"}
            onButtonClick={onApproval}
            onCancelButtonClick={onReject}
            cancelButtonLabel={"Cancel"}
          >
            <AppLogo origin={origin} />
            <div className={classes.contentContainer}>{children}</div>
          </BottomCard>
        </div>
      </div>
    </WithEphemeralNav>
  );
}

function AppLogo({ origin }: any) {
  const theme = useCustomTheme();
  return (
    <div
      style={{
        position: "absolute",
        top: 48,
        left: 0,
        right: 0,
        marginLeft: "auto",
        marginRight: "auto",
        width: "128px",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "8px",
          height: "128px",
          width: "128px",
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <Typography style={{ textAlign: "center" }}>Logo</Typography>
      </div>
      <Typography
        style={{
          color: theme.custom.colors.secondary,
          lineHeight: "24px",
          fontSize: "12px",
          fontWeight: 500,
          marginTop: "12px",
          textAlign: "center",
        }}
      >
        {origin}
      </Typography>
    </div>
  );
}

function ActiveWallet() {
  const classes = useStyles();
  const activeWallet = useActiveWallet();
  return (
    <Typography className={classes.activeWallet}>
      {activeWallet.name} ({walletAddressDisplay(activeWallet.publicKey)})
    </Typography>
  );
}
