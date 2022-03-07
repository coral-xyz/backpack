import {
  debug,
  Channel,
  PortChannel,
  NotificationsClient,
  openPopupWindow,
  RpcRequest,
  RpcResponse,
  CHANNEL_RPC_REQUEST,
  CHANNEL_NOTIFICATION,
  RPC_METHOD_CONNECT,
  RPC_METHOD_DISCONNECT,
  RPC_METHOD_SIGN_AND_SEND_TX,
  RPC_METHOD_SIGN_MESSAGE,
  UI_RPC_METHOD_NOTIFICATIONS_SUBSCRIBE,
  UI_RPC_METHOD_KEYRING_STORE_CREATE,
  UI_RPC_METHOD_KEYRING_STORE_KEEP_ALIVE,
  UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
  UI_RPC_METHOD_KEYRING_CREATE,
  UI_RPC_METHOD_HD_KEYRING_CREATE,
  UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
  UI_RPC_METHOD_KEYRING_STORE_STATE,
  UI_RPC_METHOD_CONNECTION_URL_READ,
  UI_RPC_METHOD_CONNECTION_URL_UPDATE,
  UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLET,
  NOTIFICATION_CONNECTED,
  NOTIFICATION_DISCONNECTED,
  NOTIFICATION_CONNECTION_URL_UPDATED,
  CONNECTION_POPUP_RPC,
  CONNECTION_POPUP_NOTIFICATIONS,
} from "../common";
import { Context, Backend } from "./backend";
import { DerivationPath } from "../keyring/crypto";
import { KeyringStoreState } from "../keyring/store";

// Channel to send notifications from the background to the injected script.
const notificationsInjected = Channel.client(CHANNEL_NOTIFICATION);

// Server receiving rpc requests from the injected script.
const rpcServerInjected = Channel.server(CHANNEL_RPC_REQUEST);

// Server rceiving rpc requests from the extension UI.
const rpcServerUi = PortChannel.server(CONNECTION_POPUP_RPC);

// Client to send notifications from the background script to the extension UI.
// This should only be created *after* the UI explicitly asks for it.
const notificationsUi = new NotificationsClient(CONNECTION_POPUP_NOTIFICATIONS);

// Backend implementation. Handles business logic of RPC requests.
const backend = new Backend(notificationsUi);

function main() {
  rpcServerInjected.handler(withContext(handleRpc));
  rpcServerUi.handler(handleRpcUi);
}

async function handleRpcUi<T = any>(msg: RpcRequest): Promise<RpcResponse<T>> {
  const { method, params } = msg;
  debug(`handle rpc ${method}`);
  switch (method) {
    case UI_RPC_METHOD_NOTIFICATIONS_SUBSCRIBE:
      return handleNotificationsSubscribe();
    case UI_RPC_METHOD_KEYRING_STORE_CREATE:
      return await handleKeyringStoreCreate(params[0], params[1], params[2]);
    case UI_RPC_METHOD_KEYRING_STORE_UNLOCK:
      return await handleKeyringStoreUnlock(params[0]);
    case UI_RPC_METHOD_KEYRING_STORE_LOCK:
      return await handleKeyringStoreLock();
    case UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS:
      return await handleKeyringStoreReadAllPubkeys();
    case UI_RPC_METHOD_HD_KEYRING_CREATE:
      return await handleHdKeyringCreate(params[0]);
    case UI_RPC_METHOD_KEYRING_CREATE:
      return await handleKeyringCreate(params[0]);
    case UI_RPC_METHOD_KEYRING_STORE_STATE:
      return await handleKeyringStoreState();
    case UI_RPC_METHOD_KEYRING_STORE_KEEP_ALIVE:
      return handleKeyringStoreKeepAlive();
    case UI_RPC_METHOD_CONNECTION_URL_READ:
      return await handleConnectionUrlRead();
    case UI_RPC_METHOD_CONNECTION_URL_UPDATE:
      return await handleConnectionUrlUpdate(params[0]);
    case UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLET:
      return await handleWalletDataActiveWallet();
    default:
      throw new Error(`unexpected ui rpc method: ${method}`);
  }
}

