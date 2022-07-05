// All RPC request handlers for requests that can be sent from the trusted
// extension UI to the background script.

import type {
  RpcRequest,
  RpcResponse,
  DerivationPath,
  Context,
  EventEmitter,
} from "@coral-xyz/common";
import {
  getLogger,
  withContextPort,
  ChannelAppUi,
  UI_RPC_METHOD_KEYRING_STORE_CREATE,
  UI_RPC_METHOD_KEYRING_STORE_KEEP_ALIVE,
  UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
  UI_RPC_METHOD_KEYRING_CREATE,
  UI_RPC_METHOD_KEYRING_DERIVE_WALLET,
  UI_RPC_METHOD_KEYRING_KEY_DELETE,
  UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY,
  UI_RPC_METHOD_KEYRING_EXPORT_SECRET_KEY,
  UI_RPC_METHOD_KEYRING_EXPORT_MNEMONIC,
  UI_RPC_METHOD_KEYRING_RESET_MNEMONIC,
  UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
  UI_RPC_METHOD_KEYRING_STORE_STATE,
  UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_CREATE,
  UI_RPC_METHOD_HD_KEYRING_CREATE,
  UI_RPC_METHOD_CONNECTION_URL_READ,
  UI_RPC_METHOD_CONNECTION_URL_UPDATE,
  UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLET,
  UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLET_UPDATE,
  UI_RPC_METHOD_KEYNAME_UPDATE,
  UI_RPC_METHOD_PASSWORD_UPDATE,
  UI_RPC_METHOD_KEYRING_AUTOLOCK_UPDATE,
  UI_RPC_METHOD_NAVIGATION_UPDATE,
  UI_RPC_METHOD_NAVIGATION_READ,
  UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_READ,
  UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
  UI_RPC_METHOD_SETTINGS_DARK_MODE_READ,
  UI_RPC_METHOD_SETTINGS_DARK_MODE_UPDATE,
  UI_RPC_METHOD_SOLANA_COMMITMENT_READ,
  UI_RPC_METHOD_SOLANA_COMMITMENT_UPDATE,
  UI_RPC_METHOD_SIGN_TRANSACTION,
  UI_RPC_METHOD_SIGN_ALL_TRANSACTIONS,
  UI_RPC_METHOD_SIGN_AND_SEND_TRANSACTION,
  UI_RPC_METHOD_APPROVED_ORIGINS_READ,
  UI_RPC_METHOD_APPROVED_ORIGINS_UPDATE,
  UI_RPC_METHOD_LEDGER_CONNECT,
  UI_RPC_METHOD_LEDGER_IMPORT,
  UI_RPC_METHOD_PREVIEW_PUBKEYS,
  BACKEND_EVENT,
  CONNECTION_POPUP_RPC,
  CONNECTION_POPUP_NOTIFICATIONS,
} from "@coral-xyz/common";
import type { KeyringStoreState } from "@coral-xyz/recoil";
import type { Backend } from "../backend/core";
import type { Config, Handle } from "../types";

const logger = getLogger("background-server-ui");

export function start(_cfg: Config, events: EventEmitter, b: Backend): Handle {
  const rpcServerUi = ChannelAppUi.server(CONNECTION_POPUP_RPC);
  const notificationsUi = ChannelAppUi.notifications(
    CONNECTION_POPUP_NOTIFICATIONS
  );

  //
  // Dispatch all notifications to the extension popup UI. This channel
  // will also handle plugins in an additional routing step.
  //
  events.on(BACKEND_EVENT, (notification) => {
    notificationsUi.pushNotification(notification);
  });

  rpcServerUi.handler(withContextPort(b, events, handle));

  return {
    rpcServerUi,
    notificationsUi,
  };
}

