// All RPC request handlers for requests that can be sent from the injected
// provider script to the background script.

import type { SendOptions } from "@solana/web3.js";
import type {
  RpcRequest,
  RpcResponse,
  Context,
  EventEmitter,
} from "@coral-xyz/common";
import {
  getLogger,
  withContext,
  withContextPort,
  ChannelContentScript,
  ChannelAppUi,
  openLockedPopupWindow,
  openApprovalPopupWindow,
  openApproveTransactionPopupWindow,
  openApproveAllTransactionsPopupWindow,
  openApproveMessagePopupWindow,
  openXnft,
  openOnboarding,
  BrowserRuntimeExtension,
  BACKEND_EVENT,
  CHANNEL_BLOCKCHAIN_RPC_REQUEST,
  CHANNEL_BLOCKCHAIN_NOTIFICATION,
  CHANNEL_POPUP_RESPONSE,
  ETHEREUM_RPC_METHOD_CONNECT,
  ETHEREUM_RPC_METHOD_DISCONNECT,
  ETHEREUM_RPC_METHOD_SIGN_TX,
  ETHEREUM_RPC_METHOD_SIGN_AND_SEND_TX,
  ETHEREUM_RPC_METHOD_SIGN_MESSAGE,
  NOTIFICATION_BLOCKCHAIN_CONNECTED,
  NOTIFICATION_BLOCKCHAIN_DISCONNECTED,
  NOTIFICATION_BLOCKCHAIN_SETTINGS_UPDATED,
  SOLANA_RPC_METHOD_CONNECT,
  SOLANA_RPC_METHOD_DISCONNECT,
  SOLANA_RPC_METHOD_SIGN_AND_SEND_TX,
  SOLANA_RPC_METHOD_SIGN_TX,
  SOLANA_RPC_METHOD_SIGN_ALL_TXS,
  SOLANA_RPC_METHOD_SIGN_MESSAGE,
  SOLANA_RPC_METHOD_SIMULATE,
  SOLANA_RPC_METHOD_OPEN_XNFT,
  Blockchain,
} from "@coral-xyz/common";
import type { Backend } from "../backend/core";
import type { Config, Handle } from "../types";
import { handlePopupUiResponse, RequestManager } from "./common";

const logger = getLogger("server-injected");

const whitelistedOrigins = [
  /^http:\/\/localhost:[0-9]{4}$/,
  /^https:\/\/one-nft\.vercel\.app$/,
  /^https:\/\/xnft\.wao\.gg$/,
];

export function start(cfg: Config, events: EventEmitter, b: Backend): Handle {
  if (cfg.isMobile) {
    return null;
  }
  const rpcServerInjected = ChannelContentScript.server(
    CHANNEL_BLOCKCHAIN_RPC_REQUEST
  );
  const notificationsInjected = ChannelContentScript.client(
    CHANNEL_BLOCKCHAIN_NOTIFICATION
  );
  const popupUiResponse = ChannelAppUi.server(CHANNEL_POPUP_RESPONSE);

  //
  // Dispatch notifications to injected web apps.
  //
  events.on(BACKEND_EVENT, (notification) => {
    switch (notification.name) {
      case NOTIFICATION_BLOCKCHAIN_CONNECTED:
        notificationsInjected.sendMessageActiveTab(notification);
        break;
      case NOTIFICATION_BLOCKCHAIN_DISCONNECTED:
        notificationsInjected.sendMessageActiveTab(notification);
        break;
      case NOTIFICATION_BLOCKCHAIN_SETTINGS_UPDATED:
        notificationsInjected.sendMessageActiveTab(notification);
        break;
      default:
        break;
    }
  });

  rpcServerInjected.handler(withContext(b, events, handle));
  popupUiResponse.handler(withContextPort(b, events, handlePopupUiResponse));

  return {
    rpcServerInjected,
    notificationsInjected,
    popupUiResponse,
  };
}

