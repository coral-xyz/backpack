import { Suspense, useEffect, useState } from "react";
import {
  Blockchain,
  PLUGIN_REQUEST_ETHEREUM_SIGN_AND_SEND_TRANSACTION,
  PLUGIN_REQUEST_ETHEREUM_SIGN_MESSAGE,
  PLUGIN_REQUEST_ETHEREUM_SIGN_TRANSACTION,
  PLUGIN_REQUEST_SOLANA_SIGN_ALL_TRANSACTIONS,
  PLUGIN_REQUEST_SOLANA_SIGN_AND_SEND_TRANSACTION,
  PLUGIN_REQUEST_SOLANA_SIGN_MESSAGE,
  PLUGIN_REQUEST_SOLANA_SIGN_TRANSACTION,
  UI_RPC_METHOD_ETHEREUM_SIGN_AND_SEND_TRANSACTION,
  UI_RPC_METHOD_ETHEREUM_SIGN_MESSAGE,
  UI_RPC_METHOD_ETHEREUM_SIGN_TRANSACTION,
  UI_RPC_METHOD_SOLANA_SIGN_ALL_TRANSACTIONS,
  UI_RPC_METHOD_SOLANA_SIGN_AND_SEND_TRANSACTION,
  UI_RPC_METHOD_SOLANA_SIGN_MESSAGE,
  UI_RPC_METHOD_SOLANA_SIGN_TRANSACTION,
} from "@coral-xyz/common";
import {
  Loading,
  PrimaryButton,
  SecondaryButton,
} from "@coral-xyz/react-common";
import {
  isKeyCold,
  useActiveWallet,
  useBackgroundClient,
  usePluginUrl,
  useSolanaCtx,
  useTransactionData,
  useTransactionRequest,
} from "@coral-xyz/recoil";
import { styles as makeStyles, useCustomTheme } from "@coral-xyz/themes";
import { Typography } from "@mui/material";
import * as anchor from "@project-serum/anchor";
import type { ConfirmOptions, SendOptions } from "@solana/web3.js";
import { useRecoilValue } from "recoil";

import { sanitizeTransactionWithFeeConfig } from "../../utils/solana";
import { formatWalletAddress } from "../common";
import { ApproveTransactionDrawer } from "../common/ApproveTransactionDrawer";
import { Scrollbar } from "../common/Layout/Scrollbar";
import { TransactionData } from "../common/TransactionData";
import { Cold } from "../Unlocked/Approvals/ApproveTransaction";

import { ErrorTransaction } from "./XnftPopovers/ErrorTransaction";
import { Sending } from "./XnftPopovers/Sending";
import { Success } from "./XnftPopovers/Success";

const useStyles = makeStyles((theme) => ({
  approveTableRoot: {
    backgroundColor: `${theme.custom.colors.approveTransactionTableBackground} !important`,
    "&:hover": {
      opacity: 1,
      cursor: "default",
    },
  },
  warning: {
    color: theme.custom.colors.negative,
    fontSize: "14px",
    textAlign: "center",
    marginTop: "8px",
  },
}));

const pluginUiRpcMap = {
  [PLUGIN_REQUEST_ETHEREUM_SIGN_MESSAGE]: UI_RPC_METHOD_ETHEREUM_SIGN_MESSAGE,
  [PLUGIN_REQUEST_ETHEREUM_SIGN_TRANSACTION]:
    UI_RPC_METHOD_ETHEREUM_SIGN_TRANSACTION,
  [PLUGIN_REQUEST_ETHEREUM_SIGN_AND_SEND_TRANSACTION]:
    UI_RPC_METHOD_ETHEREUM_SIGN_AND_SEND_TRANSACTION,
  [PLUGIN_REQUEST_SOLANA_SIGN_MESSAGE]: UI_RPC_METHOD_SOLANA_SIGN_MESSAGE,
  [PLUGIN_REQUEST_SOLANA_SIGN_TRANSACTION]:
    UI_RPC_METHOD_SOLANA_SIGN_TRANSACTION,
  [PLUGIN_REQUEST_SOLANA_SIGN_ALL_TRANSACTIONS]:
    UI_RPC_METHOD_SOLANA_SIGN_ALL_TRANSACTIONS,
  [PLUGIN_REQUEST_SOLANA_SIGN_AND_SEND_TRANSACTION]:
    UI_RPC_METHOD_SOLANA_SIGN_AND_SEND_TRANSACTION,
};

