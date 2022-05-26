import { useMemo } from "react";
import * as bs58 from "bs58";
import { Transaction, Message } from "@solana/web3.js";
import {
  getBackgroundClient,
  useTransactionRequest,
  useAllPlugins,
  useActiveWallet,
} from "@200ms/recoil";
import {
  CHANNEL_PLUGIN_EXTENSION_NOTIFICATION_RESPONSE,
  PLUGIN_OUT_RESPONSE_NOTIFICATION_SHOW_TRANSACTION_APPROVAL,
  UI_RPC_METHOD_SIGN_TRANSACTION,
  UI_RPC_METHOD_SIGN_AND_SEND_TRANSACTION,
} from "@200ms/common";
import { Plugin } from "@200ms/anchor-ui-renderer";
import { makeStyles, useTheme, Typography } from "@material-ui/core";
import { walletAddressDisplay } from "../common";
import { Scrollbar } from "../Layout/Scrollbar";
import { WithMiniDrawer } from "../Layout/Drawer";
import { BottomCard } from "../Unlocked/Balances/Send";

const useStyles = makeStyles((theme: any) => ({
  confirmRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  confirmRowLabelLeft: {
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 500,
    color: theme.custom.colors.secondary,
  },
  confirmRowLabelRight: {
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 500,
    color: theme.custom.colors.fontColor,
  },
}));

export function ApproveTransactionRequest() {
  const [request, setRequest] = useTransactionRequest();
  const plugins = useAllPlugins();
  const { publicKey } = useActiveWallet();
  const plugin = request
    ? plugins.find((p) => p.iframeUrl === request.pluginUrl)
    : undefined;

  // TODO: this check shouldn't be necessary.
  if (request && publicKey.toString() !== request.publicKey) {
    throw new Error("invariant violation");
  }

  const onConfirm = async () => {
    if (!request) {
      throw new Error("request not found");
    }
    const background = getBackgroundClient();

    let signature;
    if (request!.kind === "sign-tx") {
      signature = await background.request({
        method: UI_RPC_METHOD_SIGN_TRANSACTION,
        params: [request.data, publicKey.toString()],
      });
    } else {
      signature = await background.request({
        method: UI_RPC_METHOD_SIGN_AND_SEND_TRANSACTION,
        params: [request.data, publicKey.toString()],
      });
    }

    sendTransactionApprovalResponse(request, signature);
    setRequest(undefined);
  };

  const onReject = async () => {
    sendTransactionApprovalResponse(request, null);
    setRequest(undefined);
  };
  console.log("armani: request here", request, plugin);
  return (
    <WithMiniDrawer
      openDrawer={request !== undefined}
      setOpenDrawer={(open: boolean) => {
        if (!open) {
          setRequest(undefined);
        }
      }}
    >
      <BottomCard
        onButtonClick={onConfirm}
        buttonLabel={"Confirm"}
        cancelButton={true}
        onReject={onReject}
      >
        {request && plugin && (
          <div style={{ padding: "24px", height: "100%" }}>
            <Scrollbar>
              {request?.kind === "sign-tx" ? (
                <SignTransaction transaction={request?.data} plugin={plugin} />
              ) : request.kind === "sign-msg" ? (
                <SignMessage message={request?.data} plugin={plugin} />
              ) : (
                <SignAndSendTransaction
                  transaction={request?.data}
                  plugin={plugin}
                />
              )}
            </Scrollbar>
          </div>
        )}
      </BottomCard>
    </WithMiniDrawer>
  );
}

function SignAndSendTransaction({ transaction, plugin }: any) {
  return <SignTransaction transaction={transaction} plugin={plugin} />;
}

function SignTransaction({
  transaction,
  plugin,
}: {
  transaction: string;
  plugin: Plugin;
}) {
  const theme = useTheme() as any;
  const classes = useStyles();
  const deserializedTx = useMemo(() => {
    if (!transaction) {
      return undefined;
    }
    return Transaction.populate(Message.from(bs58.decode(transaction!)));
  }, [transaction]);
  console.log("armani: here", deserializedTx);
  return (
    <>
      <Typography
        style={{
          color: theme.custom.colors.fontColor,
          fontWeight: 500,
          fontSize: "18px",
          lineHeight: "24px",
        }}
      >
        Confirm Transaction
      </Typography>
      <div
        style={{
          marginTop: "18px",
        }}
      >
        {plugin && (
          <div className={classes.confirmRow}>
            <Typography className={classes.confirmRowLabelLeft}>
              xNFT
            </Typography>
            <Typography className={classes.confirmRowLabelRight}>
              {plugin.iframeUrl}
            </Typography>
          </div>
        )}
        <div className={classes.confirmRow}>
          <Typography className={classes.confirmRowLabelLeft}>
            Network
          </Typography>
          <Typography className={classes.confirmRowLabelRight}>
            Solana
          </Typography>
        </div>
        <div className={classes.confirmRow}>
          <Typography className={classes.confirmRowLabelLeft}>
            Network Fee
          </Typography>
          <Typography className={classes.confirmRowLabelRight}>
            - SOL
          </Typography>
        </div>
        <div className={classes.confirmRow}>
          <Typography className={classes.confirmRowLabelLeft}>
            Sending from
          </Typography>
          <Typography className={classes.confirmRowLabelRight}>
            {walletAddressDisplay(deserializedTx!.feePayer!)}
          </Typography>
        </div>
        <Typography
          className={classes.confirmRowLabelRight}
          style={{
            wordBreak: "break-all",
          }}
        >
          {transaction}
        </Typography>
      </div>
    </>
  );
}

function SignMessage({ message }: any) {
  // todo
  return <></>;
}

function sendTransactionApprovalResponse(
  request: any,
  signature: string | null
) {
  const event = {
    type: CHANNEL_PLUGIN_EXTENSION_NOTIFICATION_RESPONSE,
    detail: {
      name: PLUGIN_OUT_RESPONSE_NOTIFICATION_SHOW_TRANSACTION_APPROVAL,
      data: {
        request,
        signature,
      },
    },
  };
  window.postMessage(event, "*");
}
