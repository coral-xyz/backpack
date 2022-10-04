import { useEffect, useState, Suspense } from "react";
import {
  useActivePublicKeys,
  useBackgroundClient,
  usePluginUrl,
  useTransactionData,
  useTransactionRequest,
} from "@coral-xyz/recoil";
import {
  Blockchain,
  PLUGIN_REQUEST_ETHEREUM_SIGN_TRANSACTION,
  PLUGIN_REQUEST_ETHEREUM_SIGN_MESSAGE,
  PLUGIN_REQUEST_ETHEREUM_SIGN_AND_SEND_TRANSACTION,
  PLUGIN_REQUEST_SOLANA_SIGN_TRANSACTION,
  PLUGIN_REQUEST_SOLANA_SIGN_ALL_TRANSACTIONS,
  PLUGIN_REQUEST_SOLANA_SIGN_MESSAGE,
  PLUGIN_REQUEST_SOLANA_SIGN_AND_SEND_TRANSACTION,
  UI_RPC_METHOD_ETHEREUM_SIGN_MESSAGE,
  UI_RPC_METHOD_ETHEREUM_SIGN_TRANSACTION,
  UI_RPC_METHOD_ETHEREUM_SIGN_AND_SEND_TRANSACTION,
  UI_RPC_METHOD_SOLANA_SIGN_MESSAGE,
  UI_RPC_METHOD_SOLANA_SIGN_TRANSACTION,
  UI_RPC_METHOD_SOLANA_SIGN_AND_SEND_TRANSACTION,
  UI_RPC_METHOD_SOLANA_SIGN_ALL_TRANSACTIONS,
} from "@coral-xyz/common";
import { Typography } from "@mui/material";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import * as anchor from "@project-serum/anchor";
import {
  walletAddressDisplay,
  Loading,
  PrimaryButton,
  SecondaryButton,
} from "../common";
import { Scrollbar } from "../common/Layout/Scrollbar";
import { ApproveTransactionDrawer } from "../common/ApproveTransactionDrawer";
import { TransactionData } from "../common/TransactionData";

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
  const activePublicKeys = useActivePublicKeys();
  const [openDrawer, setOpenDrawer] = useState(false);

  useEffect(() => {
    setOpenDrawer(request !== undefined);
  }, [request]);

  if (!request) return <></>;

  const rpcMethod = pluginUiRpcMap[request!.kind];
  const blockchain = pluginRpcBlockchainMap[request!.kind];
  const publicKey = activePublicKeys[blockchain];

  // TODO: this check shouldn't be necessary.
  if (request && !Object.values(activePublicKeys).includes(request.publicKey)) {
    throw new Error("invariant violation");
  }

  const onResolve = (signature: string) => {
    request!.resolve(signature);
    setRequest(undefined);
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

  if (!request) {
    return <></>;
  }

  return (
    <ApproveTransactionDrawer
      openDrawer={openDrawer}
      setOpenDrawer={(b) => {
        if (b === false) onReject();
        setOpenDrawer(b);
      }}
    >
      <Suspense fallback={<DisabledRequestPrompt />}>
        {isMessageSign ? (
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
          label={"Cancel"}
          style={{
            marginRight: "8px",
          }}
        />
        <PrimaryButton
          disabled={buttonsDisabled}
          onClick={(event) => onConfirm()}
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
}: {
  publicKey: string;
  transaction: string;
  uiRpcMethod: string;
  blockchain: Blockchain;
  onResolve: (signature: string) => void;
  onReject: () => void;
}) {
  const classes = useStyles();
  const theme = useCustomTheme();
  const [request] = useTransactionRequest();
  const background = useBackgroundClient();
  const pluginUrl = usePluginUrl(request?.xnftAddress);
  const transactionData = useTransactionData(blockchain, transaction);
  const { loading, transaction: transactionToSend, from } = transactionData;

  //
  // Executes when the modal clicks "Approve" in the drawer popup
  // Note the transactionToSend argument is not the original transaction passed
  // into this component because it can be modified by the user to set
  // transaction specific settings (i.e. Etheruem gas).
  //
  const onConfirm = () => {
    background
      .request({
        method: uiRpcMethod,
        params: [transactionToSend, publicKey],
      })
      .then(onResolve)
      .catch(onReject);
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
          {walletAddressDisplay(from)}
        </Typography>
      ),
      classes: { root: classes.approveTableRoot },
    },
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
            wordBreak: "break-all",
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
    <Request onConfirm={() => {}} onReject={() => {}} buttonsDisabled={true}>
      <Loading />
    </Request>
  );
}
