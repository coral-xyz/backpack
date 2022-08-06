import { useMemo, useEffect, useState } from "react";
import * as bs58 from "bs58";
import { Transaction, Message } from "@solana/web3.js";
import {
  useBackgroundClient,
  useTransactionRequest,
  useActiveWallet,
  usePlugins,
} from "@coral-xyz/recoil";
import {
  UI_RPC_METHOD_SIGN_TRANSACTION,
  UI_RPC_METHOD_SIGN_AND_SEND_TRANSACTION,
} from "@coral-xyz/common";
import { Plugin } from "@coral-xyz/react-xnft-renderer";
import { Typography } from "@mui/material";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { walletAddressDisplay, PrimaryButton } from "../common";
import { Scrollbar } from "../common/Layout/Scrollbar";
import { ApproveTransactionDrawer } from "../common/ApproveTransactionDrawer";

const useStyles = styles((theme) => ({
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
  const { publicKey } = useActiveWallet();
  const [openDrawer, setOpenDrawer] = useState(false);

  useEffect(() => {
    setOpenDrawer(request !== undefined);
  }, [request]);

  // TODO: this check shouldn't be necessary.
  if (request && publicKey.toString() !== request.publicKey) {
    throw new Error("invariant violation");
  }

  return (
    <ApproveTransactionDrawer
      openDrawer={openDrawer}
      setOpenDrawer={setOpenDrawer}
    >
      <SendTransactionRequest
        onClose={() => {
          setOpenDrawer(false);
          setRequest(undefined);
        }}
      />
    </ApproveTransactionDrawer>
  );
}

function SendTransactionRequest({ onClose }: any) {
  const [request, setRequest] = useTransactionRequest();
  const background = useBackgroundClient();
  const plugins = usePlugins();
  const { publicKey } = useActiveWallet();
  const plugin = request
    ? plugins.find((p) => p.iframeUrl === request.pluginUrl)
    : undefined;

  const onConfirm = async () => {
    if (!request) {
      throw new Error("request not found");
    }
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

    request!.resolve(signature);
    setRequest(undefined);
  };

  return (
    <div
      style={{
        height: "402px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {request && plugin && (
        <div style={{ padding: "24px", flex: 1 }}>
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
      <div
        style={{
          marginLeft: "16px",
          marginBottom: "16px",
          marginRight: "16px",
        }}
      >
        <PrimaryButton
          onClick={() => onConfirm()}
          label="Send"
          type="submit"
          data-testid="Send"
        />
      </div>
    </div>
  );
}

/*
      <BottomCard
        style={{
          height: "295px",
        }}
        buttonLabel={"Confirm"}
        onButtonClick={onConfirm}
        cancelButtonLabel={"Cancel"}
        onCancelButtonClick={onReject}
>
*/

function SignAndSendTransaction({
  transaction,
  plugin,
}: {
  transaction: string;
  plugin: Plugin;
}) {
  const deserializedTx = useMemo(() => {
    return Transaction.from(bs58.decode(transaction));
  }, [transaction]);
  return (
    <_SignTransaction
      deserializedTx={deserializedTx}
      transaction={transaction}
      plugin={plugin}
    />
  );
}

function SignTransaction({
  transaction,
  plugin,
}: {
  transaction: string;
  plugin: Plugin;
}) {
  const deserializedTx = useMemo(() => {
    return Transaction.populate(Message.from(bs58.decode(transaction!)));
  }, [transaction]);

  return (
    <_SignTransaction
      deserializedTx={deserializedTx}
      transaction={transaction}
      plugin={plugin}
    />
  );
}

function _SignTransaction({
  transaction,
  plugin,
  deserializedTx,
}: {
  transaction: string;
  deserializedTx: Transaction;
  plugin: Plugin;
}) {
  const theme = useCustomTheme();
  const classes = useStyles();
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