async function handle<T = any>(
  ctx: Context<Backend>,
  req: RpcRequest
): Promise<RpcResponse<T>> {
  logger.debug(`handle rpc ${req.method}`, req);

  const { method, params } = req;

  //
  // Connection requests can come from any origin. All other requests *must*
  // come from an approved origin.
  //
  if (
    method !== ETHEREUM_RPC_METHOD_CONNECT &&
    method !== SOLANA_RPC_METHOD_CONNECT
  ) {
    const origin = ctx.sender.origin;
    const isApproved = await ctx.backend.isApprovedOrigin(origin);
    if (
      !isApproved &&
      !whitelistedOrigins.find((wlOrigin) => wlOrigin.test(origin))
    ) {
      return [undefined, `${origin} is not an approved origin`];
    }
  }

  switch (method) {
    case ETHEREUM_RPC_METHOD_CONNECT:
      return await handleConnect(ctx, Blockchain.ETHEREUM);
    case ETHEREUM_RPC_METHOD_DISCONNECT:
      return await handleDisconnect(ctx, Blockchain.ETHEREUM);
    case ETHEREUM_RPC_METHOD_SIGN_MESSAGE:
      return await handleEthereumSignMessage(ctx, params[0], params[1]);
    case ETHEREUM_RPC_METHOD_SIGN_TX:
      return await handleEthereumSignTx(ctx, params[0], params[1]);
    case ETHEREUM_RPC_METHOD_SIGN_AND_SEND_TX:
      return await handleEthereumSignAndSendTx(ctx, params[0], params[1]);
    case SOLANA_RPC_METHOD_CONNECT:
      return await handleConnect(ctx, Blockchain.SOLANA);
    case SOLANA_RPC_METHOD_DISCONNECT:
      return handleDisconnect(ctx, Blockchain.SOLANA);
    case SOLANA_RPC_METHOD_SIGN_AND_SEND_TX:
      return await handleSolanaSignAndSendTx(
        ctx,
        params[0],
        params[1],
        params[2]
      );
    case SOLANA_RPC_METHOD_SIGN_TX:
      return await handleSolanaSignTx(ctx, params[0], params[1]);
    case SOLANA_RPC_METHOD_SIGN_ALL_TXS:
      return await handleSolanaSignAllTxs(ctx, params[0], params[1]);
    case SOLANA_RPC_METHOD_SIGN_MESSAGE:
      return await handleSolanaSignMessage(ctx, params[0], params[1]);
    case SOLANA_RPC_METHOD_SIMULATE:
      return await handleSolanaSimulate(ctx, params[0], params[1], params[2]);
    case SOLANA_RPC_METHOD_OPEN_XNFT:
      return await handleSolanaOpenXnft(ctx, params[0]);
    default:
      throw new Error(`unexpected rpc method: ${method}`);
  }
}

// Locks for limiting requests to one per origin
const locks = new Set();

// Automatically connect in the event we're unlocked and the origin
// has been previously approved. Otherwise, open a new window to prompt
// the user to unlock and approve.
//
// Note that "connected" simply means that the wallet can be used to issue
// requests because it's both approved and unlocked. There is currently no
// extra session state or connections that are maintained.
async function handleConnect(
  ctx: Context<Backend>,
  blockchain: Blockchain
): Promise<RpcResponse<string>> {
  const origin = ctx.sender.origin;

  if (locks.has(origin)) {
    throw new Error(`already handling a request from ${origin}`);
  }

  locks.add(origin);

  const keyringStoreState = await ctx.backend.keyringStoreState();

  if (keyringStoreState === "needs-onboarding") {
    locks.delete(origin);
    openOnboarding();
    return;
  }

  let didApprove = false;
  let resp: any;

  if (
    keyringStoreState === "locked" &&
    (await ctx.backend.isApprovedOrigin(origin))
  ) {
    logger.debug("origin approved but need to unlock");
    resp = await RequestManager.requestUiAction((requestId: number) => {
      return openLockedPopupWindow(
        ctx.sender.origin,
        getTabTitle(ctx),
        requestId,
        blockchain
      );
    });
    didApprove = !resp.windowClosed && resp.result;
  } else {
    if (await ctx.backend.isApprovedOrigin(origin)) {
      logger.debug("origin approved so automatically connecting");
      didApprove = true;
    } else {
      // Origin is not approved and wallet may or may not be locked
      logger.debug("requesting approval for origin");
      resp = await RequestManager.requestUiAction((requestId: number) => {
        return openApprovalPopupWindow(
          ctx.sender.origin,
          getTabTitle(ctx),
          requestId,
          blockchain
        );
      });
      didApprove = !resp.windowClosed && resp.result;
    }
  }

  locks.delete(origin);

  if (resp && !resp.windowClosed) {
    BrowserRuntimeExtension.closeWindow(resp.window.id);
  }

  // If the user approved and unlocked, then we're connected.
  if (didApprove) {
    const data = {
      blockchain,
      ...(await ctx.backend.blockchainSettingsRead(blockchain)),
    };
    ctx.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_BLOCKCHAIN_CONNECTED,
      data,
    });
    return data;
  }

  throw new Error("user did not approve");
}

function getTabTitle(ctx) {
  return ctx.sender.tab?.title ?? `Xnft from ${ctx.sender.origin}`;
}

