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
  Blockchain,
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
  SOLANA_RPC_METHOD_CONNECT,
  SOLANA_RPC_METHOD_DISCONNECT,
  SOLANA_RPC_METHOD_SIGN_AND_SEND_TX,
  SOLANA_RPC_METHOD_SIGN_TX,
  SOLANA_RPC_METHOD_SIGN_ALL_TXS,
  SOLANA_RPC_METHOD_SIGN_MESSAGE,
  SOLANA_RPC_METHOD_SIMULATE,
  SOLANA_RPC_METHOD_OPEN_XNFT,
  CHANNEL_SOLANA_RPC_REQUEST,
  CHANNEL_SOLANA_NOTIFICATION,
  CHANNEL_POPUP_RESPONSE,
  BACKEND_EVENT,
  NOTIFICATION_SOLANA_ACTIVE_WALLET_UPDATED,
  NOTIFICATION_SOLANA_CONNECTED,
  NOTIFICATION_SOLANA_DISCONNECTED,
  NOTIFICATION_SOLANA_CONNECTION_URL_UPDATED,
} from "@coral-xyz/common";
import type { Backend } from "../backend/core";
import { SUCCESS_RESPONSE } from "../backend/core";
import type { Config, Handle } from "../types";

const logger = getLogger("server-injected");

export function start(cfg: Config, events: EventEmitter, b: Backend): Handle {
  if (cfg.isMobile) {
    return null;
  }
  const solanaRpcServerInjected = ChannelContentScript.server(
    CHANNEL_SOLANA_RPC_REQUEST
  );
  const notificationsInjected = ChannelContentScript.client(
    CHANNEL_SOLANA_NOTIFICATION
  );
  const popupUiResponse = ChannelAppUi.server(CHANNEL_POPUP_RESPONSE);

  //
  // Dispatch notifications to injected web apps.
  //
  events.on(BACKEND_EVENT, (notification) => {
    switch (notification.name) {
      case NOTIFICATION_SOLANA_CONNECTED:
        notificationsInjected.sendMessageActiveTab(notification);
        break;
      case NOTIFICATION_SOLANA_DISCONNECTED:
        notificationsInjected.sendMessageActiveTab(notification);
        break;
      case NOTIFICATION_SOLANA_ACTIVE_WALLET_UPDATED:
        notificationsInjected.sendMessageActiveTab(notification);
        break;
      case NOTIFICATION_SOLANA_CONNECTION_URL_UPDATED:
        notificationsInjected.sendMessageActiveTab(notification);
        break;
      default:
        break;
    }
  });

  solanaRpcServerInjected.handler(withContext(b, events, handle));
  popupUiResponse.handler(withContextPort(b, events, handlePopupUiResponse));

  return {
    solanaRpcServerInjected,
    popupUiResponse,
    notificationsInjected,
  };
}

// TODO: add a guard for approved origins (DUH!).
async function handle<T = any>(
  ctx: Context<Backend>,
  req: RpcRequest
): Promise<RpcResponse<T>> {
  logger.debug(`handle rpc ${req.method}`, req);

  const { method, params } = req;
  switch (method) {
    case SOLANA_RPC_METHOD_CONNECT:
      return await handleSolanaConnect(ctx);
    case SOLANA_RPC_METHOD_DISCONNECT:
      return handleSolanaDisconnect(ctx);
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

// Automatically connect in the event we're unlocked and the origin
// has been previously approved. Otherwise, open a new window to prompt
// the user to unlock and approve.
//
// Note that "connected" simply means that the wallet can be used to issue
// requests because it's both approved and unlocked. There is currently no
// extra session state or connections that are maintained.
async function handleSolanaConnect(
  ctx: Context<Backend>
): Promise<RpcResponse<string>> {
  const origin = ctx.sender.origin;
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
          requestId
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
          requestId
        );
      });
      didApprove = !resp.windowClosed && resp.result;
    } else {
      resp = await RequestManager.requestUiAction((requestId: number) => {
        return openLockedApprovalPopupWindow(
          ctx.sender.origin,
          ctx.sender.tab.title,
          requestId
        );
      });
      didApprove = !resp.windowClosed && resp.result;
    }
  } else {
    throw new Error("invariant violation keyring not created");
  }

  if (resp && !resp.windowClosed) {
    BrowserRuntimeExtension.closeWindow(resp.window.id);
  }

  // If the user approved and unlocked, then we're connected.
  if (didApprove) {
    const activeWallet = (await ctx.backend.blockchainActiveWallets())[
      Blockchain.SOLANA
    ];
    const connectionUrl = await ctx.backend.solanaConnectionUrlRead();
    const data = { publicKey: activeWallet, connectionUrl };
    ctx.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_SOLANA_CONNECTED,
      data,
    });
    return [data];
  }

  throw new Error("user did not approve");
}

function handleSolanaDisconnect(ctx: Context<Backend>): RpcResponse<string> {
  const resp = ctx.backend.solanaDisconnect();
  ctx.events.emit(BACKEND_EVENT, {
    name: NOTIFICATION_SOLANA_DISCONNECTED,
  });
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

  throw new Error("user denied transaction signature");
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

class RequestManager {
  static _requestId = 0;
  static _responseResolvers: any = {};

  // Initiate a request. The given popupFn should relay the given requestmanagerId to
  // the UI, which will send it back with a response.
  //
  // Note that there are two ways we can receive a response.
  //
  // 1) The user can explicit perform a UI action via our components.
  // 2) The user can close the window.
  //
  public static requestUiAction<T = any>(
    popupFn: (reqId: number) => Promise<chrome.windows.Window>
  ): Promise<T> {
    return new Promise(async (resolve, reject) => {
      const requestId = RequestManager.nextRequestId();
      const window = await popupFn(requestId);
      RequestManager.addResponseResolver(
        requestId,
        (input: any) => resolve({ ...input, window }),
        reject
      );
      chrome.windows.onRemoved.addListener((windowId) => {
        if (windowId === window.id) {
          RequestManager.removeResponseResolver(requestId);
          resolve({
            // @ts-ignore
            id: requestId,
            result: undefined,
            error: undefined,
            windowClosed: true,
            window,
          });
        }
      });
    });
  }

  // Resolve a response initiated via `requestUiAction`.
  public static resolveResponse(id: number, result: any, error: any) {
    const resolver = RequestManager.getResponseResolver(id);
    if (!resolver) {
      throw new Error(`unable to find response resolver for: ${id}`);
    }

    const [resolve, _reject] = resolver;

    RequestManager.removeResponseResolver(id);

    resolve({
      id,
      result,
      error,
      windowClosed: undefined,
    });
  }

  private static addResponseResolver(
    requestId: number,
    resolve: Function,
    reject: Function
  ): number {
    RequestManager._responseResolvers[requestId] = [resolve, reject];
    return requestId;
  }

  private static nextRequestId(): number {
    const r = RequestManager._requestId;
    RequestManager._requestId += 1;
    return r;
  }

  private static getResponseResolver(requestId: number): [Function, Function] {
    return RequestManager._responseResolvers[requestId];
  }

  private static removeResponseResolver(requestId: number) {
    delete RequestManager._responseResolvers[requestId];
  }
}

async function handlePopupUiResponse(
  ctx: Context<Backend>,
  msg: RpcResponse
): Promise<string> {
  const { id, result, error } = msg;
  logger.debug("handle popup ui response", msg);
  RequestManager.resolveResponse(id, result, error);
  return SUCCESS_RESPONSE;
}
