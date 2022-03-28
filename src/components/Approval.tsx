import { useTheme, makeStyles, Typography, Button } from "@material-ui/core";
import { BottomCard } from "./Unlocked/Balances/Send";
import { useActiveWallet } from "../hooks/useWallet";
import { walletAddressDisplay } from "../components/common";
import { WithEphemeralNav } from "../components/Layout/NavEphemeral";
import { useApproveOrigin } from "../hooks/useKeyringStoreState";
import { getBackgroundResponseClient } from "../background/client";

const useStyles = makeStyles((theme: any) => ({
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
}));

export function Approval({ origin, onApproval }: any) {
  const approveOrigin = useApproveOrigin();
  const approve = async () => {
    await approveOrigin(origin);
    await onApproval();
  };
  return (
    <WithEphemeralNav title={"Connect"}>
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
          <BottomCard buttonLabel={"Approve"} onButtonClick={approve}>
            <AppLogo origin={origin} />
            <ConnectContent origin={origin} />
          </BottomCard>
        </div>
      </div>
    </WithEphemeralNav>
  );
}

export function ApproveTransaction({ origin, onCompletion }: any) {
  return (
    <div>
      APPROVE TRANSACTION HERE!
      <Button onClick={() => onCompletion(false)}>REJECT</Button>
      <Button onClick={() => onCompletion(true)}>APPROVE</Button>
    </div>
  );
}

function AppLogo({ origin }: any) {
  const theme = useTheme() as any;
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

function ConnectContent({ origin }: any) {
  const classes = useStyles();
  const url = new URL(origin);
  return (
    <div className={classes.contentContainer}>
      <Typography className={classes.contentTitle}>
        Connect Wallet to {url.hostname}
      </Typography>
      <Typography className={classes.contentSubTitle}>
        By approving, the app can
      </Typography>
      <Typography className={classes.contentBullet}>
        1.{" "}
        <span style={{ marginLeft: "8px" }}>
          View your wallet abalance and activity
        </span>
      </Typography>
      <Typography className={classes.contentBullet}>
        2.{" "}
        <span style={{ marginLeft: "8px" }}>
          Request approval for transactions
        </span>
      </Typography>
    </div>
  );
}
