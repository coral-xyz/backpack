// DO NOT ADD ANYTHING NEW TO THIS FILE.
// Its replaced by the secure-* stack and will be completely removed asap.

// To add/update user preferences use: userClient.updateUserPreferences();

//             uuuuuuuuuuuuuuuuuuuu
//           u" uuuuuuuuuuuuuuuuuu "u
//         u" u$$$$$$$$$$$$$$$$$$$$u "u
//       u" u$$$$$$$$$$$$$$$$$$$$$$$$u "u
//     u" u$$$$$$$$$$$$$$$$$$$$$$$$$$$$u "u
//   u" u$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$u "u
// u" u$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$u "u
// $ $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ $
// $ $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ $
// $ $$$" ... "$...  ...$" ... "$$$  ... "$$$ $
// $ $$$u `"$$$$$$$  $$$  $$$$$  $$  $$$  $$$ $
// $ $$$$$$uu "$$$$  $$$  $$$$$  $$  """ u$$$ $
// $ $$$""$$$  $$$$  $$$u "$$$" u$$  $$$$$$$$ $
// $ $$$$....,$$$$$..$$$$$....,$$$$..$$$$$$$$ $
// $ $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ $
// "u "$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$" u"
//   "u "$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$" u"
//     "u "$$$$$$$$$$$$$$$$$$$$$$$$$$$$" u"
//       "u "$$$$$$$$$$$$$$$$$$$$$$$$" u"
//         "u "$$$$$$$$$$$$$$$$$$$$" u"
//           "u """""""""""""""""" u"
//             """"""""""""""""""""

// All RPC request handlers for requests that can be sent from the injected
// provider script to the background script.

import type {
  Context,
  EventEmitter,
  RpcRequest,
  RpcResponse,
} from "@coral-xyz/common";
import {
  BACKEND_EVENT,
  Blockchain,
  BrowserRuntimeExtension,
  CHANNEL_ETHEREUM_NOTIFICATION,
  CHANNEL_ETHEREUM_RPC_REQUEST,
  CHANNEL_POPUP_RESPONSE,
  CHANNEL_SOLANA_NOTIFICATION,
  CHANNEL_SOLANA_RPC_REQUEST,
  ChannelAppUi,
  ChannelContentScript,
  CONTENT_SCRIPT_KEEP_ALIVE,
  ETHEREUM_RPC_METHOD_CONNECT,
  ETHEREUM_RPC_METHOD_DISCONNECT,
  ETHEREUM_RPC_METHOD_SIGN_AND_SEND_TX,
  ETHEREUM_RPC_METHOD_SIGN_MESSAGE,
  ETHEREUM_RPC_METHOD_SIGN_TX,
  ETHEREUM_RPC_METHOD_SWITCH_CHAIN,
  getLogger,
  NOTIFICATION_ACTIVE_WALLET_UPDATED,
  NOTIFICATION_CONNECTION_URL_UPDATED,
  NOTIFICATION_ETHEREUM_CHAIN_ID_UPDATED,
  NOTIFICATION_ETHEREUM_CONNECTED,
  NOTIFICATION_ETHEREUM_DISCONNECTED,
  NOTIFICATION_SOLANA_CONNECTED,
  NOTIFICATION_SOLANA_DISCONNECTED,
  openApprovalPopupWindow,
  openApproveAllTransactionsPopupWindow,
  openApproveMessagePopupWindow,
  openApproveTransactionPopupWindow,
  openLockedApprovalPopupWindow,
  openLockedPopupWindow,
  openOnboarding,
  openPopupWindow,
  SOLANA_RPC_METHOD_CONNECT,
  SOLANA_RPC_METHOD_DISCONNECT,
  SOLANA_RPC_METHOD_OPEN_XNFT,
  SOLANA_RPC_METHOD_SIGN_ALL_TXS,
  SOLANA_RPC_METHOD_SIGN_AND_SEND_TX,
  SOLANA_RPC_METHOD_SIGN_MESSAGE,
  SOLANA_RPC_METHOD_SIGN_TX,
  SOLANA_RPC_METHOD_SIMULATE,
  TAB_XNFT,
  UiActionRequestManager,
  withContext,
  withContextPort,
} from "@coral-xyz/common";
import {
  EthereumChainIds,
  EthereumConnectionUrl,
} from "@coral-xyz/secure-background/legacyCommon";
import type { SendOptions } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";

import type { Backend } from "../backend/core";
import { SUCCESS_RESPONSE } from "../backend/core";
import type { Config, Handle } from "../types";

const logger = getLogger("server-injected");