function handleDisconnect(
  ctx: Context<Backend>,
  blockchain: Blockchain
): RpcResponse<string> {
  ctx.events.emit(BACKEND_EVENT, {
    name: NOTIFICATION_BLOCKCHAIN_DISCONNECTED,
    data: {
      blockchain,
    },
  });
}

async function handleSolanaSignAndSendTx(
  ctx: Context<Backend>,
  tx: string,
  walletAddress: string,
  options?: SendOptions
): Promise<RpcResponse<string>> {
  // Get user approval.
  const uiResp = await RequestManager.requestUiAction((requestId: number) => {
    return openApproveTransactionPopupWindow(
      ctx.sender.origin,
      getTabTitle(ctx),
      requestId,
      tx,
      walletAddress,
      Blockchain.SOLANA
    );
  });

  if (uiResp.error) {
    logger.debug("require ui action error", uiResp);
    BrowserRuntimeExtension.closeWindow(uiResp.window.id);
    return;
  }

  let resp: RpcResponse<string>;
  const didApprove = uiResp.result;

  try {
    // Only sign if the user clicked approve.
    if (didApprove) {
      const sig = await ctx.backend.solanaSignAndSendTx(
        tx,
        walletAddress,
        options
      );
      resp = [sig];
    }
  } catch (err) {
    logger.debug("error sign and sending transaction", err.toString());
  }

  if (!uiResp.windowClosed) {
    BrowserRuntimeExtension.closeWindow(uiResp.window.id);
  }
  if (resp) {
    return resp;
  }
  return [resp];
}

async function handleSolanaSignTx(
  ctx: Context<Backend>,
  tx: string,
  walletAddress: string
): Promise<RpcResponse<string>> {
  const uiResp = await RequestManager.requestUiAction((requestId: number) => {
    return openApproveTransactionPopupWindow(
      ctx.sender.origin,
      getTabTitle(ctx),
      requestId,
      tx,
      walletAddress,
      Blockchain.SOLANA
    );
  });

  if (uiResp.error) {
    logger.debug("require ui action error", uiResp);
    BrowserRuntimeExtension.closeWindow(uiResp.window.id);
    return;
  }

  let resp: RpcResponse<string>;
  const didApprove = uiResp.result;

  try {
    // Only sign if the user clicked approve.
    if (didApprove) {
      const sig = await ctx.backend.solanaSignTransaction(tx, walletAddress);
      resp = [sig];
    }
  } catch (err) {
    logger.debug("error signing transaction", err.toString());
  }

  if (!uiResp.windowClosed) {
    BrowserRuntimeExtension.closeWindow(uiResp.window.id);
  }
  if (resp) {
    return resp;
  }

  throw new Error("user denied transaction signature");
}

async function handleSolanaSignAllTxs(
  ctx: Context<Backend>,
  txs: Array<string>,
  walletAddress: string
): Promise<RpcResponse<Array<string>>> {
  const uiResp = await RequestManager.requestUiAction((requestId: number) => {
    return openApproveAllTransactionsPopupWindow(
      ctx.sender.origin,
      getTabTitle(ctx),
      requestId,
      txs,
      walletAddress,
      Blockchain.SOLANA
    );
  });

  if (uiResp.error) {
    logger.debug("require ui action error", uiResp);
    BrowserRuntimeExtension.closeWindow(uiResp.window.id);
    return;
  }

  let resp: RpcResponse<string>;
  const didApprove = uiResp.result;

  try {
    // Sign all if user clicked approve.
    if (didApprove) {
      const sigs = await ctx.backend.solanaSignAllTransactions(
        txs,
        walletAddress
      );
      resp = [sigs];
    }
  } catch (err) {
    logger.debug("error signing all transactions", err.toString());
  }

  if (!uiResp.windowClosed) {
    BrowserRuntimeExtension.closeWindow(uiResp.window.id);
  }
  if (resp) {
    return resp;
  }

  throw new Error("user denied transactions");
}

async function handleSolanaSignMessage(
  ctx: Context<Backend>,
  msg: string,
  walletAddress: string
): Promise<RpcResponse<string>> {
  const uiResp = await RequestManager.requestUiAction((requestId: number) => {
    return openApproveMessagePopupWindow(
      ctx.sender.origin,
      getTabTitle(ctx),
      requestId,
      msg,
      walletAddress,
      Blockchain.SOLANA
    );
  });

  if (uiResp.error) {
    logger.debug("require ui action error", uiResp);
    BrowserRuntimeExtension.closeWindow(uiResp.window.id);
    return;
  }

  let resp: RpcResponse<string>;
  const didApprove = uiResp.result;

  try {
    if (didApprove) {
      const sig = await ctx.backend.solanaSignMessage(msg, walletAddress);
      resp = [sig];
    }
  } catch (err) {
    logger.debug("error sign message", err.toString());
  }

  if (!uiResp.windowClosed) {
    BrowserRuntimeExtension.closeWindow(uiResp.window.id);
  }
  if (resp) {
    return resp;
  }

  throw new Error("user denied message signature");
}

