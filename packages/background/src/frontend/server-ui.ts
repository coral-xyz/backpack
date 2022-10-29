// All RPC request handlers for requests that can be sent from the trusted
// extension UI to the background script.

import type {
  RpcRequest,
  RpcResponse,
  DerivationPath,
  Context,
  EventEmitter,
  Blockchain,
} from "@coral-xyz/common";
import type { Commitment } from "@solana/web3.js";
import {
  getLogger,
  withContextPort,
  ChannelAppUi,
  UI_RPC_METHOD_BLOCKCHAINS_ENABLED_ADD,
  UI_RPC_METHOD_BLOCKCHAINS_ENABLED_DELETE,
  UI_RPC_METHOD_BLOCKCHAINS_ENABLED_READ,
  UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD,
  UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_READ,
  UI_RPC_METHOD_KEYRING_STORE_CHECK_PASSWORD,
  UI_RPC_METHOD_KEYRING_STORE_CREATE,
  UI_RPC_METHOD_KEYRING_STORE_KEEP_ALIVE,
  UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
  UI_RPC_METHOD_KEYRING_DERIVE_WALLET,
  UI_RPC_METHOD_KEYRING_KEY_DELETE,
  UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY,
  UI_RPC_METHOD_KEYRING_EXPORT_SECRET_KEY,
  UI_RPC_METHOD_KEYRING_VALIDATE_MNEMONIC,
  UI_RPC_METHOD_KEYRING_EXPORT_MNEMONIC,
  UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
  UI_RPC_METHOD_KEYRING_STORE_STATE,
  UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_CREATE,
  UI_RPC_METHOD_KEYRING_TYPE_READ,
  UI_RPC_METHOD_KEYRING_RESET,
  UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
  UI_RPC_METHOD_KEYRING_ACTIVE_WALLETS,
  UI_RPC_METHOD_KEYNAME_READ,
  UI_RPC_METHOD_KEYNAME_UPDATE,
  UI_RPC_METHOD_PASSWORD_UPDATE,
  UI_RPC_METHOD_KEYRING_AUTOLOCK_READ,
  UI_RPC_METHOD_KEYRING_AUTOLOCK_UPDATE,
  UI_RPC_METHOD_NAVIGATION_PUSH,
  UI_RPC_METHOD_NAVIGATION_POP,
  UI_RPC_METHOD_NAVIGATION_CURRENT_URL_UPDATE,
  UI_RPC_METHOD_NAVIGATION_READ,
  UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
  UI_RPC_METHOD_NAVIGATION_TO_ROOT,
  UI_RPC_METHOD_SETTINGS_DARK_MODE_READ,
  UI_RPC_METHOD_SETTINGS_DARK_MODE_UPDATE,
  UI_RPC_METHOD_APPROVED_ORIGINS_READ,
  UI_RPC_METHOD_APPROVED_ORIGINS_UPDATE,
  UI_RPC_METHOD_APPROVED_ORIGINS_DELETE,
  UI_RPC_METHOD_LEDGER_IMPORT,
  UI_RPC_METHOD_PREVIEW_PUBKEYS,
  UI_RPC_METHOD_SOLANA_EXPLORER_READ,
  UI_RPC_METHOD_SOLANA_EXPLORER_UPDATE,
  UI_RPC_METHOD_PLUGIN_LOCAL_STORAGE_GET,
  UI_RPC_METHOD_PLUGIN_LOCAL_STORAGE_PUT,
  UI_RPC_METHOD_SOLANA_CONNECTION_URL_READ,
  UI_RPC_METHOD_SOLANA_CONNECTION_URL_UPDATE,
  UI_RPC_METHOD_SOLANA_COMMITMENT_READ,
  UI_RPC_METHOD_SOLANA_COMMITMENT_UPDATE,
  UI_RPC_METHOD_SOLANA_SIMULATE,
  UI_RPC_METHOD_SOLANA_SIGN_TRANSACTION,
  UI_RPC_METHOD_SOLANA_SIGN_ALL_TRANSACTIONS,
  UI_RPC_METHOD_SOLANA_SIGN_AND_SEND_TRANSACTION,
  UI_RPC_METHOD_SOLANA_SIGN_MESSAGE,
  UI_RPC_METHOD_ETHEREUM_EXPLORER_READ,
  UI_RPC_METHOD_ETHEREUM_EXPLORER_UPDATE,
  UI_RPC_METHOD_ETHEREUM_CONNECTION_URL_READ,
  UI_RPC_METHOD_ETHEREUM_CONNECTION_URL_UPDATE,
  UI_RPC_METHOD_ETHEREUM_CHAIN_ID_READ,
  UI_RPC_METHOD_ETHEREUM_CHAIN_ID_UPDATE,
  UI_RPC_METHOD_ETHEREUM_SIGN_TRANSACTION,
  UI_RPC_METHOD_ETHEREUM_SIGN_AND_SEND_TRANSACTION,
  UI_RPC_METHOD_ETHEREUM_SIGN_MESSAGE,
  UI_RPC_METHOD_SIGN_MESSAGE_FOR_WALLET,
  UI_RPC_METHOD_USERNAME_READ,
  BACKEND_EVENT,
  CHANNEL_POPUP_RPC,
  CHANNEL_POPUP_NOTIFICATIONS,
  UI_RPC_METHOD_SET_FEATURE_GATES,
  FEATURE_GATES_MAP,
  UI_RPC_METHOD_GET_FEATURE_GATES,
} from "@coral-xyz/common";
import type { KeyringStoreState } from "@coral-xyz/recoil";
import type { Backend } from "../backend/core";
import type { Config, Handle } from "../types";

