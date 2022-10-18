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
  openLockedApprovalPopupWindow,
  openApproveTransactionPopupWindow,
  openApproveAllTransactionsPopupWindow,
  openApproveMessagePopupWindow,
  openXnft,
  BrowserRuntimeExtension,
  ETHEREUM_RPC_METHOD_CONNECT,
  ETHEREUM_RPC_METHOD_DISCONNECT,
  ETHEREUM_RPC_METHOD_SIGN_TX,
  ETHEREUM_RPC_METHOD_SIGN_AND_SEND_TX,
  ETHEREUM_RPC_METHOD_SIGN_MESSAGE,
  SOLANA_RPC_METHOD_CONNECT,
  SOLANA_RPC_METHOD_DISCONNECT,
  SOLANA_RPC_METHOD_SIGN_AND_SEND_TX,
  SOLANA_RPC_METHOD_SIGN_TX,
  SOLANA_RPC_METHOD_SIGN_ALL_TXS,
  SOLANA_RPC_METHOD_SIGN_MESSAGE,
  SOLANA_RPC_METHOD_SIMULATE,
  SOLANA_RPC_METHOD_OPEN_XNFT,
  CHANNEL_ETHEREUM_RPC_REQUEST,
  CHANNEL_ETHEREUM_NOTIFICATION,
  CHANNEL_SOLANA_RPC_REQUEST,
  CHANNEL_SOLANA_NOTIFICATION,
  CHANNEL_POPUP_RESPONSE,
  BACKEND_EVENT,
  NOTIFICATION_ETHEREUM_ACTIVE_WALLET_UPDATED,
  NOTIFICATION_ETHEREUM_CONNECTED,
  NOTIFICATION_ETHEREUM_DISCONNECTED,
  NOTIFICATION_ETHEREUM_CONNECTION_URL_UPDATED,
  NOTIFICATION_ETHEREUM_CHAIN_ID_UPDATED,
  NOTIFICATION_SOLANA_ACTIVE_WALLET_UPDATED,
  NOTIFICATION_SOLANA_CONNECTED,
  NOTIFICATION_SOLANA_DISCONNECTED,
  NOTIFICATION_SOLANA_CONNECTION_URL_UPDATED,
  Blockchain,
} from "@coral-xyz/common";
import type { Backend } from "../backend/core";
import type { Config, Handle } from "../types";
import { handlePopupUiResponse, RequestManager } from "./common";

const logger = getLogger("server-injected");

