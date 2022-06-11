// All RPC request handlers for requests that can be sent from the trusted
// extension UI to the background script.

import {
  getLogger,
  RpcRequest,
  RpcResponse,
  DerivationPath,
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
} from "@200ms/common";
import { KeyringStoreState } from "@200ms/recoil";
import { Backend } from "../backend/core";
import { Io } from "../io";

const logger = getLogger("background-server-ui");

let BACKEND: Backend;

export function start(b: Backend) {
  BACKEND = b;

  Io.rpcServerUi.handler(handle);
}

async function handle<T = any>(msg: RpcRequest): Promise<RpcResponse<T>> {
  logger.debug(`handle rpc ${msg.method}`, msg);

  const { method, params } = msg;
  switch (method) {
    //
    // Keyring.
    //
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
    case UI_RPC_METHOD_KEYRING_KEY_DELETE:
      return await handleKeyringKeyDelete(params[0]);
    case UI_RPC_METHOD_KEYRING_STORE_STATE:
      return await handleKeyringStoreState();
    case UI_RPC_METHOD_KEYRING_STORE_KEEP_ALIVE:
      return handleKeyringStoreKeepAlive();
    case UI_RPC_METHOD_KEYRING_DERIVE_WALLET:
      return await handleKeyringDeriveWallet();
    case UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY:
      return await handleKeyringImportSecretKey(params[0], params[1]);
    case UI_RPC_METHOD_KEYRING_EXPORT_SECRET_KEY:
      return handleKeyringExportSecretKey(params[0], params[1]);
    case UI_RPC_METHOD_KEYRING_EXPORT_MNEMONIC:
      return handleKeyringExportMnemonic(params[0]);
    case UI_RPC_METHOD_KEYRING_RESET_MNEMONIC:
      return handleKeyringResetMnemonic(params[0]);
    case UI_RPC_METHOD_KEYRING_AUTOLOCK_UPDATE:
      return await handleKeyringAutolockUpdate(params[0]);
    //
    // Ledger.
    //
    case UI_RPC_METHOD_LEDGER_CONNECT:
      return await handleLedgerConnect();
    case UI_RPC_METHOD_LEDGER_IMPORT:
      return await handleKeyringLedgerImport(params[0], params[1], params[2]);
    //
    // Wallet signing.
    //
    case UI_RPC_METHOD_SIGN_TRANSACTION:
      return await handleSignTransaction(params[0], params[1]);
    case UI_RPC_METHOD_SIGN_ALL_TRANSACTIONS:
      return await handleSignAllTransactions(params[0], params[1]);
    case UI_RPC_METHOD_SIGN_AND_SEND_TRANSACTION:
      return await handleSignAndSendTransaction(params[0], params[1]);
    //
    // Connection URL.
    //
    case UI_RPC_METHOD_CONNECTION_URL_READ:
      return await handleConnectionUrlRead();
    case UI_RPC_METHOD_CONNECTION_URL_UPDATE:
      return await handleConnectionUrlUpdate(params[0]);
    //
    // Navigation.
    //
    case UI_RPC_METHOD_NAVIGATION_UPDATE:
      return await handleNavigationUpdate(params[0]);
    case UI_RPC_METHOD_NAVIGATION_READ:
      return await handleNavigationRead(params[0]);
    case UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_READ:
      return await handleNavigationActiveTabRead();
    case UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE:
      return await handleNavigationActiveTabUpdate(params[0]);
    //
    // Wallet app settings.
    //
    case UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLET:
      return await handleWalletDataActiveWallet();
    case UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLET_UPDATE:
      return await handleWalletDataActiveWalletUpdate(params[0]);
    case UI_RPC_METHOD_SETTINGS_DARK_MODE_READ:
      return await handleDarkModeRead();
    case UI_RPC_METHOD_SETTINGS_DARK_MODE_UPDATE:
      return await handleDarkModeUpdate(params[0]);
    case UI_RPC_METHOD_APPROVED_ORIGINS_READ:
      return await handleApprovedOriginsRead();
    case UI_RPC_METHOD_APPROVED_ORIGINS_UPDATE:
      return await handleApprovedOriginsUpdate(params[0]);
    //
    // Nicknames for keys.
    //
    case UI_RPC_METHOD_KEYNAME_UPDATE:
      return await handleKeynameUpdate(params[0], params[1]);
    case UI_RPC_METHOD_PASSWORD_UPDATE:
      return await handlePasswordUpdate(params[0], params[1]);
    //
    // Solana.
    //
    case UI_RPC_METHOD_SOLANA_COMMITMENT_READ:
      return await handleSolanaCommitmentRead();
    case UI_RPC_METHOD_SOLANA_COMMITMENT_UPDATE:
      return await handleSolanaCommitmentUpdate(params[0]);
    default:
      throw new Error(`unexpected ui rpc method: ${method}`);
  }
}

