import { Suspense, useEffect, useState } from "react";
import { Blockchain } from "@coral-xyz/common";
import {
  SOL_LOGO_URI,
  useSolanaCtx,
  useTokenMetadata,
  useUser,
} from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckIcon from "@mui/icons-material/Check";
import { Skeleton } from "@mui/material";
import { createStyles, makeStyles } from "@mui/styles";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

import { useChatContext } from "./ChatContext";

const useStyles = makeStyles((theme: any) =>
  createStyles({
    smallBtn: {
      padding: "2px 12px",
      borderRadius: 12,
      cursor: "pointer",
    },
    sendOuter: {
      background: theme.custom.colors.invertedPrimary,
      borderRadius: 16,
      marginTop: 4,
      padding: "12px 16px",
      color: theme.custom.colors.background,
      maxWidth: 250,
      minWidth: 220,
    },
    sendInner: {
      background: theme.custom.colors.invertedSecondary,
      borderRadius: 8,
      padding: "8px 16px",
      color: theme.custom.colors.background,
    },
  })
);

export const SimpleTransaction = ({
  txnSignature,
  message,
  remoteUserId,
}: {
  txnSignature: string;
  message: string;
  remoteUserId: string;
}) => {
  const { remoteUsername } = useChatContext();
  const [loading, setLoading] = useState(true);
  const classes = useStyles();
  const solanaCtx = useSolanaCtx();
  const [amount, setAmount] = useState(0);
  const [tokenAddress, setTokenAddress] = useState("");
  const { uuid } = useUser();

  const init = async () => {
    setLoading(true);
    try {
      const parsedTxn = await solanaCtx.connection.getParsedTransactions([
        txnSignature,
      ]);
      const transferIx = parsedTxn[0]?.transaction.message.instructions.find(
        (ix) => {
          return (
            //@ts-ignore
            ix?.parsed?.type === "transferChecked" ||
            //@ts-ignore
            ix?.parsed?.type === "transfer"
          );
        }
      );
      if (!transferIx) {
        return;
      }
      //@ts-ignore
      if (transferIx.parsed.info.mint) {
        //@ts-ignore
        setTokenAddress(transferIx.parsed.info.mint);
        //@ts-ignore
        setAmount(transferIx.parsed.info.tokenAmount.uiAmount);
      } else {
        // @ts-ignore
        setAmount(transferIx?.parsed?.info?.lamports / LAMPORTS_PER_SOL);
      }
      setLoading(false);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    init();
  }, [txnSignature]);

  return (
    <div className={classes.sendOuter}>
      <div>
        <div style={{ marginBottom: 5, marginTop: 5 }}>
          {" "}
          {remoteUserId !== uuid
            ? "You Received"
            : `You sent @${remoteUsername}`}
        </div>
        {!loading ? (
          <>
            {tokenAddress ? (
              <ParsedTransactionWithSuspense
                message={message}
                tokenAddress={tokenAddress}
                amount={amount}
              />
            ) : null}
            {!tokenAddress ? (
              <ParsedSolTransaction message={message} amount={amount} />
            ) : null}
          </>
        ) : null}
        {loading ? <TxSkeleton /> : null}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 10,
          }}
        >
          <div
            className={classes.smallBtn}
            style={{
              display: "flex",
              padding: "3px 7px",
              fontSize: 12,
              background: "rgba(17, 168, 0, 0.2)",
              color: "#52D24C",
            }}
          >
            <CheckIcon style={{ fontSize: 16 }} />
            <div style={{ marginLeft: 4, marginRight: 4, fontSize: 12 }}>
              Paid
            </div>
          </div>
          <div
            onClick={() => {
              window.open(
                `https://explorer.solana.com/tx/${txnSignature}`,
                "mywindow"
              );
            }}
            style={{ display: "flex", cursor: "pointer", marginTop: 3 }}
          >
            <div>View</div>{" "}
            <ArrowForwardIcon
              style={{ fontSize: 15, marginLeft: 2, marginTop: 2 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

function ParsedTransactionWithSuspense({ tokenAddress, amount, message }) {
  return (
    <Suspense fallback={<TxSkeleton />}>
      <ParsedTransaction
        tokenAddress={tokenAddress}
        amount={amount}
        message={message}
      />
    </Suspense>
  );
}

function TxSkeleton() {
  const theme = useCustomTheme();
  return (
    <div
      onClick={() => {}}
      style={{
        paddingLeft: "19px",
        paddingRight: "19px",
        paddingTop: "10px",
        paddingBottom: "10px",
        display: "flex",
        backgroundColor: theme.custom.colors.invertedSecondary,
        marginBottom: 10,
      }}
    >
      <div
        style={{
          height: "100%",
          width: "100%",
          alignItems: "center",
        }}
      >
        <div>
          <Skeleton width="40%" height={40} style={{ marginTop: "-6px" }} />
        </div>

        <div style={{ width: 90 }}>
          <Skeleton width="80%" height={20} style={{ marginTop: "-6px" }} />
        </div>

        <div style={{ width: "100%", display: "flex" }}>
          <Skeleton
            variant="circular"
            width={15}
            height={15}
            style={{ marginRight: 5 }}
          />
          <Skeleton width="70%" height={20} style={{ marginTop: "-3px" }} />
        </div>
      </div>
    </div>
  );
}

function ParsedTransaction({ tokenAddress, amount, message }) {
  const tokenData = useTokenMetadata({
    mintAddress: tokenAddress,
    blockchain: Blockchain.SOLANA,
  });
  const theme = useCustomTheme();
  const classes = useStyles();
  return (
    <div>
      <div className={classes.sendInner}>
        <div style={{ fontSize: 30, display: "flex" }}>
          <div>{amount.toFixed(2)}</div>
        </div>
        {message ? (
          <div style={{ marginBottom: 10, color: theme.custom.colors.icon }}>
            {message}
          </div>
        ) : null}
        <div
          style={{
            display: "flex",
            marginTop: 3,
            color: theme.custom.colors.icon,
          }}
        >
          <img
            src={`https://swr.xnfts.dev/nft-data/metaplex-nft/${tokenAddress}/image`}
            style={{
              width: 20,
              height: 20,
              borderRadius: 8,
              marginRight: 5,
            }}
          />{" "}
          {/* @ts-ignore */}
          <div>{tokenData?.ticker} on SOLANA</div>
        </div>
      </div>
    </div>
  );
}

function ParsedSolTransaction({ amount, message }) {
  const classes = useStyles();
  const theme = useCustomTheme();
  return (
    <div>
      <div className={classes.sendInner}>
        <div style={{ fontSize: 30, display: "flex" }}>
          <div>{amount.toFixed(2)}</div>
        </div>
        {message ? (
          <div style={{ marginBottom: 10, color: theme.custom.colors.icon }}>
            {message}
          </div>
        ) : null}
        <div
          style={{
            display: "flex",
            marginTop: 3,
            color: theme.custom.colors.icon,
          }}
        >
          <img
            src={SOL_LOGO_URI}
            style={{
              width: 20,
              height: 20,
              borderRadius: 8,
              marginRight: 5,
            }}
          />{" "}
          <div>SOL on SOLANA</div>
        </div>
      </div>
    </div>
  );
}
