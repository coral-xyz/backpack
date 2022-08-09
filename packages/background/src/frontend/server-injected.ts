// All RPC request handlers for requests that can be sent from the injected
// provider script to the background script.

import * as bs58 from "bs58";
import type { SendOptions, Commitment } from "@solana/web3.js";
import { Transaction } from "@solana/web3.js";
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
  openApproveMessagePopupWindow,
  RPC_METHOD_CONNECT,
  RPC_METHOD_DISCONNECT,
  RPC_METHOD_SIGN_AND_SEND_TX,
  RPC_METHOD_SIGN_TX,
  RPC_METHOD_SIGN_ALL_TXS,
  RPC_METHOD_SIGN_MESSAGE,
  RPC_METHOD_SIMULATE,
  NOTIFICATION_CONNECTED,
  NOTIFICATION_DISCONNECTED,
  CHANNEL_RPC_REQUEST,
  CHANNEL_NOTIFICATION,
  CONNECTION_POPUP_RESPONSE,
  BACKEND_EVENT,
  NOTIFICATION_CONNECTION_URL_UPDATED,
} from "@coral-xyz/common";
import type { Backend } from "../backend/core";
import { SUCCESS_RESPONSE } from "../backend/core";
import type { Config, Handle } from "../types";

const logger = getLogger("server-injected");

