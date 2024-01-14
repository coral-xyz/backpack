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
    case ETHEREUM_RPC_METHOD_CONNECT:
      return await handleConnect(ctx, Blockchain.ETHEREUM);
    case ETHEREUM_RPC_METHOD_DISCONNECT:
      return await handleDisconnect(ctx, Blockchain.ETHEREUM);
    case ETHEREUM_RPC_METHOD_SWITCH_CHAIN:
      return await handleEthereumSwitchChain(ctx, params[0]);
    case ETHEREUM_RPC_METHOD_SIGN_MESSAGE:
      return await handleEthereumSignMessage(ctx, params[0], params[1]);
    case ETHEREUM_RPC_METHOD_SIGN_TX:
      return await handleEthereumSignTx(ctx, params[0], params[1]);
    case ETHEREUM_RPC_METHOD_SIGN_AND_SEND_TX:
      return await handleEthereumSignAndSendTx(ctx, params[0], params[1]);
    case SOLANA_RPC_METHOD_CONNECT:
      return await handleConnect(ctx, Blockchain.SOLANA);
    case SOLANA_RPC_METHOD_DISCONNECT:
      return await handleDisconnect(ctx, Blockchain.SOLANA);
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
      return await handleSolanaSimulate(ctx, params[0], params[1]);
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

  if (!origin) {
    throw new Error("origin is undefined");
  }

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

  if (keyringStoreState === "locked") {
    if (await ctx.backend.isApprovedOrigin(origin)) {
      logger.debug("origin approved but need to unlock");
      resp = await UiActionRequestManager.requestUiAction(
        (requestId: string) => {
          return openLockedPopupWindow(
            origin,
            getTabTitle(ctx),
            requestId,
            blockchain
          );
        }
      );
      didApprove = !resp.windowClosed && resp.result;
    } else {
      logger.debug("origin not apporved and needs to unlock");
      resp = await UiActionRequestManager.requestUiAction(
        (requestId: string) => {
          return openLockedApprovalPopupWindow(
            origin,
            getTabTitle(ctx),
            requestId,
            blockchain
          );
        }
      );
      didApprove = !resp.windowClosed && resp.result.didApprove;
    }
  } else {
    if (await ctx.backend.isApprovedOrigin(origin)) {
      logger.debug("origin approved so automatically connecting");
      didApprove = true;
    } else {
      // Origin is not approved and wallet may or may not be locked
      logger.debug("requesting approval for origin");
      resp = await UiActionRequestManager.requestUiAction(
        (requestId: string) => {
          return openApprovalPopupWindow(
            origin,
            getTabTitle(ctx),
            requestId,
            blockchain
          );
        }
      );
      didApprove = !resp.windowClosed && resp.result.didApprove;
    }
  }

  locks.delete(origin);

  if (resp && !resp.windowClosed) {
    BrowserRuntimeExtension.closeWindow(resp.window.id);
  }

  // If the user approved and unlocked, then we're connected.
  if (didApprove) {
    const user = await ctx.backend.userRead();
    const publicKey = await ctx.backend.activeWalletForBlockchain(blockchain);
    if (blockchain === Blockchain.ETHEREUM) {
      const connectionUrl = await ctx.backend.connectionUrlRead(
        user.uuid,
        Blockchain.ETHEREUM
      );
      const chainId = await ctx.backend.ethereumChainIdRead();
      const data = {
        publicKey,
        connectionUrl,
        chainId,
      };
      ctx.events.emit(BACKEND_EVENT, {
        name: NOTIFICATION_ETHEREUM_CONNECTED,
        data,
      });
      return [data];
    } else if (blockchain === Blockchain.SOLANA) {
      const connectionUrl = await ctx.backend.connectionUrlRead(
        user.uuid,
        Blockchain.SOLANA
      );
      const data = { publicKey, connectionUrl };
      ctx.events.emit(BACKEND_EVENT, {
        name: NOTIFICATION_SOLANA_CONNECTED,
        data,
      });
      return [data];
    }
  }

  throw new Error("user did not approve");
}