async function handleSolanaSimulate(
  ctx: Context<Backend>,
  txStr: string,
  walletAddress: string,
  includeAccounts?: boolean | Array<string>
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.solanaSimulate(
    txStr,
    walletAddress,
    includeAccounts
  );
  return [resp];
}

async function handleSolanaOpenXnft(
  ctx: Context<Backend>,
  xnftAddress: string
): Promise<RpcResponse<string>> {
  await openXnft(xnftAddress);
  return ["success"];
}

async function handleEthereumSignAndSendTx(
  ctx: Context<Backend>,
  tx: string,
  walletAddress: string
): Promise<RpcResponse<string>> {
  // Get user approval.
  const uiResp = await RequestManager.requestUiAction((requestId: number) => {
    return openApproveTransactionPopupWindow(
      ctx.sender.origin,
      getTabTitle(ctx),
      requestId,
      tx,
      walletAddress,
      Blockchain.ETHEREUM
    );
  });

  if (uiResp.error) {
    logger.debug("require ui action error", uiResp);
    BrowserRuntimeExtension.closeWindow(uiResp.window.id);
    return;
  }

  let resp: RpcResponse<string>;
  // The transaction may be modified and returned as result to accomodate user
  // tweaked gas settings/nonce.
  const approvedTransaction = uiResp.result;
  try {
    // Only sign if the user clicked approve.
    if (approvedTransaction) {
      const sig = await ctx.backend.ethereumSignAndSendTransaction(
        approvedTransaction,
        walletAddress
      );
      resp = [sig];
    }
  } catch (err) {
    logger.debug("error sign and sending transaction", err.toString());
  }

  if (!uiResp.windowClosed) {
    BrowserRuntimeExtension.closeWindow(uiResp.window.id);
  }
  if (resp) {
    return resp;
  }

  throw new Error("user denied ethereum transaction sign and send");
}

async function handleEthereumSignTx(
  ctx: Context<Backend>,
  tx: string,
  walletAddress: string
): Promise<RpcResponse<string>> {
  const uiResp = await RequestManager.requestUiAction((requestId: number) => {
    return openApproveTransactionPopupWindow(
      ctx.sender.origin,
      getTabTitle(ctx),
      requestId,
      tx,
      walletAddress,
      Blockchain.ETHEREUM
    );
  });

  if (uiResp.error) {
    logger.debug("require ui action error", uiResp);
    BrowserRuntimeExtension.closeWindow(uiResp.window.id);
    return;
  }

  let resp: RpcResponse<string>;
  // The transaction may be modified and returned as result to accomodate user
  // tweaked gas settings/nonce.
  const approvedTransaction = uiResp.result;

  try {
    // Only sign if the user clicked approve.
    if (approvedTransaction) {
      const sig = await ctx.backend.ethereumSignTransaction(
        approvedTransaction,
        walletAddress
      );
      resp = [sig];
    }
  } catch (err) {
    logger.debug("error signing transaction", err.toString());
  }

  if (!uiResp.windowClosed) {
    BrowserRuntimeExtension.closeWindow(uiResp.window.id);
  }
  if (resp) {
    return resp;
  }

  throw new Error("user denied ethereum transaction signature");
}

async function handleEthereumSignMessage(
  ctx: Context<Backend>,
  msg: string,
  walletAddress: string
): Promise<RpcResponse<string>> {
  const uiResp = await RequestManager.requestUiAction((requestId: number) => {
    return openApproveMessagePopupWindow(
      ctx.sender.origin,
      getTabTitle(ctx),
      requestId,
      msg,
      walletAddress,
      Blockchain.ETHEREUM
    );
  });

  if (uiResp.error) {
    logger.debug("require ui action error", uiResp);
    BrowserRuntimeExtension.closeWindow(uiResp.window.id);
    return;
  }

  let resp: RpcResponse<string>;
  const didApprove = uiResp.result;

  try {
    if (didApprove) {
      const sig = await ctx.backend.ethereumSignMessage(msg, walletAddress);
      resp = [sig];
    }
  } catch (err) {
    logger.debug("error sign message", err.toString());
  }

  if (!uiResp.windowClosed) {
    BrowserRuntimeExtension.closeWindow(uiResp.window.id);
  }
  if (resp) {
    return resp;
  }

  throw new Error("user denied ethereum message signature");
}