async function handleKeyringStoreCreate(
  mnemonic: string,
  derivationPath: DerivationPath,
  password: string
): Promise<RpcResponse<string>> {
  const resp = await BACKEND.keyringStoreCreate(
    mnemonic,
    derivationPath,
    password
  );
  return [resp];
}

async function handleKeyringStoreUnlock(password: string) {
  try {
    const resp = await BACKEND.keyringStoreUnlock(password);
    return [resp];
  } catch (err) {
    return [undefined, String(err)];
  }
}

async function handleKeyringStoreLock() {
  const resp = BACKEND.keyringStoreLock();
  return [resp];
}

async function handleHdKeyringCreate(
  mnemonic: string
): Promise<RpcResponse<string>> {
  const resp = BACKEND.hdKeyringCreate(mnemonic);
  return [resp];
}

async function handleKeyringCreate(
  secretKey: string
): Promise<RpcResponse<string>> {
  const resp = BACKEND.keyringCreate(secretKey);
  return [resp];
}

async function handleKeyringStoreState(): Promise<
  RpcResponse<KeyringStoreState>
> {
  const resp = await BACKEND.keyringStoreState();
  return [resp];
}

function handleKeyringStoreKeepAlive(): RpcResponse<string> {
  const resp = BACKEND.keyringStoreKeepAlive();
  return [resp];
}

async function handleConnectionUrlRead(): Promise<RpcResponse<string>> {
  const resp = await BACKEND.connectionUrlRead();
  return [resp];
}

async function handleConnectionUrlUpdate(
  url: string
): Promise<RpcResponse<boolean>> {
  const didChange = await BACKEND.connectionUrlUpdate(url);
  return [didChange];
}

async function handleWalletDataActiveWallet(): Promise<RpcResponse<string>> {
  const pubkey = await BACKEND.activeWallet();
  return [pubkey];
}

async function handleWalletDataActiveWalletUpdate(
  newWallet: string
): Promise<RpcResponse<string>> {
  const resp = await BACKEND.activeWalletUpdate(newWallet);
  return [resp];
}

async function handleKeyringStoreReadAllPubkeys(): Promise<
  RpcResponse<Array<string>>
> {
  const resp = await BACKEND.keyringStoreReadAllPubkeys();
  return [resp];
}

async function handleKeyringDeriveWallet(): Promise<RpcResponse<string>> {
  const resp = await BACKEND.keyringDeriveWallet();
  return [resp];
}

async function handleKeynameUpdate(
  pubkey: string,
  newName: string
): Promise<RpcResponse<string>> {
  const resp = await BACKEND.keynameUpdate(pubkey, newName);
  return [resp];
}

async function handleKeyringKeyDelete(
  pubkey: string
): Promise<RpcResponse<string>> {
  const resp = await BACKEND.keyringKeyDelete(pubkey);
  return [resp];
}

async function handlePasswordUpdate(
  currentPassword: string,
  newPassword: string
): Promise<RpcResponse<string>> {
  try {
    const resp = await BACKEND.passwordUpdate(currentPassword, newPassword);
    return [resp];
  } catch (err: any) {
    return [undefined, String(err)];
  }
}