const whitelistedOrigins = [
  /^https:\/\/one-nft\.vercel\.app$/,
  /^https:\/\/xnft\.wao\.gg$/,
  /^https:\/\/one\.xnfts\.dev$/,
  /^https:\/\/madlads\.com$/,
  /^https:\/\/rafffle\.famousfoxes\.com$/,
];

if (process.env.NODE_ENV === "development") {
  whitelistedOrigins.push(/^http:\/\/localhost:[0-9]{4}$/);
}

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
      case NOTIFICATION_ETHEREUM_CHAIN_ID_UPDATED:
        ethereumNotificationsInjected.sendMessageActiveTab(notification);
        break;
      case NOTIFICATION_SOLANA_CONNECTED:
        solanaNotificationsInjected.sendMessageActiveTab(notification);
        break;
      case NOTIFICATION_SOLANA_DISCONNECTED:
        solanaNotificationsInjected.sendMessageActiveTab(notification);
        break;
      case NOTIFICATION_ACTIVE_WALLET_UPDATED:
        // TODO: generalize this some more.
        solanaNotificationsInjected.sendMessageActiveTab(notification);
        ethereumNotificationsInjected.sendMessageActiveTab(notification);
        break;
      case NOTIFICATION_CONNECTION_URL_UPDATED:
        // TODO: generalize this some more.
        ethereumNotificationsInjected.sendMessageActiveTab(notification);
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

  if (method === CONTENT_SCRIPT_KEEP_ALIVE) {
    return ["success"];
  }

  //
  // Connection requests can come from any origin. All other requests *must*
  // come from an approved origin.
  //
  if (
    method !== ETHEREUM_RPC_METHOD_CONNECT &&
    method !== SOLANA_RPC_METHOD_CONNECT
  ) {
    const origin = ctx.sender.origin;
    if (origin === undefined) {
      return [undefined, "origin is undefined"];
    }
    const isApproved = await ctx.backend.isApprovedOrigin(origin);
    if (
      !isApproved &&
      !whitelistedOrigins.find((wlOrigin) => wlOrigin.test(origin))
    ) {
      return [undefined, `${origin} is not an approved origin`];
    }
  }

  switch (method) {
    case ETHEREUM_RPC_METHOD_SWITCH_CHAIN:
      return await handleEthereumSwitchChain(ctx, params[0]);
    case SOLANA_RPC_METHOD_OPEN_XNFT:
      return await handleSolanaOpenXnft(ctx, params[0]);
    default:
      throw new Error(`unexpected rpc method: ${method}`);
  }
}

// Locks for limiting requests to one per origin
const locks = new Set();

async function handleSolanaOpenXnft(
  ctx: Context<Backend>,
  xnftAddress: string
): Promise<RpcResponse<string>> {
  // Validate the xnftAddress.
  try {
    new PublicKey(xnftAddress);
  } catch (err) {
    throw new Error("invalid xnft address");
  }

  const url = `xnft/${xnftAddress}`;
  await ctx.backend.navigationPush(url, TAB_XNFT);
  await openPopupWindow(`popup.html`);
  return ["success"];
}

async function handleEthereumSwitchChain(
  ctx: Context<Backend>,
  chainId: string
): Promise<RpcResponse<string>> {
  if (ctx.sender.origin === undefined) {
    throw new Error("origin is undefined");
  }

  const chainName: string | undefined = EthereumChainIds[chainId];

  const url = chainName ? EthereumConnectionUrl[chainName] : undefined;

  if (!url) {
    throw new Error("Unsupported Chain: " + chainId);
  }

  const uiResp = await UiActionRequestManager.requestUiAction(
    (requestId: string) => {
      return openApproveMessagePopupWindow(
        ctx.sender.origin!,
        getTabTitle(ctx),
        requestId,
        `Switch to ${chainName} (${chainId})?`,
        "walletAddress",
        Blockchain.ETHEREUM
      );
    }
  );

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
      await ctx.backend.connectionUrlUpdate(url, Blockchain.ETHEREUM);
      resp = await ctx.backend.ethereumChainIdUpdate(chainId);
    }
  } catch (err) {
    logger.debug("error updating blockchain", err.toString());
  }

  if (!uiResp.windowClosed) {
    BrowserRuntimeExtension.closeWindow(uiResp.window.id);
  }
  if (resp) {
    return resp;
  }
}

async function handlePopupUiResponse(
  ctx: Context<Backend>,
  msg: RpcResponse
): Promise<string> {
  const { id, result, error } = msg;
  logger.debug("handle popup ui response", msg);
  UiActionRequestManager.resolveResponse(id, result, error);
  return SUCCESS_RESPONSE;
}

function getTabTitle(ctx) {
  return ctx.sender.tab?.title ?? `Xnft from ${ctx.sender.origin}`;
}
