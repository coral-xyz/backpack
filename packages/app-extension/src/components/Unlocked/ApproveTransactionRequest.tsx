import { useEffect, useState } from "react";
import {
  useActivePublicKeys,
  useBackgroundClient,
  useFreshPlugin,
  useTransactionData,
  useTransactionRequest,
} from "@coral-xyz/recoil";
import {
  Blockchain,
  PLUGIN_REQUEST_ETHEREUM_SIGN_TRANSACTION,
  PLUGIN_REQUEST_ETHEREUM_SIGN_MESSAGE,
  PLUGIN_REQUEST_ETHEREUM_SIGN_AND_SEND_TRANSACTION,
  PLUGIN_REQUEST_SOLANA_SIGN_TRANSACTION,
  PLUGIN_REQUEST_SOLANA_SIGN_MESSAGE,
  PLUGIN_REQUEST_SOLANA_SIGN_AND_SEND_TRANSACTION,
  UI_RPC_METHOD_ETHEREUM_SIGN_MESSAGE,
  UI_RPC_METHOD_ETHEREUM_SIGN_TRANSACTION,
  UI_RPC_METHOD_ETHEREUM_SIGN_AND_SEND_TRANSACTION,
  UI_RPC_METHOD_SOLANA_SIGN_MESSAGE,
  UI_RPC_METHOD_SOLANA_SIGN_TRANSACTION,
  UI_RPC_METHOD_SOLANA_SIGN_AND_SEND_TRANSACTION,
} from "@coral-xyz/common";
import { Plugin } from "@coral-xyz/react-xnft-renderer";
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
import { SettingsList } from "../common/Settings/List";

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
    backgroundColor: `${theme.custom.colors.bg2} !important`,
    "&:hover": {
      opacity: 1,
      cursor: "default",
    },
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
  [PLUGIN_REQUEST_SOLANA_SIGN_AND_SEND_TRANSACTION]:
    UI_RPC_METHOD_SOLANA_SIGN_AND_SEND_TRANSACTION,
};

const pluginRpcBlockchainMap = {
  [PLUGIN_REQUEST_ETHEREUM_SIGN_MESSAGE]: Blockchain.ETHEREUM,
  [PLUGIN_REQUEST_ETHEREUM_SIGN_TRANSACTION]: Blockchain.ETHEREUM,
  [PLUGIN_REQUEST_ETHEREUM_SIGN_AND_SEND_TRANSACTION]: Blockchain.ETHEREUM,
  [PLUGIN_REQUEST_SOLANA_SIGN_MESSAGE]: Blockchain.SOLANA,
  [PLUGIN_REQUEST_SOLANA_SIGN_TRANSACTION]: Blockchain.SOLANA,
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

  const onReject = () => {
    setRequest(undefined);
    request!.reject(new Error("user rejected signature request"));
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
      {isMessageSign ? (
        <SignMessageRequest
          publicKey={publicKey}
          message={request!.data}
          uiRpcMethod={rpcMethod}
          onReject={onReject}
          onResolve={onResolve}
        />
      ) : (
        <SendTransactionRequest
          publicKey={publicKey}
          uiRpcMethod={rpcMethod}
          blockchain={blockchain}
          transaction={request!.data}
          onReject={onReject}
          onResolve={onResolve}
        />
      )}
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
          onClick={onConfirm}
          label="Approve"
          type="submit"
          data-testid="Send"
        />
      </div>
    </div>
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
  const { result: plugin } = useFreshPlugin(request?.xnftAddress);
  const {
    loading,
    transaction: transactionToSend,
    from,
    network,
    networkFee,
  } = useTransactionData(blockchain, transaction);

  //
  // Executes when the modal clicks "Approve" in the drawer popup
  // Note the transactionToSend argument is not the original transaction passed
  // into this component because it can be modified by the user to set
  // transaction specific settings (i.e. Etheruem gas).
  //
  const onConfirm = async (transactionToSend: string) => {
    const signature = await background.request({
      method: uiRpcMethod,
      params: [transactionToSend, publicKey],
    });
    onResolve(signature);
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
          {plugin?.iframeRootUrl}
        </Typography>
      ),
      classes: { root: classes.approveTableRoot },
    },
    Network: {
      onClick: () => {},
      detail: (
        <Typography
          style={{
            fontSize: "14px",
          }}
        >
          {network}
        </Typography>
      ),
      classes: { root: classes.approveTableRoot },
    },
    "Network Fee": {
      onClick: () => {},
      detail: (
        <Typography
          style={{
            fontSize: "14px",
          }}
        >
          {networkFee}
        </Typography>
      ),
      classes: { root: classes.approveTableRoot },
    },
    "Sending From": {
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
            <SettingsList
              borderColor={theme.custom.colors.border1}
              menuItems={menuItems}
              style={{
                marginLeft: 0,
                marginRight: 0,
                fontSize: "14px",
              }}
              textStyle={{
                fontSize: "14px",
                color: theme.custom.colors.fontColor3,
              }}
            />
            <div
              style={{
                backgroundColor: theme.custom.colors.bg2,
                borderRadius: "8px",
                padding: "12px",
                marginTop: "12px",
              }}
            >
              <Typography
                className={classes.confirmRowLabelRight}
                style={{
                  wordBreak: "break-all",
                }}
              >
                {transactionToSend}
              </Typography>
            </div>
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
  const onConfirm = async () => {
    const signature = await background.request({
      method: uiRpcMethod,
      params: [message, publicKey],
    });
    onResolve(signature);
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
            backgroundColor: theme.custom.colors.bg2,
            padding: "8px",
            borderRadius: "8px",
            wordBreak: "break-all",
            color: theme.custom.colors.fontColor,
          }}
        >
          {displayMessage}
        </div>
      </Scrollbar>
    </Request>
  );
}