function handleRpc<T = any>(ctx: Context, req: RpcRequest): RpcResponse<T> {
  debug(`handle rpc ${req.method}`);
  const { method, params } = req;
  switch (method) {
    case RPC_METHOD_CONNECT:
      return handleConnect(ctx, params[0]);
    case RPC_METHOD_DISCONNECT:
      return handleDisconnect(ctx);
    case RPC_METHOD_SIGN_AND_SEND_TX:
      return handleSignAndSendTx(ctx, params[0]);
    case RPC_METHOD_SIGN_MESSAGE:
      return handleSignMessage(ctx, params[0]);
    default:
      throw new Error(`unexpected rpc method: ${method}`);
  }
}

function handleNotificationsSubscribe(): RpcResponse<string> {
  notificationsUi.connect();
  return ["success"];
}

function handleConnect(
  ctx: Context,
  onlyIfTrustedMaybe: boolean
): RpcResponse<string> {
  const resp = backend.connect(ctx, onlyIfTrustedMaybe);
  notificationsInjected.sendMessageActiveTab({
    name: NOTIFICATION_CONNECTED,
  });
  openPopupWindow();
  return [resp];
}

function handleDisconnect(ctx: Context): RpcResponse<string> {
  const resp = backend.disconnect(ctx);
  notificationsInjected.sendMessageActiveTab({
    name: NOTIFICATION_DISCONNECTED,
  });
  return [resp];
}

function handleSignAndSendTx(ctx: Context, tx: any): RpcResponse<string> {
  const resp = backend.signAndSendTx(ctx, tx);
  return [resp];
}

function handleSignMessage(ctx: Context, msg: any): RpcResponse<string> {
  const resp = backend.signMessage(ctx, msg);
  return [resp];
}

async function handleKeyringStoreCreate(
  mnemonic: string,
  derivationPath: DerivationPath,
  password: string
): Promise<RpcResponse<string>> {
  const resp = await backend.keyringStoreCreate(
    mnemonic,
    derivationPath,
    password
  );
  return [resp];
}

async function handleKeyringStoreUnlock(password: string) {
  try {
    const resp = await backend.keyringStoreUnlock(password);
    return [resp];
  } catch (err) {
    return [, err.toString()];
  }
}

async function handleKeyringStoreLock() {
  const resp = backend.keyringStoreLock();
  return [resp];
}

async function handleHdKeyringCreate(
  mnemonic: string
): Promise<RpcResponse<string>> {
  const resp = backend.hdKeyringCreate(mnemonic);
  return [resp];
}

async function handleKeyringCreate(
  secretKey: string
): Promise<RpcResponse<string>> {
  const resp = backend.keyringCreate(secretKey);
  return [resp];
}

async function handleKeyringStoreState(): Promise<
  RpcResponse<KeyringStoreState>
> {
  const resp = await backend.keyringStoreState();
  return [resp];
}

function handleKeyringStoreKeepAlive(): RpcResponse<string> {
  const resp = backend.keyringStoreKeepAlive();
  return [resp];
}

async function handleConnectionUrlRead(): Promise<RpcResponse<string>> {
  const resp = await backend.connectionUrlRead();
  return [resp];
}

async function handleConnectionUrlUpdate(
  url: string
): Promise<RpcResponse<boolean>> {
  const didChange = await backend.connectionUrlUpdate(url);
  if (didChange) {
    notificationsInjected.sendMessageActiveTab({
      name: NOTIFICATION_CONNECTION_URL_UPDATED,
      data: url,
    });
  }
  return [didChange];
}

async function handleWalletDataActiveWallet(): Promise<RpcResponse<string>> {
  const pubkey = await backend.activeWallet();
  return [pubkey];
}

async function handleKeyringStoreReadAllPubkeys(): Promise<
  RpcResponse<Array<string>>
> {
  const resp = await backend.keyringStoreReadAllPubkeys();
  return [resp];
}

// Utility to transform the handler API into something a little more friendly.
function withContext(
  handler: (ctx: Context, req: RpcRequest) => RpcResponse
): ({ data }: { data: RpcRequest }, sender: any) => RpcResponse {
  return ({ data }: { data: RpcRequest }, sender: any) => {
    const ctx = { sender };
    return handler(ctx, data);
  };
}

main();