export function start(cfg: Config, events: EventEmitter, b: Backend): Handle {
  if (cfg.isMobile) {
    return null;
  }
  const rpcServerInjected = ChannelContentScript.server(CHANNEL_RPC_REQUEST);
  const notificationsInjected =
    ChannelContentScript.client(CHANNEL_NOTIFICATION);
  const popupUiResponse = ChannelAppUi.server(CONNECTION_POPUP_RESPONSE);

  //
  // Dispatch notifications to injected web apps.
  //
  events.on(BACKEND_EVENT, (notification) => {
    switch (notification.name) {
      case NOTIFICATION_CONNECTION_URL_UPDATED:
        notificationsInjected.sendMessageActiveTab(notification);
        break;
      case NOTIFICATION_CONNECTED:
        notificationsInjected.sendMessageActiveTab(notification);
        break;
      case NOTIFICATION_DISCONNECTED:
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
    popupUiResponse,
    notificationsInjected,
  };
}

async function handle<T = any>(
  ctx: Context<Backend>,
  req: RpcRequest
): Promise<RpcResponse<T>> {
  logger.debug(`handle rpc ${req.method}`, req);

  const { method, params } = req;
  switch (method) {
    case RPC_METHOD_CONNECT:
      return await handleConnect(ctx);
    case RPC_METHOD_DISCONNECT:
      return handleDisconnect(ctx);
    case RPC_METHOD_SIGN_AND_SEND_TX:
      return await handleSignAndSendTx(ctx, params[0], params[1], params[2]);
    case RPC_METHOD_SIGN_TX:
      return await handleSignTx(ctx, params[0], params[1]);
    case RPC_METHOD_SIGN_ALL_TXS:
      return await handleSignAllTxs(ctx, params[0], params[1]);
    case RPC_METHOD_SIGN_MESSAGE:
      return await handleSignMessage(ctx, params[0], params[1]);
    case RPC_METHOD_SIMULATE:
      return await handleSimulate(ctx, params[0], params[1], params[2]);
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
async function handleConnect(
  ctx: Context<Backend>
): Promise<RpcResponse<string>> {
  const origin = ctx.sender.origin;
  const keyringStoreState = await ctx.backend.keyringStoreState();
  let didApprove = false;

  // Use the UI to ask the user if it should connect.
  if (keyringStoreState === "unlocked") {
    if (await ctx.backend.isApprovedOrigin(origin)) {
      logger.debug("already approved so automatically connecting");
      didApprove = true;
    } else {
      const resp = await RequestManager.requestUiAction((requestId: number) => {
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
      const resp = await RequestManager.requestUiAction((requestId: number) => {
        return openLockedPopupWindow(
          ctx.sender.origin,
          ctx.sender.tab.title,
          requestId
        );
      });
      didApprove = !resp.windowClosed && resp.result;
    } else {
      const resp = await RequestManager.requestUiAction((requestId: number) => {
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

  // If the user approved and unlocked, then we're connected.
  if (didApprove) {
    const activeWallet = await ctx.backend.activeWallet();
    const connectionUrl = await ctx.backend.solanaConnectionUrlRead();
    const data = { publicKey: activeWallet, connectionUrl };
    ctx.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_CONNECTED,
      data,
    });
    return [data];
  }

  throw new Error("user did not approve");
}

function handleDisconnect(ctx: Context<Backend>): RpcResponse<string> {
  const resp = ctx.backend.disconnect();
  ctx.events.emit(BACKEND_EVENT, {
    name: NOTIFICATION_DISCONNECTED,
  });
  return [resp];
}

async function handleSignAndSendTx(
  ctx: Context<Backend>,
  tx: string,
  walletAddress: string,
  options?: SendOptions
): Promise<RpcResponse<string>> {
  // Transform from transaction string to message string.
  const txObject = Transaction.from(bs58.decode(tx));
  const txMsg = bs58.encode(txObject.serializeMessage());

  // Get user approval.
  const uiResp = await RequestManager.requestUiAction((requestId: number) => {
    return openApproveTransactionPopupWindow(
      ctx.sender.origin,
      requestId,
      txMsg
    );
  });
  const didApprove = uiResp.result;

  // Only sign if the user clicked approve.
  if (didApprove) {
    const sig = await ctx.backend.signAndSendTx(tx, walletAddress, options);
    return [sig];
  }

  throw new Error("user denied transaction signature");
}

async function handleSignTx(
  ctx: Context<Backend>,
  txMsg: string,
  walletAddress: string
): Promise<RpcResponse<string>> {
  const uiResp = await RequestManager.requestUiAction((requestId: number) => {
    return openApproveTransactionPopupWindow(
      ctx.sender.origin,
      requestId,
      txMsg
    );
  });
  const didApprove = uiResp.result;

  // Only sign if the user clicked approve.
  if (didApprove) {
    const sig = await ctx.backend.signTransaction(txMsg, walletAddress);
    return [sig];
  }

  throw new Error("user denied transaction signature");
}

async function handleSignAllTxs(
  ctx: Context<Backend>,
  txs: Array<string>,
  walletAddress: string
): Promise<RpcResponse<Array<string>>> {
  throw new Error("not implemented");
  //  const resp = await ctx.backend.signAllTransactions(txs, walletAddress);
  //  return [resp];
}

async function handleSignMessage(
  ctx: Context<Backend>,
  msg: string,
  walletAddress: string
): Promise<RpcResponse<string>> {
  const uiResp = await RequestManager.requestUiAction((requestId: number) => {
    return openApproveMessagePopupWindow(ctx.sender.origin, requestId, msg);
  });
  const didApprove = uiResp.result;

  if (didApprove) {
    const sig = await ctx.backend.signMessage(msg, walletAddress);
    return [sig];
  }

  throw new Error("user denied message signature");
}

async function handleSimulate(
  ctx: Context<Backend>,
  txStr: string,
  walletAddress: string,
  commitment: Commitment
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.simulate(txStr, walletAddress, commitment);
  return [resp];
}

class RequestManager {
  static _requestId = 0;
  static _responseResolvers: any = {};

  // Initiate a request. The given popupFn should relay the given requestId to
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
      const requestId = RequestManager.addResponseResolver(resolve, reject);
      const window = await popupFn(requestId);
      chrome.windows.onRemoved.addListener((windowId) => {
        if (windowId === window.id) {
          RequestManager.removeResponseResolver(requestId);
          resolve({
            // @ts-ignore
            id: requestId,
            result: undefined,
            error: undefined,
            windowClosed: true,
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

    const [resolve, reject] = resolver;

    RequestManager.removeResponseResolver(id);

    if (error) {
      reject(error);
    }

    resolve({
      id,
      result,
      error,
      windowClosed: undefined,
    });
  }

  private static addResponseResolver(
    resolve: Function,
    reject: Function
  ): number {
    const requestId = RequestManager.nextRequestId();
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