async function handleDisconnect(
  ctx: Context<Backend>,
  blockchain: Blockchain
): Promise<RpcResponse<string>> {
  if (!ctx.sender.origin) {
    throw new Error("origin is undefined");
  }
  const resp = await ctx.backend.disconnect(ctx.sender.origin);
  if (blockchain === Blockchain.SOLANA) {
    ctx.events.emit(BACKEND_EVENT, {
      name: NOTIFICATION_SOLANA_DISCONNECTED,
    });
  } else if (blockchain === Blockchain.ETHEREUM) {
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
  if (ctx.sender.origin === undefined) {
    throw new Error("origin is undefined");
  }
  // Get user approval.
  const uiResp = await UiActionRequestManager.requestUiAction(
    (requestId: string) => {
      return openApproveTransactionPopupWindow(
        ctx.sender.origin!,
        getTabTitle(ctx),
        requestId,
        tx,
        walletAddress,
        Blockchain.SOLANA
      );
    }
  );

  if (uiResp.error) {
    logger.debug("require ui action error", uiResp);
    BrowserRuntimeExtension.closeWindow(uiResp.window.id);
    return;
  }

  let resp: RpcResponse<string>;
  const { didApprove, transaction } = uiResp.result
    ? uiResp.result
    : {
        didApprove: false,
        transaction: undefined,
      };

  try {
    // Only sign if the user clicked approve.
    if (didApprove) {
      const sig = await ctx.backend.solanaSignAndSendTx(
        transaction,
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
  if (ctx.sender.origin === undefined) {
    throw new Error("origin is undefined");
  }
  const uiResp = await UiActionRequestManager.requestUiAction(
    (requestId: string) => {
      return openApproveTransactionPopupWindow(
        ctx.sender.origin!,
        getTabTitle(ctx),
        requestId,
        tx,
        walletAddress,
        Blockchain.SOLANA
      );
    }
  );

  if (uiResp.error) {
    logger.debug("require ui action error", uiResp);
    BrowserRuntimeExtension.closeWindow(uiResp.window.id);
    return;
  }

  let resp: RpcResponse<string>;
  const { didApprove, transaction } = uiResp.result;

  try {
    // Only sign if the user clicked approve.
    if (didApprove) {
      const sig = await ctx.backend.solanaSignTransaction(
        transaction,
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

  throw new Error("user denied transaction signature");
}

async function handleSolanaSignAllTxs(
  ctx: Context<Backend>,
  txs: Array<string>,
  walletAddress: string
): Promise<RpcResponse<Array<string>>> {
  if (ctx.sender.origin === undefined) {
    throw new Error("origin is undefined");
  }
  const uiResp = await UiActionRequestManager.requestUiAction(
    (requestId: string) => {
      return openApproveAllTransactionsPopupWindow(
        ctx.sender.origin!,
        getTabTitle(ctx),
        requestId,
        txs,
        walletAddress,
        Blockchain.SOLANA
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
  if (ctx.sender.origin === undefined) {
    throw new Error("origin is undefined");
  }
  const uiResp = await UiActionRequestManager.requestUiAction(
    (requestId: string) => {
      return openApproveMessagePopupWindow(
        ctx.sender.origin!,
        getTabTitle(ctx),
        requestId,
        msg,
        walletAddress,
        Blockchain.SOLANA
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
  accounts: Array<string>
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.solanaSimulate(txStr, accounts);
  return [resp];
}

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

async function handleEthereumSignAndSendTx(
  ctx: Context<Backend>,
  tx: string,
  walletAddress: string
): Promise<RpcResponse<string>> {
  if (ctx.sender.origin === undefined) {
    throw new Error("origin is undefined");
  }
  // Get user approval.
  const uiResp = await UiActionRequestManager.requestUiAction(
    (requestId: string) => {
      return openApproveTransactionPopupWindow(
        ctx.sender.origin!,
        getTabTitle(ctx),
        requestId,
        tx,
        walletAddress,
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
  // The transaction may be modified and returned as result to accommodate user
  // tweaked gas settings/nonce.
  const { didApprove, transaction } = uiResp.result;
  try {
    // Only sign if the user clicked approve.
    if (didApprove) {
      const sig = await ctx.backend.ethereumSignAndSendTransaction(
        transaction,
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
  if (ctx.sender.origin === undefined) {
    throw new Error("origin is undefined");
  }
  const uiResp = await UiActionRequestManager.requestUiAction(
    (requestId: string) => {
      return openApproveTransactionPopupWindow(
        ctx.sender.origin!,
        getTabTitle(ctx),
        requestId,
        tx,
        walletAddress,
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
  // The transaction may be modified and returned as result to accommodate user
  // tweaked gas settings/nonce.
  const { didApprove } = uiResp.result;

  try {
    // Only sign if the user clicked approve.
    if (didApprove) {
      const sig = await ctx.backend.ethereumSignTransaction(tx, walletAddress);
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
  if (ctx.sender.origin === undefined) {
    throw new Error("origin is undefined");
  }
  const uiResp = await UiActionRequestManager.requestUiAction(
    (requestId: string) => {
      return openApproveMessagePopupWindow(
        ctx.sender.origin!,
        getTabTitle(ctx),
        requestId,
        msg,
        walletAddress,
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