const pluginRpcBlockchainMap = {
  [PLUGIN_REQUEST_ETHEREUM_SIGN_MESSAGE]: Blockchain.ETHEREUM,
  [PLUGIN_REQUEST_ETHEREUM_SIGN_TRANSACTION]: Blockchain.ETHEREUM,
  [PLUGIN_REQUEST_ETHEREUM_SIGN_AND_SEND_TRANSACTION]: Blockchain.ETHEREUM,
  [PLUGIN_REQUEST_SOLANA_SIGN_MESSAGE]: Blockchain.SOLANA,
  [PLUGIN_REQUEST_SOLANA_SIGN_TRANSACTION]: Blockchain.SOLANA,
  [PLUGIN_REQUEST_SOLANA_SIGN_ALL_TRANSACTIONS]: Blockchain.SOLANA,
  [PLUGIN_REQUEST_SOLANA_SIGN_AND_SEND_TRANSACTION]: Blockchain.SOLANA,
};

export function ApproveTransactionRequest() {
  const [request, setRequest] = useTransactionRequest();
  const { publicKey } = useActiveWallet();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const _isKeyCold = useRecoilValue(isKeyCold(publicKey));

  useEffect(() => {
    setOpenDrawer(request !== undefined);
  }, [request, signature]);

  if (!request) {
    return null;
  }

  const rpcMethod = pluginUiRpcMap[request!.kind];
  const blockchain = pluginRpcBlockchainMap[request!.kind];

  const onResolve = (signature: string) => {
    request!.resolve(signature);
    if (!request.confirmTransaction) {
      setRequest(undefined);
    } else {
      setSignature(signature);
    }
  };

  const onReject = (
    e: Error = new Error("user rejected signature request")
  ) => {
    setRequest(undefined);
    request!.reject(e);
  };

  const isMessageSign = [
    PLUGIN_REQUEST_ETHEREUM_SIGN_MESSAGE,
    PLUGIN_REQUEST_SOLANA_SIGN_MESSAGE,
  ].includes(request!.kind);

  return (
    <ApproveTransactionDrawer
      openDrawer={openDrawer}
      setOpenDrawer={(b) => {
        if (b === false && !signature) onReject();
        if (b === false && signature) {
          setRequest(undefined);
          setSignature(null);
        }
        setOpenDrawer(b);
      }}
    >
      <Suspense fallback={<DisabledRequestPrompt />}>
        {_isKeyCold ? (
          <Cold
            origin="This xNFT"
            style={{
              padding: 0,
              width: "100%",
            }}
          />
        ) : isMessageSign ? (
          <SignMessageRequest
            publicKey={publicKey}
            message={request!.data as string}
            uiRpcMethod={rpcMethod}
            onResolve={onResolve}
            onReject={onReject}
          />
        ) : request.kind! === PLUGIN_REQUEST_SOLANA_SIGN_ALL_TRANSACTIONS ? (
          <SignAllTransactionsRequest
            publicKey={publicKey}
            uiRpcMethod={rpcMethod}
            blockchain={blockchain}
            transactions={request!.data as string[]}
            onResolve={onResolve}
            onReject={onReject}
          />
        ) : (
          <SendTransactionRequest
            publicKey={publicKey}
            uiRpcMethod={rpcMethod}
            blockchain={blockchain}
            transaction={request!.data as string}
            onResolve={onResolve}
            onReject={onReject}
            confirmTransaction={request.confirmTransaction}
            options={request.options}
          />
        )}
      </Suspense>
    </ApproveTransactionDrawer>
  );
}