async function handle<T = any>(
  ctx: Context<Backend>,
  msg: RpcRequest
): Promise<RpcResponse<T>> {
  logger.debug(`handle rpc ${msg.method}`, msg);

  const { method, params } = msg;
  switch (method) {
    //
    // Keyring.
    //
    case UI_RPC_METHOD_KEYRING_STORE_CREATE:
      return await handleKeyringStoreCreate(
        ctx,
        params[0],
        params[1],
        params[2],
        params[3]
      );
    case UI_RPC_METHOD_KEYRING_STORE_UNLOCK:
      return await handleKeyringStoreUnlock(ctx, params[0]);
    case UI_RPC_METHOD_KEYRING_STORE_LOCK:
      return await handleKeyringStoreLock(ctx);
    case UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS:
      return await handleKeyringStoreReadAllPubkeys(ctx);
    case UI_RPC_METHOD_HD_KEYRING_CREATE:
      return await handleHdKeyringCreate(ctx, params[0]);
    case UI_RPC_METHOD_KEYRING_CREATE:
      return await handleKeyringCreate(ctx, params[0]);
    case UI_RPC_METHOD_KEYRING_KEY_DELETE:
      return await handleKeyringKeyDelete(ctx, params[0]);
    case UI_RPC_METHOD_KEYRING_STORE_STATE:
      return await handleKeyringStoreState(ctx);
    case UI_RPC_METHOD_KEYRING_STORE_KEEP_ALIVE:
      return handleKeyringStoreKeepAlive(ctx);
    case UI_RPC_METHOD_KEYRING_DERIVE_WALLET:
      return await handleKeyringDeriveWallet(ctx);
    case UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY:
      return await handleKeyringImportSecretKey(ctx, params[0], params[1]);
    case UI_RPC_METHOD_KEYRING_EXPORT_SECRET_KEY:
      return handleKeyringExportSecretKey(ctx, params[0], params[1]);
    case UI_RPC_METHOD_KEYRING_EXPORT_MNEMONIC:
      return handleKeyringExportMnemonic(ctx, params[0]);
    case UI_RPC_METHOD_KEYRING_RESET_MNEMONIC:
      return handleKeyringResetMnemonic(ctx, params[0]);
    case UI_RPC_METHOD_KEYRING_AUTOLOCK_UPDATE:
      return await handleKeyringAutolockUpdate(ctx, params[0]);
    case UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_CREATE:
      return await handleMnemonicCreate(ctx, params[0]);
    case UI_RPC_METHOD_PREVIEW_PUBKEYS:
      return await handlePreviewPubkeys(ctx, params[0], params[1], params[2]);
    //
    // Ledger.
    //
    case UI_RPC_METHOD_LEDGER_CONNECT:
      return await handleLedgerConnect(ctx);
    case UI_RPC_METHOD_LEDGER_IMPORT:
      return await handleKeyringLedgerImport(
        ctx,
        params[0],
        params[1],
        params[2]
      );
    //
    // Wallet signing.
    //
    case UI_RPC_METHOD_SIGN_TRANSACTION:
      return await handleSignTransaction(ctx, params[0], params[1]);
    case UI_RPC_METHOD_SIGN_ALL_TRANSACTIONS:
      return await handleSignAllTransactions(ctx, params[0], params[1]);
    case UI_RPC_METHOD_SIGN_AND_SEND_TRANSACTION:
      return await handleSignAndSendTransaction(ctx, params[0], params[1]);
    //
    // Connection URL.
    //
    case UI_RPC_METHOD_CONNECTION_URL_READ:
      return await handleConnectionUrlRead(ctx);
    case UI_RPC_METHOD_CONNECTION_URL_UPDATE:
      return await handleConnectionUrlUpdate(ctx, params[0]);
    //
    // Navigation.
    //
    case UI_RPC_METHOD_NAVIGATION_UPDATE:
      return await handleNavigationUpdate(ctx, params[0]);
    case UI_RPC_METHOD_NAVIGATION_READ:
      return await handleNavigationRead(ctx, params[0]);
    case UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_READ:
      return await handleNavigationActiveTabRead(ctx);
    case UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE:
      return await handleNavigationActiveTabUpdate(ctx, params[0]);
    //
    // Wallet app settings.
    //
    case UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLET:
      return await handleWalletDataActiveWallet(ctx);
    case UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLET_UPDATE:
      return await handleWalletDataActiveWalletUpdate(ctx, params[0]);
    case UI_RPC_METHOD_SETTINGS_DARK_MODE_READ:
      return await handleDarkModeRead(ctx);
    case UI_RPC_METHOD_SETTINGS_DARK_MODE_UPDATE:
      return await handleDarkModeUpdate(ctx, params[0]);
    case UI_RPC_METHOD_APPROVED_ORIGINS_READ:
      return await handleApprovedOriginsRead(ctx);
    case UI_RPC_METHOD_APPROVED_ORIGINS_UPDATE:
      return await handleApprovedOriginsUpdate(ctx, params[0]);
    //
    // Nicknames for keys.
    //
    case UI_RPC_METHOD_KEYNAME_UPDATE:
      return await handleKeynameUpdate(ctx, params[0], params[1]);
    case UI_RPC_METHOD_PASSWORD_UPDATE:
      return await handlePasswordUpdate(ctx, params[0], params[1]);
    //
    // Solana.
    //
    case UI_RPC_METHOD_SOLANA_COMMITMENT_READ:
      return await handleSolanaCommitmentRead(ctx);
    case UI_RPC_METHOD_SOLANA_COMMITMENT_UPDATE:
      return await handleSolanaCommitmentUpdate(ctx, params[0]);
    default:
      throw new Error(`unexpected ui rpc method: ${method}`);
  }
}