export function start(cfg: Config, events: EventEmitter, b: Backend): Handle {
  if (cfg.isMobile) {
    return null;
  }

  const solanaRpcServerInjected = ChannelContentScript.server(
    CHANNEL_SOLANA_RPC_REQUEST
  );
  const solanaNotificationsInjected = ChannelContentScript.client(
    CHANNEL_SOLANA_NOTIFICATION
  );
  const ethereumRpcServerInjected = ChannelContentScript.server(
    CHANNEL_ETHEREUM_RPC_REQUEST
  );
  const ethereumNotificationsInjected = ChannelContentScript.client(
    CHANNEL_ETHEREUM_NOTIFICATION
  );
  const popupUiResponse = ChannelAppUi.server(CHANNEL_POPUP_RESPONSE);

  //
  // Dispatch notifications to injected web apps.
  //
  events.on(BACKEND_EVENT, (notification) => {
    switch (notification.name) {
      case NOTIFICATION_ETHEREUM_CONNECTED:
        ethereumNotificationsInjected.sendMessageActiveTab(notification);
        break;
      case NOTIFICATION_ETHEREUM_DISCONNECTED:
        ethereumNotificationsInjected.sendMessageActiveTab(notification);
        break;
      case NOTIFICATION_ETHEREUM_ACTIVE_WALLET_UPDATED:
        ethereumNotificationsInjected.sendMessageActiveTab(notification);
        break;
      case NOTIFICATION_ETHEREUM_CONNECTION_URL_UPDATED:
        ethereumNotificationsInjected.sendMessageActiveTab(notification);
        break;
      case NOTIFICATION_ETHEREUM_CHAIN_ID_UPDATED:
        ethereumNotificationsInjected.sendMessageActiveTab(notification);
        break;
      case NOTIFICATION_SOLANA_CONNECTED:
        solanaNotificationsInjected.sendMessageActiveTab(notification);
        break;
      case NOTIFICATION_SOLANA_DISCONNECTED:
        solanaNotificationsInjected.sendMessageActiveTab(notification);
        break;
      case NOTIFICATION_SOLANA_ACTIVE_WALLET_UPDATED:
        solanaNotificationsInjected.sendMessageActiveTab(notification);
        break;
      case NOTIFICATION_SOLANA_CONNECTION_URL_UPDATED:
        solanaNotificationsInjected.sendMessageActiveTab(notification);
        break;
      default:
        break;
    }
  });

  ethereumRpcServerInjected.handler(withContext(b, events, handle));
  solanaRpcServerInjected.handler(withContext(b, events, handle));
  popupUiResponse.handler(withContextPort(b, events, handlePopupUiResponse));

  return {
    ethereumRpcServerInjected,
    ethereumNotificationsInjected,
    popupUiResponse,
    solanaRpcServerInjected,
    solanaNotificationsInjected,
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
    if (!isApproved) {
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
  let didApprove = false;
  let resp: any;

  // Use the UI to ask the user if it should connect.
  if (keyringStoreState === "unlocked") {
    if (await ctx.backend.isApprovedOrigin(origin)) {
      logger.debug("already approved so automatically connecting");
      didApprove = true;
    } else {
      resp = await RequestManager.requestUiAction((requestId: number) => {
        return openApprovalPopupWindow(
          ctx.sender.origin,
          ctx.sender.tab.title,
          requestId,
          blockchain
        );
      });
      didApprove = !resp.windowClosed && resp.result;
    }
  } else if (keyringStoreState === "locked") {
    if (await ctx.backend.isApprovedOrigin(origin)) {
      resp = await RequestManager.requestUiAction((requestId: number) => {
        return openLockedPopupWindow(
          ctx.sender.origin,
          ctx.sender.tab.title,
          requestId,
          blockchain
        );
      });
      didApprove = !resp.windowClosed && resp.result;
    } else {
      resp = await RequestManager.requestUiAction((requestId: number) => {
        return openLockedApprovalPopupWindow(
          ctx.sender.origin,
          ctx.sender.tab.title,
          requestId,
          blockchain
        );
      });
      didApprove = !resp.windowClosed && resp.result;
    }
  } else {
    locks.delete(origin);
    throw new Error("invariant violation keyring not created");
  }

  locks.delete(origin);

  if (resp && !resp.windowClosed) {
    BrowserRuntimeExtension.closeWindow(resp.window.id);
  }

  // If the user approved and unlocked, then we're connected.
  if (didApprove) {
    const activeWallet = (await ctx.backend.blockchainActiveWallets())[
      blockchain
    ];
    if (blockchain === Blockchain.ETHEREUM) {
      const connectionUrl = await ctx.backend.ethereumConnectionUrlRead();
      const chainId = await ctx.backend.ethereumChainIdRead();
      const data = { publicKey: activeWallet, connectionUrl, chainId };
      ctx.events.emit(BACKEND_EVENT, {
        name: NOTIFICATION_ETHEREUM_CONNECTED,
        data,
      });
      return [data];
    } else if (blockchain === Blockchain.SOLANA) {
      const connectionUrl = await ctx.backend.solanaConnectionUrlRead();
      const data = { publicKey: activeWallet, connectionUrl };
      ctx.events.emit(BACKEND_EVENT, {
        name: NOTIFICATION_SOLANA_CONNECTED,
        data,
      });
      return [data];
    }
  }

  throw new Error("user did not approve");
}

function handleDisconnect(
  ctx: Context<Backend>,
  blockchain: Blockchain
): RpcResponse<string> {
  let resp;
  if (blockchain === Blockchain.SOLANA) {
    resp = ctx.backend.solanaDisconnect();
    ctx.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_SOLANA_DISCONNECTED,
    });
  } else if (blockchain === Blockchain.ETHEREUM) {
    // resp = ctx.backend.ethereumDisconnect();
    ctx.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_ETHEREUM_DISCONNECTED,
    });
  }
  return [resp];
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
      ctx.sender.tab.title,
      requestId,
      tx,
      walletAddress
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
      ctx.sender.tab.title,
      requestId,
      tx,
      walletAddress
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
      ctx.sender.tab.title,
      requestId,
      txs,
      walletAddress
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
      ctx.sender.tab.title,
      requestId,
      msg,
      walletAddress
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
      ctx.sender.tab.title,
      requestId,
      tx,
      walletAddress
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
      ctx.sender.tab.title,
      requestId,
      tx,
      walletAddress
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
      ctx.sender.tab.title,
      requestId,
      msg,
      walletAddress
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