async function handleKeyringImportSecretKey(
  secretKey: string,
  name: string
): Promise<RpcResponse<string>> {
  const resp = await BACKEND.importSecretKey(secretKey, name);
  return [resp];
}

function handleKeyringExportSecretKey(
  password: string,
  pubkey: string
): RpcResponse<string> {
  const resp = BACKEND.keyringExportSecretKey(password, pubkey);
  return [resp];
}

function handleKeyringExportMnemonic(password: string): RpcResponse<string> {
  const resp = BACKEND.keyringExportMnemonic(password);
  return [resp];
}

function handleKeyringResetMnemonic(password: string): RpcResponse<string> {
  const resp = BACKEND.keyringResetMnemonic(password);
  return [resp];
}

async function handleKeyringAutolockUpdate(
  autolockSecs: number
): Promise<RpcResponse<string>> {
  const resp = await BACKEND.keyringAutolockUpdate(autolockSecs);
  return [resp];
}

async function handleNavigationUpdate(
  navData: any
): Promise<RpcResponse<string>> {
  const resp = await BACKEND.navigationUpdate(navData);
  return [resp];
}

async function handleNavigationRead(nav: string): Promise<RpcResponse<string>> {
  const resp = await BACKEND.navigationRead(nav);
  return [resp];
}

async function handleNavigationActiveTabRead(): Promise<RpcResponse<string>> {
  const resp = await BACKEND.navigationActiveTabRead();
  return [resp];
}

async function handleNavigationActiveTabUpdate(
  tabKey: string
): Promise<RpcResponse<string>> {
  const resp = await BACKEND.navigationActiveTabUpdate(tabKey);
  return [resp];
}

async function handleDarkModeRead(): Promise<RpcResponse<boolean>> {
  const resp = await BACKEND.darkModeRead();
  return [resp];
}

async function handleDarkModeUpdate(
  darkMode: boolean
): Promise<RpcResponse<string>> {
  const resp = await BACKEND.darkModeUpdate(darkMode);
  return [resp];
}

async function handleSolanaCommitmentRead(): Promise<RpcResponse<string>> {
  const resp = await BACKEND.solanaCommitmentRead();
  return [resp];
}

async function handleSolanaCommitmentUpdate(
  commitment: string
): Promise<RpcResponse<string>> {
  const resp = await BACKEND.solanaCommitmentUpdate(commitment);
  return [resp];
}

async function handleSignTransaction(
  messageBs58: string,
  walletAddress: string
): Promise<RpcResponse<string>> {
  const resp = await BACKEND.signTransaction(messageBs58, walletAddress);
  return [resp];
}

async function handleSignAllTransactions(
  txs: Array<string>,
  walletAddress: string
): Promise<RpcResponse<string>> {
  const resp = await BACKEND.signAllTransactions(txs, walletAddress);
  return [resp];
}

async function handleSignAndSendTransaction(
  tx: string,
  walletAddress: string
): Promise<RpcResponse<string>> {
  const resp = await BACKEND.signAndSendTx(tx, walletAddress);
  return [resp];
}

async function handleApprovedOriginsRead(): Promise<
  RpcResponse<Array<string>>
> {
  const resp = await BACKEND.approvedOriginsRead();
  return [resp];
}

async function handleApprovedOriginsUpdate(
  approvedOrigins: Array<string>
): Promise<RpcResponse<string>> {
  const resp = await BACKEND.approvedOriginsUpdate(approvedOrigins);
  return [resp];
}

async function handleLedgerConnect() {
  const resp = await BACKEND.ledgerConnect();
  return [resp];
}

async function handleKeyringLedgerImport(
  dPath: string,
  account: number,
  pubkey: string
): Promise<RpcResponse<string>> {
  const resp = await BACKEND.ledgerImport(dPath, account, pubkey);
  return [resp];
}