const logger = getLogger("background-server-ui");

export function start(_cfg: Config, events: EventEmitter, b: Backend): Handle {
  const rpcServerUi = ChannelAppUi.server(CHANNEL_POPUP_RPC);
  const notificationsUi = ChannelAppUi.notifications(
    CHANNEL_POPUP_NOTIFICATIONS
  );

  //
  // Dispatch all notifications to the extension popup UI. This channel
  // will also handle plugins in an additional routing step.
  //
  events.on(BACKEND_EVENT, (notification: any) => {
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
        // @ts-ignore
        ...params
      );
    case UI_RPC_METHOD_KEYRING_STORE_UNLOCK:
      return await handleKeyringStoreUnlock(ctx, params[0]);
    case UI_RPC_METHOD_KEYRING_STORE_LOCK:
      return await handleKeyringStoreLock(ctx);
    case UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS:
      return await handleKeyringStoreReadAllPubkeys(ctx);
    case UI_RPC_METHOD_KEYRING_KEY_DELETE:
      return await handleKeyringKeyDelete(ctx, params[0], params[1]);
    case UI_RPC_METHOD_KEYRING_STORE_STATE:
      return await handleKeyringStoreState(ctx);
    case UI_RPC_METHOD_KEYRING_STORE_KEEP_ALIVE:
      return handleKeyringStoreKeepAlive(ctx);
    case UI_RPC_METHOD_KEYRING_DERIVE_WALLET:
      return await handleKeyringDeriveWallet(ctx, params[0]);
    case UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY:
      return await handleKeyringImportSecretKey(
        ctx,
        params[0],
        params[1],
        params[2]
      );
    case UI_RPC_METHOD_KEYRING_EXPORT_SECRET_KEY:
      return handleKeyringExportSecretKey(ctx, params[0], params[1]);
    case UI_RPC_METHOD_KEYRING_VALIDATE_MNEMONIC:
      return await handleValidateMnemonic(ctx, params[0]);
    case UI_RPC_METHOD_KEYRING_EXPORT_MNEMONIC:
      return handleKeyringExportMnemonic(ctx, params[0]);
    case UI_RPC_METHOD_KEYRING_AUTOLOCK_READ:
      return await handleKeyringAutolockRead(ctx);
    case UI_RPC_METHOD_KEYRING_AUTOLOCK_UPDATE:
      return await handleKeyringAutolockUpdate(ctx, params[0]);
    case UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_CREATE:
      return await handleMnemonicCreate(ctx, params[0]);
    case UI_RPC_METHOD_KEYRING_TYPE_READ:
      return await handleKeyringTypeRead(ctx);
    case UI_RPC_METHOD_PREVIEW_PUBKEYS:
      return await handlePreviewPubkeys(
        ctx,
        params[0],
        params[1],
        params[2],
        params[3]
      );
    case UI_RPC_METHOD_KEYRING_RESET:
      return await handleKeyringReset(ctx);
    //
    // Ledger.
    //
    case UI_RPC_METHOD_LEDGER_IMPORT:
      return await handleKeyringLedgerImport(
        ctx,
        params[0],
        params[1],
        params[2],
        params[3]
      );
    //
    // Navigation.
    //
    case UI_RPC_METHOD_NAVIGATION_PUSH:
      return await handleNavigationPush(ctx, params[0]);
    case UI_RPC_METHOD_NAVIGATION_POP:
      return await handleNavigationPop(ctx);
    case UI_RPC_METHOD_NAVIGATION_CURRENT_URL_UPDATE:
      return await handleNavigationCurrentUrlUpdate(ctx, params[0]);
    case UI_RPC_METHOD_NAVIGATION_READ:
      return await handleNavRead(ctx);
    case UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE:
      return await handleNavigationActiveTabUpdate(ctx, params[0]);
    case UI_RPC_METHOD_NAVIGATION_TO_ROOT:
      return await handleNavigationToRoot(ctx);
    //
    // Wallet app settings.
    //
    case UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE:
      return await handleKeyringActiveWalletUpdate(ctx, params[0], params[1]);
    case UI_RPC_METHOD_KEYRING_ACTIVE_WALLETS:
      return await handleKeyringActiveWallets(ctx);
    case UI_RPC_METHOD_SETTINGS_DARK_MODE_READ:
      return await handleDarkModeRead(ctx);
    case UI_RPC_METHOD_SETTINGS_DARK_MODE_UPDATE:
      return await handleDarkModeUpdate(ctx, params[0]);
    case UI_RPC_METHOD_APPROVED_ORIGINS_READ:
      return await handleApprovedOriginsRead(ctx);
    case UI_RPC_METHOD_APPROVED_ORIGINS_UPDATE:
      return await handleApprovedOriginsUpdate(ctx, params[0]);
    case UI_RPC_METHOD_APPROVED_ORIGINS_DELETE:
      return await handleApprovedOriginsDelete(ctx, params[0]);
    case UI_RPC_METHOD_BLOCKCHAINS_ENABLED_ADD:
      return handleBlockchainsEnabledAdd(ctx, params[0]);
    case UI_RPC_METHOD_BLOCKCHAINS_ENABLED_DELETE:
      return handleBlockchainsEnabledRemove(ctx, params[0]);
    case UI_RPC_METHOD_BLOCKCHAINS_ENABLED_READ:
      return await handleBlockchainsEnabledRead(ctx);
    case UI_RPC_METHOD_SET_FEATURE_GATES:
      return await handleSetFeatureGates(ctx, params[0]);
    case UI_RPC_METHOD_GET_FEATURE_GATES:
      return await handleGetFeatureGates(ctx);
    case UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD:
      return await handleBlockchainKeyringsAdd(
        ctx,
        params[0],
        params[1],
        params[2],
        params[3]
      );
    case UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_READ:
      return await handleBlockchainKeyringsRead(ctx);
    //
    //
    // Nicknames for keys.
    //
    case UI_RPC_METHOD_KEYNAME_READ:
      return await handleKeynameRead(ctx, params[0]);
    case UI_RPC_METHOD_KEYNAME_UPDATE:
      return await handleKeynameUpdate(ctx, params[0], params[1]);
    //
    // Username.
    //
    case UI_RPC_METHOD_USERNAME_READ:
      return await handleUsernameRead(ctx);
    //
    // Password.
    //
    case UI_RPC_METHOD_PASSWORD_UPDATE:
      return await handlePasswordUpdate(ctx, params[0], params[1]);
    case UI_RPC_METHOD_KEYRING_STORE_CHECK_PASSWORD:
      return await handleKeyringStoreCheckPassword(ctx, params[0]);
    //
    // xNFT storage.
    //
    case UI_RPC_METHOD_PLUGIN_LOCAL_STORAGE_GET:
      return await handlePluginLocalStorageGet(ctx, params[0], params[1]);
    case UI_RPC_METHOD_PLUGIN_LOCAL_STORAGE_PUT:
      return await handlePluginLocalStoragePut(
        ctx,
        params[0],
        params[1],
        params[2]
      );
    //
    // Solana.
    //
    case UI_RPC_METHOD_SOLANA_SIMULATE:
      return await handleSolanaSimulate(ctx, params[0], params[1], params[2]);
    case UI_RPC_METHOD_SOLANA_SIGN_TRANSACTION:
      return await handleSolanaSignTransaction(ctx, params[0], params[1]);
    case UI_RPC_METHOD_SOLANA_SIGN_ALL_TRANSACTIONS:
      return await handleSolanaSignAllTransactions(ctx, params[0], params[1]);
    case UI_RPC_METHOD_SOLANA_SIGN_AND_SEND_TRANSACTION:
      return await handleSolanaSignAndSendTransaction(
        ctx,
        params[0],
        params[1]
      );
    case UI_RPC_METHOD_SOLANA_SIGN_MESSAGE:
      return await handleSolanaSignMessage(ctx, params[0], params[1]);
    case UI_RPC_METHOD_SOLANA_COMMITMENT_READ:
      return await handleSolanaCommitmentRead(ctx);
    case UI_RPC_METHOD_SOLANA_COMMITMENT_UPDATE:
      return await handleSolanaCommitmentUpdate(ctx, params[0]);
    case UI_RPC_METHOD_SOLANA_EXPLORER_READ:
      return await handleSolanaExplorerRead(ctx);
    case UI_RPC_METHOD_SOLANA_EXPLORER_UPDATE:
      return await handleSolanaExplorerUpdate(ctx, params[0]);
    case UI_RPC_METHOD_SOLANA_CONNECTION_URL_READ:
      return await handleSolanaConnectionUrlRead(ctx);
    case UI_RPC_METHOD_SOLANA_CONNECTION_URL_UPDATE:
      return await handleSolanaConnectionUrlUpdate(ctx, params[0]);
    //
    // Ethereum
    //
    case UI_RPC_METHOD_ETHEREUM_EXPLORER_READ:
      return await handleEthereumExplorerRead(ctx);
    case UI_RPC_METHOD_ETHEREUM_EXPLORER_UPDATE:
      return await handleEthereumExplorerUpdate(ctx, params[0]);
    case UI_RPC_METHOD_ETHEREUM_CONNECTION_URL_READ:
      return await handleEthereumConnectionUrlRead(ctx);
    case UI_RPC_METHOD_ETHEREUM_CONNECTION_URL_UPDATE:
      return await handleEthereumConnectionUrlUpdate(ctx, params[0]);
    case UI_RPC_METHOD_ETHEREUM_CHAIN_ID_READ:
      return await handleEthereumChainIdRead(ctx);
    case UI_RPC_METHOD_ETHEREUM_CHAIN_ID_UPDATE:
      return await handleEthereumChainIdUpdate(ctx, params[0]);
    case UI_RPC_METHOD_ETHEREUM_SIGN_TRANSACTION:
      return await handleEthereumSignTransaction(ctx, params[0], params[1]);
    case UI_RPC_METHOD_ETHEREUM_SIGN_AND_SEND_TRANSACTION:
      return await handleEthereumSignAndSendTransaction(
        ctx,
        params[0],
        params[1]
      );
    case UI_RPC_METHOD_ETHEREUM_SIGN_MESSAGE:
      return await handleEthereumSignMessage(ctx, params[0], params[1]);
    case UI_RPC_METHOD_SIGN_MESSAGE_FOR_WALLET:
      return await handleSignMessageForWallet(
        ctx,
        params[0],
        params[1],
        params[2],
        params[3],
        params[4],
        params[5]
      );
    default:
      throw new Error(`unexpected ui rpc method: ${method}`);
  }
}