async function handleKeyringStoreCreate(
  ctx: Context<Backend>,
  mnemonic: string,
  derivationPath: DerivationPath,
  password: string,
  accountIndices = [0]
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.keyringStoreCreate(
    mnemonic,
    derivationPath,
    password,
    accountIndices
  );
  return [resp];
}

async function handleKeyringStoreUnlock(
  ctx: Context<Backend>,
  password: string
) {
  try {
    const resp = await ctx.backend.keyringStoreUnlock(password);
    return [resp];
  } catch (err) {
    return [undefined, String(err)];
  }
}

async function handleKeyringStoreLock(ctx: Context<Backend>) {
  const resp = ctx.backend.keyringStoreLock();
  return [resp];
}

async function handleHdKeyringCreate(
  ctx: Context<Backend>,
  mnemonic: string
): Promise<RpcResponse<string>> {
  const resp = ctx.backend.hdKeyringCreate(mnemonic);
  return [resp];
}

async function handleKeyringCreate(
  ctx: Context<Backend>,
  secretKey: string
): Promise<RpcResponse<string>> {
  const resp = ctx.backend.keyringCreate(secretKey);
  return [resp];
}

async function handleKeyringStoreState(
  ctx: Context<Backend>
): Promise<RpcResponse<KeyringStoreState>> {
  const resp = await ctx.backend.keyringStoreState();
  return [resp];
}

function handleKeyringStoreKeepAlive(
  ctx: Context<Backend>
): RpcResponse<string> {
  const resp = ctx.backend.keyringStoreKeepAlive();
  return [resp];
}

async function handleConnectionUrlRead(
  ctx: Context<Backend>
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.connectionUrlRead();
  return [resp];
}

async function handleConnectionUrlUpdate(
  ctx: Context<Backend>,
  url: string
): Promise<RpcResponse<boolean>> {
  const didChange = await ctx.backend.connectionUrlUpdate(url);
  return [didChange];
}

async function handleWalletDataActiveWallet(
  ctx: Context<Backend>
): Promise<RpcResponse<string>> {
  const pubkey = await ctx.backend.activeWallet();
  return [pubkey];
}

async function handleWalletDataActiveWalletUpdate(
  ctx: Context<Backend>,
  newWallet: string
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.activeWalletUpdate(newWallet);
  return [resp];
}

async function handleKeyringStoreReadAllPubkeys(
  ctx: Context<Backend>
): Promise<RpcResponse<Array<string>>> {
  const resp = await ctx.backend.keyringStoreReadAllPubkeys();
  return [resp];
}

async function handleKeyringDeriveWallet(
  ctx: Context<Backend>
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.keyringDeriveWallet();
  return [resp];
}

async function handleKeynameUpdate(
  ctx: Context<Backend>,
  pubkey: string,
  newName: string
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.keynameUpdate(pubkey, newName);
  return [resp];
}

async function handleKeyringKeyDelete(
  ctx: Context<Backend>,
  pubkey: string
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.keyringKeyDelete(pubkey);
  return [resp];
}

