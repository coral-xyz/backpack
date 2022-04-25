// All RPC request handlers for requests that can be sent from the injected
// provider script to the background script.

import browser from "webextension-polyfill";
import * as bs58 from "bs58";
import { Transaction, SendOptions, Commitment } from "@solana/web3.js";
import {
  getLogger,
  BrowserRuntime,
  RpcRequest,
  RpcResponse,
  withContext,
  Context,
  RPC_METHOD_CONNECT,
  RPC_METHOD_DISCONNECT,
  RPC_METHOD_SIGN_AND_SEND_TX,
  RPC_METHOD_SIGN_TX,
  RPC_METHOD_SIGN_ALL_TXS,
  RPC_METHOD_SIGN_MESSAGE,
  RPC_METHOD_SIMULATE,
  NOTIFICATION_CONNECTED,
  NOTIFICATION_DISCONNECTED,
} from "@200ms/common";
import {
  Window,
  openLockedPopupWindow,
  openApprovalPopupWindow,
  openLockedApprovalPopupWindow,
  openApproveTransactionPopupWindow,
  openApproveMessagePopupWindow,
} from "../../common";
import { BACKEND, SUCCESS_RESPONSE } from "../backend";
import { Io } from "../io";

const logger = getLogger("server-injected");

export function start() {
  Io.rpcServerInjected.handler(withContext(handle));
  Io.popupUiResponse.handler(handlePopupUiResponse);
}

async function handle<T = any>(
  ctx: Context,
  req: RpcRequest
): Promise<RpcResponse<T>> {
  logger.debug(`handle rpc ${req.method}`);

  const { method, params } = req;
  switch (method) {
    case RPC_METHOD_CONNECT:
      return await handleConnect(ctx, params[0]);
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
  ctx: Context,
  onlyIfTrustedMaybe: boolean
): Promise<RpcResponse<string>> {
  const origin = ctx.sender.origin;
  const keyringStoreState = await BACKEND.keyringStoreState();
  const activeTab = await BrowserRuntime.activeTab();
  let didApprove = false;

  // Use the UI to ask the user if it should connect.
  if (keyringStoreState === "unlocked") {
    if (await BACKEND.isApprovedOrigin(origin)) {
      logger.debug("already approved so automatically connecting");
      didApprove = true;
    } else {
      const resp = await RequestManager.requestUiAction((requestId: number) => {
        return openApprovalPopupWindow(ctx, requestId);
      });
      didApprove = !resp.windowClosed && resp.result;
    }
  } else if (keyringStoreState === "locked") {
    if (await BACKEND.isApprovedOrigin(origin)) {
      const resp = await RequestManager.requestUiAction((requestId: number) => {
        return openLockedPopupWindow(ctx, requestId);
      });
      didApprove = !resp.windowClosed && resp.result;
    } else {
      const resp = await RequestManager.requestUiAction((requestId: number) => {
        return openLockedApprovalPopupWindow(ctx, requestId);
      });
      didApprove = !resp.windowClosed && resp.result;
    }
  } else {
    throw new Error("invariant violation keyring not created");
  }

  // If the user approved and unlocked, then we're connected.
  if (didApprove) {
    const activeWallet = await BACKEND.activeWallet();
    const connectionUrl = await BACKEND.solanaConnectionUrl();
    Io.notificationsInjected.sendMessageTab(activeTab.id, {
      name: NOTIFICATION_CONNECTED,
      data: {
        publicKey: activeWallet,
        connectionUrl,
      },
    });
  }

  return [SUCCESS_RESPONSE];
}

function handleDisconnect(ctx: Context): RpcResponse<string> {
  const resp = BACKEND.disconnect(ctx);
  Io.notificationsInjected.sendMessageActiveTab({
    name: NOTIFICATION_DISCONNECTED,
  });
  return [resp];
}

async function handleSignAndSendTx(
  ctx: Context,
  tx: string,
  walletAddress: string,
  options?: SendOptions
): Promise<RpcResponse<string>> {
  // Transform from transaction string to message string.
  const txObject = Transaction.from(bs58.decode(tx));
  const txMsg = bs58.encode(txObject.serializeMessage());

  // Get user approval.
  const uiResp = await RequestManager.requestUiAction((requestId: number) => {
    return openApproveTransactionPopupWindow(ctx, requestId, txMsg);
  });
  const didApprove = uiResp.result;

  // Only sign if the user clicked approve.
  if (didApprove) {
    const sig = await BACKEND.signAndSendTx(tx, walletAddress, options);
    return [sig];
  }

  return [null];
}

async function handleSignTx(
  ctx: Context,
  txMsg: string,
  walletAddress: string
): Promise<RpcResponse<string>> {
  const uiResp = await RequestManager.requestUiAction((requestId: number) => {
    return openApproveTransactionPopupWindow(ctx, requestId, txMsg);
  });
  const didApprove = uiResp.result;

  // Only sign if the user clicked approve.
  if (didApprove) {
    const sig = await BACKEND.signTransaction(txMsg, walletAddress);
    return [sig];
  }

  return [null];
}

async function handleSignAllTxs(
  ctx: Context,
  txs: Array<string>,
  walletAddress: string
): Promise<RpcResponse<Array<string>>> {
  const resp = BACKEND.signAllTransactions(txs, walletAddress);
  return [resp];
}

async function handleSignMessage(
  ctx: Context,
  msg: string,
  walletAddress: string
): Promise<RpcResponse<string>> {
  const uiResp = await RequestManager.requestUiAction((requestId: number) => {
    return openApproveMessagePopupWindow(ctx, requestId, msg);
  });
  const didApprove = uiResp.result;

  if (didApprove) {
    const sig = BACKEND.signMessage(ctx, msg, walletAddress);
    return [sig];
  }

  return [null];
}

async function handleSimulate(
  ctx: Context,
  txStr: string,
  walletAddress: string,
  commitment: Commitment
): Promise<RpcResponse<string>> {
  const resp = await BACKEND.simulate(txStr, walletAddress, commitment);
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
    popupFn: (reqId: number) => Promise<Window>
  ): Promise<T> {
    return new Promise(async (resolve, reject) => {
      const requestId = RequestManager.addResponseResolver(resolve, reject);
      const window = await popupFn(requestId);
      browser.windows.onRemoved.addListener((windowId) => {
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

async function handlePopupUiResponse(msg: RpcResponse): Promise<string> {
  const { id, result, error } = msg;
  logger.debug("handle popup ui response");
  RequestManager.resolveResponse(id, result, error);
  return SUCCESS_RESPONSE;
}