async function handleKeyringStoreCreate(
  ctx: Context<Backend>,
  ...args: Parameters<Backend["keyringStoreCreate"]>
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.keyringStoreCreate(...args);
  return [resp];
}

async function handleKeyringStoreCheckPassword(
  ctx: Context<Backend>,
  password: string
) {
  try {
    const resp = await ctx.backend.keyringStoreCheckPassword(password);
    return [resp];
  } catch (err) {
    return [undefined, String(err)];
  }
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

async function handleKeyringActiveWalletUpdate(
  ctx: Context<Backend>,
  newWallet: string,
  blockchain: Blockchain
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.activeWalletUpdate(newWallet, blockchain);
  return [resp];
}

async function handleKeyringActiveWallets(
  ctx: Context<Backend>
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.activeWallets();
  return [resp];
}

async function handleKeyringStoreReadAllPubkeys(
  ctx: Context<Backend>
): Promise<RpcResponse<Array<string>>> {
  const resp = await ctx.backend.keyringStoreReadAllPubkeys();
  return [resp];
}

async function handleKeyringDeriveWallet(
  ctx: Context<Backend>,
  blockchain: Blockchain
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.keyringDeriveWallet(blockchain);
  return [resp];
}

async function handleKeynameRead(
  ctx: Context<Backend>,
  pubkey: string
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.keynameRead(pubkey);
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
  blockchain: Blockchain,
  pubkey: string
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.keyringKeyDelete(blockchain, pubkey);
  return [resp];
}

async function handleUsernameRead(
  ctx: Context<Backend>
): Promise<RpcResponse<number>> {
  const resp = await ctx.backend.usernameRead();
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
  blockchain: Blockchain,
  secretKey: string,
  name: string
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.importSecretKey(blockchain, secretKey, name);
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

function handleValidateMnemonic(
  ctx: Context<Backend>,
  mnemonic: string
): RpcResponse<boolean> {
  const resp = ctx.backend.validateMnemonic(mnemonic);
  return [resp];
}

function handleKeyringExportMnemonic(
  ctx: Context<Backend>,
  password: string
): RpcResponse<string> {
  const resp = ctx.backend.keyringExportMnemonic(password);
  return [resp];
}

async function handleKeyringAutolockRead(
  ctx: Context<Backend>
): Promise<RpcResponse<number>> {
  const resp = await ctx.backend.keyringAutolockRead();
  return [resp];
}

async function handleKeyringAutolockUpdate(
  ctx: Context<Backend>,
  autolockSecs: number
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.keyringAutolockUpdate(autolockSecs);
  return [resp];
}

async function handleKeyringReset(
  ctx: Context<Backend>
): Promise<RpcResponse<string>> {
  const resp = ctx.backend.keyringReset();
  return [resp];
}

async function handleMnemonicCreate(
  ctx: Context<Backend>,
  strength = 256
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.mnemonicCreate(strength);
  return [resp];
}

async function handleKeyringTypeRead(ctx: Context<Backend>) {
  const resp = ctx.backend.keyringTypeRead();
  return [resp];
}

async function handleNavigationPush(
  ctx: Context<Backend>,
  url: string
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.navigationPush(url);
  return [resp];
}

async function handleNavigationPop(
  ctx: Context<Backend>
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.navigationPop();
  return [resp];
}

async function handleNavigationCurrentUrlUpdate(
  ctx: Context<Backend>,
  url: string
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.navigationCurrentUrlUpdate(url);
  return [resp];
}

async function handleNavRead(
  ctx: Context<Backend>
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.navRead();
  return [resp];
}

async function handleNavigationActiveTabUpdate(
  ctx: Context<Backend>,
  tabKey: string
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.navigationActiveTabUpdate(tabKey);
  return [resp];
}

async function handleNavigationToRoot(
  ctx: Context<Backend>
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.navigationToRoot();
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

async function handleSolanaConnectionUrlRead(
  ctx: Context<Backend>
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.solanaConnectionUrlRead();
  return [resp];
}

async function handleSolanaConnectionUrlUpdate(
  ctx: Context<Backend>,
  url: string
): Promise<RpcResponse<boolean>> {
  const didChange = await ctx.backend.solanaConnectionUrlUpdate(url);
  return [didChange];
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
  const resp = await ctx.backend.solanaCommitmentUpdate(
    commitment as Commitment
  );
  return [resp];
}

async function handleSolanaExplorerRead(
  ctx: Context<Backend>
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.solanaExplorerRead();
  return [resp];
}

async function handleSolanaExplorerUpdate(
  ctx: Context<Backend>,
  url: string
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.solanaExplorerUpdate(url);
  return [resp];
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

async function handleSolanaSignTransaction(
  ctx: Context<Backend>,
  txStr: string,
  walletAddress: string
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.solanaSignTransaction(txStr, walletAddress);
  return [resp];
}

async function handleSolanaSignAllTransactions(
  ctx: Context<Backend>,
  txs: Array<string>,
  walletAddress: string
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.solanaSignAllTransactions(txs, walletAddress);
  return [resp];
}

async function handleSolanaSignMessage(
  ctx: Context<Backend>,
  msg: string,
  publicKey: string
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.solanaSignMessage(msg, publicKey);
  return [resp];
}

async function handleSolanaSignAndSendTransaction(
  ctx: Context<Backend>,
  tx: string,
  walletAddress: string
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.solanaSignAndSendTx(tx, walletAddress);
  return [resp];
}

async function handleEthereumExplorerRead(
  ctx: Context<Backend>
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.ethereumExplorerRead();
  return [resp];
}

async function handleEthereumExplorerUpdate(
  ctx: Context<Backend>,
  url: string
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.ethereumExplorerUpdate(url);
  return [resp];
}

async function handleEthereumConnectionUrlRead(
  ctx: Context<Backend>
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.ethereumConnectionUrlRead();
  return [resp];
}

async function handleEthereumConnectionUrlUpdate(
  ctx: Context<Backend>,
  url: string
): Promise<RpcResponse<boolean>> {
  const resp = await ctx.backend.ethereumConnectionUrlUpdate(url);
  return [resp];
}

async function handleEthereumChainIdRead(
  ctx: Context<Backend>
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.ethereumChainIdRead();
  return [resp];
}

async function handleEthereumChainIdUpdate(
  ctx: Context<Backend>,
  chainId: string
): Promise<RpcResponse<boolean>> {
  const resp = await ctx.backend.ethereumChainIdUpdate(chainId);
  return [resp];
}

async function handleEthereumSignTransaction(
  ctx: Context<Backend>,
  serializedTx: string,
  walletAddress: string
) {
  const resp = await ctx.backend.ethereumSignTransaction(
    serializedTx,
    walletAddress
  );
  return [resp];
}

async function handleEthereumSignAndSendTransaction(
  ctx: Context<Backend>,
  serializedTx: string,
  walletAddress: string
) {
  const resp = await ctx.backend.ethereumSignAndSendTransaction(
    serializedTx,
    walletAddress
  );
  return [resp];
}

async function handleEthereumSignMessage(
  ctx: Context<Backend>,
  msg: string,
  walletAddress: string
) {
  const resp = await ctx.backend.ethereumSignMessage(msg, walletAddress);
  return [resp];
}

async function handleSignMessageForWallet(
  ctx: Context<Backend>,
  blockchain: Blockchain,
  msg: string,
  derivationPath: DerivationPath,
  accountIndex: number,
  publicKey: string,
  mnemonic?: string
) {
  const resp = await ctx.backend.signMessageForWallet(
    blockchain,
    msg,
    derivationPath,
    accountIndex,
    publicKey,
    mnemonic
  );
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

async function handleApprovedOriginsDelete(
  ctx: Context<Backend>,
  origin: string
): Promise<RpcResponse> {
  const resp = await ctx.backend.approvedOriginsDelete(origin);
  return [resp];
}

function handleBlockchainsEnabledAdd(
  ctx: Context<Backend>,
  blockchain: Blockchain
) {
  const resp = ctx.backend.enabledBlockchainsAdd(blockchain);
  return [resp];
}

function handleBlockchainsEnabledRemove(
  ctx: Context<Backend>,
  blockchain: Blockchain
) {
  const resp = ctx.backend.enabledBlockchainsRemove(blockchain);
  return [resp];
}

async function handleBlockchainsEnabledRead(
  ctx: Context<Backend>
): Promise<RpcResponse<Array<string>>> {
  const resp = await ctx.backend.enabledBlockchainsRead();
  return [resp];
}

async function handleSetFeatureGates(
  ctx: Context<Backend>,
  gates: FEATURE_GATES_MAP
) {
  const resp = await ctx.backend.setFeatureGates(gates);
  return [resp];
}

async function handleGetFeatureGates(ctx: Context<Backend>) {
  const resp = await ctx.backend.getFeatureGates();
  return [resp];
}

async function handleBlockchainKeyringsAdd(
  ctx: Context<Backend>,
  blockchain: Blockchain,
  derivationPath: DerivationPath,
  accountIndex: number,
  publicKey: string | undefined
): Promise<RpcResponse<Array<string>>> {
  const resp = await ctx.backend.blockchainKeyringsAdd(
    blockchain,
    derivationPath,
    accountIndex,
    publicKey
  );
  return [resp];
}

async function handleBlockchainKeyringsRead(
  ctx: Context<Backend>
): Promise<RpcResponse<Array<string>>> {
  const resp = await ctx.backend.blockchainKeyringsRead();
  return [resp];
}

async function handleKeyringLedgerImport(
  ctx: Context<Backend>,
  blockchain: Blockchain,
  dPath: string,
  account: number,
  pubkey: string
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.ledgerImport(
    blockchain,
    dPath,
    account,
    pubkey
  );
  return [resp];
}

async function handlePreviewPubkeys(
  ctx: Context<Backend>,
  blockchain: Blockchain,
  mnemonic: string,
  derivationPath: DerivationPath,
  numberOfAccounts: number
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.previewPubkeys(
    blockchain,
    mnemonic,
    derivationPath,
    numberOfAccounts
  );
  return [resp];
}

// This API is only safe because it assumes the frontend UI code is doing
// the proper gatekeeping. It shouldn't allow other xNFTs to call this
// api with a fake plugin string.
async function handlePluginLocalStorageGet(
  ctx: Context<Backend>,
  xnftAddress: string,
  key: string
): Promise<RpcResponse<any>> {
  const resp = await ctx.backend.pluginLocalStorageGet(xnftAddress, key);
  return [resp];
}

// This API is only safe because it assumes the frontend UI code is doing
// the proper gatekeeping. It shouldn't allow other xNFTs to call this
// api with a fake plugin string.
async function handlePluginLocalStoragePut(
  ctx: Context<Backend>,
  xnftAddress: string,
  key: string,
  value: any
): Promise<RpcResponse<any>> {
  const resp = await ctx.backend.pluginLocalStoragePut(xnftAddress, key, value);
  return [resp];
}