function Request({ onConfirm, onReject, buttonsDisabled, children }: any) {
  return (
    <div
      style={{
        height: "402px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ padding: "24px", flex: 1 }}>
        <Scrollbar>{children}</Scrollbar>
      </div>
      <div
        style={{
          marginLeft: "16px",
          marginBottom: "16px",
          marginRight: "16px",
          display: "flex",
        }}
      >
        <SecondaryButton
          disabled={buttonsDisabled}
          onClick={onReject}
          label="Cancel"
          style={{
            marginRight: "8px",
          }}
        />
        <PrimaryButton
          disabled={buttonsDisabled}
          onClick={() => onConfirm()}
          label="Approve"
          type="submit"
          data-testid="Send"
        />
      </div>
    </div>
  );
}

function SignAllTransactionsRequest({
  publicKey,
  transactions,
  uiRpcMethod,
  onResolve,
  onReject,
}: {
  publicKey: string;
  transactions: Array<string>;
  uiRpcMethod: string;
  blockchain: Blockchain;
  onResolve: (signature: string) => void;
  onReject: () => void;
}) {
  const loading = false;
  const classes = useStyles();
  const theme = useCustomTheme();
  const background = useBackgroundClient();

  const onConfirm = async () => {
    background
      .request({
        method: uiRpcMethod,
        params: [transactions, publicKey],
      })
      .then(onResolve)
      .catch(onReject);
  };

  return (
    <Request
      onConfirm={onConfirm}
      onReject={onReject}
      buttonsDisabled={loading}
    >
      {loading ? (
        <Loading />
      ) : (
        <Scrollbar>
          <Typography
            style={{
              color: theme.custom.colors.fontColor,
              fontWeight: 500,
              fontSize: "18px",
              lineHeight: "24px",
              textAlign: "center",
            }}
          >
            Approve Transaction
          </Typography>
          <div
            style={{
              marginTop: "18px",
            }}
          >
            <div className={classes.warning}>
              Approving multiple transactions
            </div>
          </div>
        </Scrollbar>
      )}
    </Request>
  );
}

//
//
//
function SendTransactionRequest({
  publicKey,
  transaction,
  uiRpcMethod,
  blockchain,
  onResolve,
  onReject,
  confirmTransaction,
  options,
}: {
  publicKey: string;
  transaction: string;
  uiRpcMethod: string;
  blockchain: Blockchain;
  onResolve: (signature: string) => void;
  onReject: () => void;
  confirmTransaction?: boolean;
  options?: SendOptions | ConfirmOptions;
}) {
  const classes = useStyles();
  const theme = useCustomTheme();
  const [request] = useTransactionRequest();
  const background = useBackgroundClient();
  const pluginUrl = usePluginUrl(request?.xnftAddress);
  const transactionData = useTransactionData(blockchain, transaction);
  const {
    loading,
    transaction: transactionToSend,
    from,
    solanaFeeConfig,
  } = transactionData;
  const solanaCtx = useSolanaCtx();
  const [signature, setSignature] = useState("");
  const [txState, setTxState] = useState<
    "approve" | "confirming" | "succeeded" | "failed"
  >("approve");

  //
  // Executes when the modal clicks "Approve" in the drawer popup
  // Note the transactionToSend argument is not the original transaction passed
  // into this component because it can be modified by the user to set
  // transaction specific settings (i.e. Etheruem gas).
  //
  const onConfirm = () => {
    const feeConfig = solanaFeeConfig;
    const sanitizedTx = sanitizeTransactionWithFeeConfig(
      transactionToSend,
      blockchain,
      feeConfig
    );
    background
      .request({
        method: uiRpcMethod,
        params: [sanitizedTx, publicKey],
      })
      .then(async (signature) => {
        setSignature(signature);
        if (confirmTransaction) {
          setTxState("confirming");
          const { blockhash, lastValidBlockHeight } =
            await solanaCtx.connection.getLatestBlockhash(
              options?.preflightCommitment
            );
          const resp = await solanaCtx.connection.confirmTransaction(
            {
              signature,
              blockhash,
              lastValidBlockHeight,
            },
            // @ts-ignore
            options?.commitment
          );
          if (resp?.value.err) {
            onReject();
            setTxState("failed");
          } else {
            onResolve(signature);
            setTxState("succeeded");
          }
        } else {
          onResolve(signature);
        }
      })
      .catch(() => {
        onReject();
      });
  };

  //
  // Transaction data
  //
  const menuItems = {
    xNFT: {
      onClick: () => {},
      detail: (
        <Typography
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "200px",
            fontSize: "14px",
          }}
        >
          {pluginUrl}
        </Typography>
      ),
      classes: { root: classes.approveTableRoot },
    },
    From: {
      onClick: () => {},
      detail: (
        <Typography
          style={{
            fontSize: "14px",
          }}
        >
          {formatWalletAddress(from)}
        </Typography>
      ),
      classes: { root: classes.approveTableRoot },
    },
  };

  if (txState === "confirming") {
    return <Sending blockchain={blockchain} signature={signature} />;
  }

  if (txState === "succeeded") {
    return <Success blockchain={blockchain} signature={signature} />;
  }

  if (txState === "failed") {
    return (
      <ErrorTransaction
        blockchain={blockchain}
        signature={signature}
        onRetry={() => {
          onConfirm();
        }}
      />
    );
  }

  return (
    <Request
      onConfirm={onConfirm}
      onReject={onReject}
      buttonsDisabled={loading}
    >
      {loading ? (
        <Loading />
      ) : (
        <Scrollbar>
          <Typography
            style={{
              color: theme.custom.colors.fontColor,
              fontWeight: 500,
              fontSize: "18px",
              lineHeight: "24px",
              textAlign: "center",
            }}
          >
            Approve Transaction
          </Typography>
          <div
            style={{
              marginTop: "18px",
            }}
          >
            <TransactionData
              menuItems={menuItems}
              menuItemClasses={{ root: classes.approveTableRoot }}
              transactionData={transactionData}
            />
          </div>
        </Scrollbar>
      )}
    </Request>
  );
}

