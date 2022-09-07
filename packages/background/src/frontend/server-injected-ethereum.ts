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
  ETHEREUM_RPC_METHOD_CONNECT,
  ETHEREUM_RPC_METHOD_DISCONNECT,
  ETHEREUM_RPC_METHOD_SIGN_TX,
  ETHEREUM_RPC_METHOD_SIGN_AND_SEND_TX,
  ETHEREUM_RPC_METHOD_SIGN_MESSAGE,
  CHANNEL_ETHEREUM_RPC_REQUEST,
  CHANNEL_ETHEREUM_NOTIFICATION,
  CHANNEL_POPUP_RESPONSE,
  BACKEND_EVENT,
  NOTIFICATION_ETHEREUM_ACTIVE_WALLET_UPDATED,
  NOTIFICATION_ETHEREUM_CONNECTED,
  NOTIFICATION_ETHEREUM_DISCONNECTED,
  NOTIFICATION_ETHEREUM_CONNECTION_URL_UPDATED,
} from "@coral-xyz/common";
import { handlePopupUiResponse, RequestManager } from "./common";
import type { Config, Handle } from "../types";
import type { Backend } from "../backend/core";

const logger = getLogger("server-injected-ethereum");

export function start(cfg: Config, events: EventEmitter, b: Backend): Handle {
  if (cfg.isMobile) {
    return null;
  }
  const ethereumRpcServerInjected = ChannelContentScript.server(
    CHANNEL_ETHEREUM_RPC_REQUEST
  );
  const notificationsInjected = ChannelContentScript.client(
    CHANNEL_ETHEREUM_NOTIFICATION
  );
  const popupUiResponse = ChannelAppUi.server(CHANNEL_POPUP_RESPONSE);

  //
  // Dispatch notifications to injected web apps.
  //
  events.on(BACKEND_EVENT, (notification) => {
    switch (notification.name) {
      case NOTIFICATION_ETHEREUM_CONNECTED:
        notificationsInjected.sendMessageActiveTab(notification);
        break;
      case NOTIFICATION_ETHEREUM_DISCONNECTED:
        notificationsInjected.sendMessageActiveTab(notification);
        break;
      case NOTIFICATION_ETHEREUM_ACTIVE_WALLET_UPDATED:
        notificationsInjected.sendMessageActiveTab(notification);
        break;
      case NOTIFICATION_ETHEREUM_CONNECTION_URL_UPDATED:
        notificationsInjected.sendMessageActiveTab(notification);
        break;
      default:
        break;
    }
  });

  ethereumRpcServerInjected.handler(withContext(b, events, handle));
  popupUiResponse.handler(withContextPort(b, events, handlePopupUiResponse));

  return {
    ethereumRpcServerInjected,
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
    case ETHEREUM_RPC_METHOD_CONNECT:
      return await handleEthereumConnect(ctx);
    /**
    case ETHEREUM_RPC_METHOD_DISCONNECT:
      return handleEthereumDisconnect(ctx);
    case ETHEREUM_RPC_METHOD_SIGN_MESSAGE:
      return await handleEthereumSignMessage(ctx, params[0], params[1]);
    case ETHEREUM_RPC_METHOD_SIGN_TX:
      return await handleEthereumSignTx(ctx, params[0], params[1]);
    case ETHEREUM_RPC_METHOD_SIGN_AND_SEND_TX:
      return await handleEthereumSignAndSendTx(
        ctx,
        params[0],
        params[1],
        params[2]
      );
        **/
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
async function handleEthereumConnect(
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
      Blockchain.ETHEREUM
    ];
    const connectionUrl = await ctx.backend.ethereumConnectionUrlRead();
    const data = { publicKey: activeWallet, connectionUrl };
    await ctx.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_ETHEREUM_CONNECTED,
      data,
    });
    return [data];
  }

  throw new Error("user did not approve");
}
