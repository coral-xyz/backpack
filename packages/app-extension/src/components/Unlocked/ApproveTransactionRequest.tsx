import { useMemo, useEffect, useState } from "react";
import { ethers } from "ethers";
import * as bs58 from "bs58";
import { Transaction } from "@solana/web3.js";
import {
  useBackgroundClient,
  useTransactionRequest,
  useActivePublicKeys,
  useFreshPlugin,
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
import {
  walletAddressDisplay,
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

export function ApproveTransactionRequest() {
  const [request, setRequest] = useTransactionRequest();
  const activePublicKeys = useActivePublicKeys();
  const [openDrawer, setOpenDrawer] = useState(false);

  useEffect(() => {
    setOpenDrawer(request !== undefined);
  }, [request]);

  // TODO: this check shouldn't be necessary.
  if (request && !Object.values(activePublicKeys).includes(request.publicKey)) {
    throw new Error("invariant violation");
  }

  return (
    <ApproveTransactionDrawer
      openDrawer={openDrawer}
      setOpenDrawer={(b) => {
        if (b === false) {
          setRequest(undefined);
        }
        setOpenDrawer(b);
      }}
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
  const activePublicKeys = useActivePublicKeys();
  const { result: plugin } = useFreshPlugin(request?.xnftAddress);

  const onConfirm = async () => {
    if (!request) {
      throw new Error("request not found");
    }
    let signature;
    if (request!.kind === PLUGIN_REQUEST_ETHEREUM_SIGN_TRANSACTION) {
      signature = await background.request({
        method: UI_RPC_METHOD_ETHEREUM_SIGN_TRANSACTION,
        params: [request.data, activePublicKeys[Blockchain.ETHEREUM]],
      });
    } else if (
      request!.kind === PLUGIN_REQUEST_ETHEREUM_SIGN_AND_SEND_TRANSACTION
    ) {
      signature = await background.request({
        method: UI_RPC_METHOD_ETHEREUM_SIGN_AND_SEND_TRANSACTION,
        params: [request.data, activePublicKeys[Blockchain.ETHEREUM]],
      });
    } else if (request!.kind === PLUGIN_REQUEST_ETHEREUM_SIGN_MESSAGE) {
      signature = await background.request({
        method: UI_RPC_METHOD_ETHEREUM_SIGN_MESSAGE,
        params: [request.data, activePublicKeys[Blockchain.ETHEREUM]],
      });
    } else if (request!.kind === PLUGIN_REQUEST_SOLANA_SIGN_TRANSACTION) {
      signature = await background.request({
        method: UI_RPC_METHOD_SOLANA_SIGN_TRANSACTION,
        params: [request.data, activePublicKeys[Blockchain.SOLANA]],
      });
    } else if (
      request!.kind === PLUGIN_REQUEST_SOLANA_SIGN_AND_SEND_TRANSACTION
    ) {
      signature = await background.request({
        method: UI_RPC_METHOD_SOLANA_SIGN_AND_SEND_TRANSACTION,
        params: [request.data, activePublicKeys[Blockchain.SOLANA]],
      });
    } else if (request!.kind === PLUGIN_REQUEST_SOLANA_SIGN_MESSAGE) {
      signature = await background.request({
        method: UI_RPC_METHOD_SOLANA_SIGN_MESSAGE,
        params: [request.data, activePublicKeys[Blockchain.SOLANA]],
      });
    } else {
      throw "invalid request";
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
      <div style={{ padding: "24px", flex: 1 }}>
        {request && plugin && (
          <Scrollbar>
            {request?.kind === PLUGIN_REQUEST_ETHEREUM_SIGN_TRANSACTION ? (
              <SignTransaction
                blockchain={Blockchain.ETHEREUM}
                transaction={request?.data}
                plugin={plugin}
              />
            ) : request.kind ===
              PLUGIN_REQUEST_ETHEREUM_SIGN_AND_SEND_TRANSACTION ? (
              <SignAndSendTransaction
                blockchain={Blockchain.ETHEREUM}
                transaction={request?.data}
                plugin={plugin}
              />
            ) : request.kind === PLUGIN_REQUEST_ETHEREUM_SIGN_MESSAGE ? (
              <SignMessage message={request?.data} plugin={plugin} />
            ) : request.kind === PLUGIN_REQUEST_SOLANA_SIGN_TRANSACTION ? (
              <SignTransaction
                blockchain={Blockchain.SOLANA}
                transaction={request?.data}
                plugin={plugin}
              />
            ) : request.kind === PLUGIN_REQUEST_SOLANA_SIGN_MESSAGE ? (
              <SignMessage message={request?.data} plugin={plugin} />
            ) : (
              <SignAndSendTransaction
                blockchain={Blockchain.SOLANA}
                transaction={request?.data}
                plugin={plugin}
              />
            )}
          </Scrollbar>
        )}
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
          onClick={() => setRequest(undefined)}
          label={"Cancel"}
          style={{
            marginRight: "8px",
          }}
        />
        <PrimaryButton
          onClick={() => onConfirm()}
          label="Approve"
          type="submit"
          data-testid="Send"
        />
      </div>
    </div>
  );
}

function SignAndSendTransaction({
  blockchain,
  transaction,
  plugin,
}: {
  blockchain: Blockchain;
  transaction: string;
  plugin: Plugin;
}) {
  const deserializedTx = useMemo(() => {
    if (blockchain === Blockchain.ETHEREUM) {
      return ethers.utils.parseTransaction(bs58.decode(transaction!));
    } else if (blockchain === Blockchain.SOLANA) {
      return Transaction.from(bs58.decode(transaction!));
    }
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
  blockchain,
  transaction,
  plugin,
}: {
  blockchain: Blockchain;
  transaction: string;
  plugin: Plugin;
}) {
  const deserializedTx = useMemo(() => {
    if (blockchain === Blockchain.ETHEREUM) {
      return ethers.utils.parseTransaction(bs58.decode(transaction!));
    } else if (blockchain === Blockchain.SOLANA) {
      return Transaction.from(bs58.decode(transaction!));
    }
    throw new Error("invalid transaction");
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
  deserializedTx: any;
  plugin: Plugin;
}) {
  const theme = useCustomTheme();
  const classes = useStyles();
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
          {plugin.iframeRootUrl}
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
          Solana
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
          0.000005 SOL
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
        ></Typography>
      ),
      classes: { root: classes.approveTableRoot },
    },
  };
  return (
    <>
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
            {transaction}
          </Typography>
        </div>
      </div>
    </>
  );
}

function SignMessage({ message }: any) {
  const theme = useCustomTheme();
  return (
    <div>
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
          backgroundColor: theme.custom.colors.bg2,
          padding: "8px",
          borderRadius: "8px",
        }}
      >
        {message}
      </div>
    </div>
  );
}