function SignMessageRequest({
  publicKey,
  message,
  uiRpcMethod,
  onResolve,
  onReject,
}: {
  publicKey: string;
  message: string;
  uiRpcMethod: string;
  onResolve: (signature: string) => void;
  onReject: () => void;
}) {
  const theme = useCustomTheme();
  const background = useBackgroundClient();

  let displayMessage;
  try {
    displayMessage = anchor.utils.bytes.utf8.decode(
      anchor.utils.bytes.bs58.decode(message)
    );
  } catch (err) {
    displayMessage = message;
  }

  //
  // Executes when the modal clicks "Approve" in the drawer popup
  //
  const onConfirm = () => {
    background
      .request({
        method: uiRpcMethod,
        params: [message, publicKey],
      })
      .then(onResolve)
      .catch(onReject);
  };

  return (
    <Request onConfirm={onConfirm} onReject={onReject}>
      <Scrollbar>
        <Typography
          style={{
            color: theme.custom.colors.fontColor,
            fontWeight: 500,
            fontSize: "18px",
            lineHeight: "24px",
            textAlign: "center",
          }}
        >
          Sign Message
        </Typography>
        <div
          style={{
            marginTop: "18px",
            backgroundColor: theme.custom.colors.nav,
            padding: "8px",
            borderRadius: "8px",
            color: theme.custom.colors.fontColor,
            border: theme.custom.colors.borderFull,
          }}
        >
          {displayMessage}
        </div>
      </Scrollbar>
    </Request>
  );
}

function DisabledRequestPrompt() {
  return (
    <Request onConfirm={() => {}} onReject={() => {}} buttonsDisabled>
      <Loading />
    </Request>
  );
}