async function handlePasswordUpdate(
  ctx: Context<Backend>,
  currentPassword: string,
  newPassword: string
): Promise<RpcResponse<string>> {
  try {
    const resp = await ctx.backend.passwordUpdate(currentPassword, newPassword);
    return [resp];
  } catch (err: any) {
    return [undefined, String(err)];
  }
}

async function handleKeyringImportSecretKey(
  ctx: Context<Backend>,
  secretKey: string,
  name: string
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.importSecretKey(secretKey, name);
  return [resp];
}

function handleKeyringExportSecretKey(
  ctx: Context<Backend>,
  password: string,
  pubkey: string
): RpcResponse<string> {
  const resp = ctx.backend.keyringExportSecretKey(password, pubkey);
  return [resp];
}

function handleKeyringExportMnemonic(
  ctx: Context<Backend>,
  password: string
): RpcResponse<string> {
  const resp = ctx.backend.keyringExportMnemonic(password);
  return [resp];
}

function handleKeyringResetMnemonic(
  ctx: Context<Backend>,
  password: string
): RpcResponse<string> {
  const resp = ctx.backend.keyringResetMnemonic(password);
  return [resp];
}

async function handleKeyringAutolockUpdate(
  ctx: Context<Backend>,
  autolockSecs: number
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.keyringAutolockUpdate(autolockSecs);
  return [resp];
}

async function handleMnemonicCreate(
  ctx: Context<Backend>,
  strength = 256
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.mnemonicCreate(strength);
  return [resp];
}

async function handleNavigationUpdate(
  ctx: Context<Backend>,
  navData: any
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.navigationUpdate(navData);
  return [resp];
}

async function handleNavigationRead(
  ctx: Context<Backend>,
  nav: string
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.navigationRead(nav);
  return [resp];
}

async function handleNavigationActiveTabRead(
  ctx: Context<Backend>
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.navigationActiveTabRead();
  return [resp];
}

async function handleNavigationActiveTabUpdate(
  ctx: Context<Backend>,
  tabKey: string
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.navigationActiveTabUpdate(tabKey);
  return [resp];
}

async function handleDarkModeRead(
  ctx: Context<Backend>
): Promise<RpcResponse<boolean>> {
  const resp = await ctx.backend.darkModeRead();
  return [resp];
}

async function handleDarkModeUpdate(
  ctx: Context<Backend>,
  darkMode: boolean
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.darkModeUpdate(darkMode);
  return [resp];
}

async function handleSolanaCommitmentRead(
  ctx: Context<Backend>
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.solanaCommitmentRead();
  return [resp];
}

async function handleSolanaCommitmentUpdate(
  ctx: Context<Backend>,
  commitment: string
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.solanaCommitmentUpdate(commitment);
  return [resp];
}

async function handleSignTransaction(
  ctx: Context<Backend>,
  messageBs58: string,
  walletAddress: string
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.signTransaction(messageBs58, walletAddress);
  return [resp];
}

async function handleSignAllTransactions(
  ctx: Context<Backend>,
  txs: Array<string>,
  walletAddress: string
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.signAllTransactions(txs, walletAddress);
  return [resp];
}

async function handleSignAndSendTransaction(
  ctx: Context<Backend>,
  tx: string,
  walletAddress: string
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.signAndSendTx(tx, walletAddress);
  return [resp];
}

async function handleApprovedOriginsRead(
  ctx: Context<Backend>
): Promise<RpcResponse<Array<string>>> {
  const resp = await ctx.backend.approvedOriginsRead();
  return [resp];
}

async function handleApprovedOriginsUpdate(
  ctx: Context<Backend>,
  approvedOrigins: Array<string>
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.approvedOriginsUpdate(approvedOrigins);
  return [resp];
}

async function handleLedgerConnect(ctx: Context<Backend>) {
  const resp = await ctx.backend.ledgerConnect();
  return [resp];
}

async function handleKeyringLedgerImport(
  ctx: Context<Backend>,
  dPath: string,
  account: number,
  pubkey: string
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.ledgerImport(dPath, account, pubkey);
  return [resp];
}

async function handlePreviewPubkeys(
  ctx: Context<Backend>,
  mnemonic: string,
  derivationPath: DerivationPath,
  numberOfAccounts: number
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.previewPubkeys(
    mnemonic,
    derivationPath,
    numberOfAccounts
  );
  return [resp];
}
