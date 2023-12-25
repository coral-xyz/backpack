// All RPC request handlers for requests that can be sent from the trusted
// extension UI to the background script.

import type {
  AutolockSettingsOption,
  Blockchain,
  Context,
  EventEmitter,
  FEATURE_GATES_MAP,
  Preferences,
  RpcRequest,
  RpcResponse,
  XnftPreference,
} from "@coral-xyz/common";
import {
  BACKEND_EVENT,
  CHANNEL_POPUP_NOTIFICATIONS,
  CHANNEL_POPUP_RPC,
  ChannelAppUi,
  getLogger,
  TAB_XNFT,
  UI_RPC_METHOD_ALL_USERS_READ,
  UI_RPC_METHOD_APPROVED_ORIGINS_DELETE,
  UI_RPC_METHOD_APPROVED_ORIGINS_READ,
  UI_RPC_METHOD_APPROVED_ORIGINS_UPDATE,
  UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD,
  UI_RPC_METHOD_COMMITMENT_UPDATE,
  UI_RPC_METHOD_CONNECTION_URL_READ,
  UI_RPC_METHOD_CONNECTION_URL_UPDATE,
  UI_RPC_METHOD_ETHEREUM_CHAIN_ID_READ,
  UI_RPC_METHOD_ETHEREUM_CHAIN_ID_UPDATE,
  UI_RPC_METHOD_ETHEREUM_SIGN_AND_SEND_TRANSACTION,
  UI_RPC_METHOD_ETHEREUM_SIGN_MESSAGE,
  UI_RPC_METHOD_ETHEREUM_SIGN_TRANSACTION,
  UI_RPC_METHOD_EXPLORER_UPDATE,
  UI_RPC_METHOD_FIND_WALLET_DESCRIPTOR,
  UI_RPC_METHOD_GET_FEATURE_GATES,
  UI_RPC_METHOD_GET_XNFT_PREFERENCES,
  UI_RPC_METHOD_HIDDEN_TOKENS_UPDATE,
  UI_RPC_METHOD_KEY_IS_COLD_UPDATE,
  UI_RPC_METHOD_KEYNAME_READ,
  UI_RPC_METHOD_KEYNAME_UPDATE,
  UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
  UI_RPC_METHOD_KEYRING_AUTO_LOCK_SETTINGS_READ,
  UI_RPC_METHOD_KEYRING_AUTO_LOCK_SETTINGS_UPDATE,
  UI_RPC_METHOD_KEYRING_EXPORT_MNEMONIC,
  UI_RPC_METHOD_KEYRING_EXPORT_SECRET_KEY,
  UI_RPC_METHOD_KEYRING_HAS_MNEMONIC,
  UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY,
  UI_RPC_METHOD_KEYRING_IMPORT_WALLET,
  UI_RPC_METHOD_KEYRING_KEY_DELETE,
  UI_RPC_METHOD_KEYRING_READ_NEXT_DERIVATION_PATH,
  UI_RPC_METHOD_KEYRING_RESET,
  UI_RPC_METHOD_KEYRING_SET_MNEMONIC,
  UI_RPC_METHOD_KEYRING_STORE_CHECK_PASSWORD,
  UI_RPC_METHOD_KEYRING_STORE_CREATE,
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
  UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_CREATE,
  UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
  UI_RPC_METHOD_KEYRING_STORE_STATE,
  UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
  UI_RPC_METHOD_KEYRING_VALIDATE_MNEMONIC,
  UI_RPC_METHOD_LEDGER_IMPORT,
  UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
  UI_RPC_METHOD_NAVIGATION_CURRENT_URL_UPDATE,
  UI_RPC_METHOD_NAVIGATION_POP,
  UI_RPC_METHOD_NAVIGATION_PUSH,
  UI_RPC_METHOD_NAVIGATION_READ,
  UI_RPC_METHOD_NAVIGATION_READ_URL,
  UI_RPC_METHOD_NAVIGATION_TO_DEFAULT,
  UI_RPC_METHOD_NAVIGATION_TO_ROOT,
  UI_RPC_METHOD_PASSWORD_UPDATE,
  UI_RPC_METHOD_PREFERENCES_READ,
  UI_RPC_METHOD_PREVIEW_PUBKEYS,
  UI_RPC_METHOD_SET_FEATURE_GATES,
  UI_RPC_METHOD_SET_XNFT_PREFERENCES,
  UI_RPC_METHOD_SETTINGS_AGGREGATE_WALLETS_UPDATE,
  UI_RPC_METHOD_SETTINGS_DARK_MODE_READ,
  UI_RPC_METHOD_SETTINGS_DARK_MODE_UPDATE,
  UI_RPC_METHOD_SETTINGS_DEVELOPER_MODE_READ,
  UI_RPC_METHOD_SETTINGS_DEVELOPER_MODE_UPDATE,
  UI_RPC_METHOD_SETTINGS_LOCK_FULL_SCREEN_UPDATE,
  UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
  UI_RPC_METHOD_SOLANA_SIGN_ALL_TRANSACTIONS,
  UI_RPC_METHOD_SOLANA_SIGN_AND_SEND_TRANSACTION,
  UI_RPC_METHOD_SOLANA_SIGN_MESSAGE,
  UI_RPC_METHOD_SOLANA_SIGN_TRANSACTION,
  UI_RPC_METHOD_SOLANA_SIMULATE,
  UI_RPC_METHOD_USER_ACCOUNT_LOGOUT,
  UI_RPC_METHOD_USER_READ,
  UI_RPC_METHOD_USERNAME_ACCOUNT_CREATE,
  withContextPort,
} from "@coral-xyz/common";
import type { User } from "@coral-xyz/secure-background/legacyExport";
import type { KeyringStoreState } from "@coral-xyz/secure-background/types";
import type { Commitment } from "@solana/web3.js";

import type { Backend } from "../backend/core";
import type { Config, Handle, PublicKeyData } from "../types";

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
      return await handleKeyringStoreUnlock(ctx, params[0], params[1]);
    case UI_RPC_METHOD_KEYRING_STORE_LOCK:
      return await handleKeyringStoreLock(ctx);
    case UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS:
      return await handleKeyringStoreReadAllPubkeys(ctx);
    case UI_RPC_METHOD_KEYRING_KEY_DELETE:
      return await handleKeyringKeyDelete(ctx, params[0], params[1]);
    case UI_RPC_METHOD_KEYRING_STORE_STATE:
      return await handleKeyringStoreState(ctx);
    case UI_RPC_METHOD_KEYRING_READ_NEXT_DERIVATION_PATH:
      // @ts-ignore
      return await handleKeyringReadNextDerivationPath(ctx, ...params);
    case UI_RPC_METHOD_KEYRING_IMPORT_WALLET:
      // @ts-ignore
      return await handleKeyringImportWallet(ctx, ...params);
    case UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY:
      return await handleKeyringImportSecretKey(
        ctx,
        params[0],
        params[1],
        params[2]
      );
    case UI_RPC_METHOD_KEYRING_EXPORT_SECRET_KEY:
      return await handleKeyringExportSecretKey(ctx, params[0], params[1]);
    case UI_RPC_METHOD_KEYRING_HAS_MNEMONIC:
      return await handleKeyringHasMnemonic(ctx);
    case UI_RPC_METHOD_KEYRING_SET_MNEMONIC:
      return await handleKeyringSetMnemonic(ctx, params[0]);
    case UI_RPC_METHOD_KEYRING_VALIDATE_MNEMONIC:
      return await handleValidateMnemonic(ctx, params[0]);
    case UI_RPC_METHOD_KEYRING_EXPORT_MNEMONIC:
      return await handleKeyringExportMnemonic(ctx, params[0]);
    case UI_RPC_METHOD_KEYRING_AUTO_LOCK_SETTINGS_READ:
      return await handleKeyringAutoLockSettingsRead(ctx, params[0]);
    case UI_RPC_METHOD_KEYRING_AUTO_LOCK_SETTINGS_UPDATE:
      return await handleKeyringAutoLockSettingsUpdate(
        ctx,
        params[0],
        params[1]
      );
    case UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_CREATE:
      return await handleMnemonicCreate(ctx, params[0]);
    case UI_RPC_METHOD_PREVIEW_PUBKEYS:
      return await handlePreviewPubkeys(
        ctx,
        // @ts-ignore
        ...params
      );
    case UI_RPC_METHOD_KEYRING_RESET:
      return await handleKeyringReset(ctx);
    //
    // Ledger.
    //
    case UI_RPC_METHOD_LEDGER_IMPORT:
      return await handleKeyringLedgerImport(
        ctx,
        // @ts-ignore
        ...params
      );
    //
    // Navigation.
    //
    case UI_RPC_METHOD_NAVIGATION_PUSH:
      return await handleNavigationPush(ctx, params[0], params[1], params[2]);
    case UI_RPC_METHOD_NAVIGATION_POP:
      return await handleNavigationPop(ctx, params[0]);
    case UI_RPC_METHOD_NAVIGATION_CURRENT_URL_UPDATE:
      return await handleNavigationCurrentUrlUpdate(ctx, params[0], params[1]);
    case UI_RPC_METHOD_NAVIGATION_READ:
      const navigationData = await handleNavRead(ctx);
      return navigationData;
    case UI_RPC_METHOD_NAVIGATION_READ_URL:
      const url = await handleNavReadUrl(ctx);
      return url;
    case UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE:
      return await handleNavigationActiveTabUpdate(ctx, params[0]);
    case UI_RPC_METHOD_NAVIGATION_TO_ROOT:
      return await handleNavigationToRoot(ctx);
    case UI_RPC_METHOD_NAVIGATION_TO_DEFAULT:
      return await handleNavigationToDefault(ctx);
    //
    // Wallet app settings.
    //
    case UI_RPC_METHOD_PREFERENCES_READ:
      return await handlePreferencesRead(ctx, params[0]);
    case UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE:
      return await handleKeyringActiveWalletUpdate(ctx, params[0], params[1]);
    case UI_RPC_METHOD_SETTINGS_DARK_MODE_READ:
      return await handleDarkModeRead(ctx, params[0]);
    case UI_RPC_METHOD_SETTINGS_DARK_MODE_UPDATE:
      return await handleDarkModeUpdate(ctx, params[0]);
    case UI_RPC_METHOD_SETTINGS_LOCK_FULL_SCREEN_UPDATE:
      return await handleLockFullScreenUpdate(ctx, params[0]);
    case UI_RPC_METHOD_SETTINGS_DEVELOPER_MODE_READ:
      return await handleDeveloperModeRead(ctx, params[0]);
    case UI_RPC_METHOD_SETTINGS_DEVELOPER_MODE_UPDATE:
      return await handleDeveloperModeUpdate(ctx, params[0]);
    case UI_RPC_METHOD_SETTINGS_AGGREGATE_WALLETS_UPDATE:
      return await handleAggregateWalletsUpdate(ctx, params[0]);
    case UI_RPC_METHOD_APPROVED_ORIGINS_READ:
      return await handleApprovedOriginsRead(ctx, params[0]);
    case UI_RPC_METHOD_APPROVED_ORIGINS_UPDATE:
      return await handleApprovedOriginsUpdate(ctx, params[0]);
    case UI_RPC_METHOD_APPROVED_ORIGINS_DELETE:
      return await handleApprovedOriginsDelete(ctx, params[0]);
    case UI_RPC_METHOD_SET_FEATURE_GATES:
      return await handleSetFeatureGates(ctx, params[0]);
    case UI_RPC_METHOD_GET_FEATURE_GATES:
      return await handleGetFeatureGates(ctx);
    case UI_RPC_METHOD_GET_XNFT_PREFERENCES:
      return await handleGetXnftPreferences(ctx, params[0]);
    case UI_RPC_METHOD_SET_XNFT_PREFERENCES:
      return await handleSetXnftPreferences(
        ctx,
        params[0],
        params[1],
        params[2]
      );
    case UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD:
      return await handleBlockchainKeyringsAdd(
        ctx,
        // @ts-ignore
        ...params
      );
    case UI_RPC_METHOD_KEY_IS_COLD_UPDATE:
      return await handleKeyIsColdUpdate(ctx, params[0], params[1], params[2]);
    case UI_RPC_METHOD_HIDDEN_TOKENS_UPDATE:
      return await handleHiddenTokensUpdate(
        ctx,
        params[0],
        params[1],
        params[2]
      );
    //
    // Nicknames for keys.
    //
    case UI_RPC_METHOD_KEYNAME_READ:
      return await handleKeynameRead(ctx, params[0], params[1]);
    case UI_RPC_METHOD_KEYNAME_UPDATE:
      return await handleKeynameUpdate(ctx, params[0], params[1], params[2]);
    //
    // User.
    //
    case UI_RPC_METHOD_USER_READ:
      return await handleUserRead(ctx);
    case UI_RPC_METHOD_ALL_USERS_READ:
      return await handleAllUsersRead(ctx);
    case UI_RPC_METHOD_USERNAME_ACCOUNT_CREATE:
      // @ts-ignore
      return await handleUsernameAccountCreate(ctx, ...params);
    //
    // User Backpack account remote calls.
    //
    case UI_RPC_METHOD_USER_ACCOUNT_LOGOUT:
      // @ts-ignore
      return await handleUserAccountLogout(ctx, ...params);
    case UI_RPC_METHOD_FIND_WALLET_DESCRIPTOR:
      // @ts-ignore
      return await handleFindWalletDescriptor(ctx, ...params);
    //
    // Password.
    //
    case UI_RPC_METHOD_PASSWORD_UPDATE:
      return await handlePasswordUpdate(ctx, params[0], params[1]);
    case UI_RPC_METHOD_KEYRING_STORE_CHECK_PASSWORD:
      return await handleKeyringStoreCheckPassword(ctx, params[0]);
    //
    // Solana.
    //
    case UI_RPC_METHOD_SOLANA_SIMULATE:
      return await handleSolanaSimulate(ctx, params[0], params[1]);
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
    case UI_RPC_METHOD_COMMITMENT_UPDATE:
      return await handleCommitmentUpdate(ctx, params[0], params[1]);
    case UI_RPC_METHOD_EXPLORER_UPDATE:
      return await handleExplorerUpdate(ctx, params[0], params[1]);
    case UI_RPC_METHOD_CONNECTION_URL_READ:
      return await handleConnectionUrlRead(ctx, params[0], params[1]);
    case UI_RPC_METHOD_CONNECTION_URL_UPDATE:
      return await handleConnectionUrlUpdate(ctx, params[0], params[1]);
    //
    // Ethereum
    //
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
    case UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY:
      // @ts-ignore
      return await handleSignMessageForPublicKey(ctx, ...params);
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
  ...args: Parameters<Backend["keyringStoreUnlock"]>
) {
  try {
    const resp = await ctx.backend.keyringStoreUnlock(...args);
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

async function handlePreferencesRead(
  ctx: Context<Backend>,
  uuid: string
): Promise<RpcResponse<Preferences>> {
  const resp = await ctx.backend.preferencesRead(uuid);
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

async function handleKeyringStoreReadAllPubkeys(
  ctx: Context<Backend>
): Promise<RpcResponse<Array<string>>> {
  const resp = await ctx.backend.keyringStoreReadAllPubkeys();
  return [resp];
}

async function handleKeyringReadNextDerivationPath(
  ctx: Context<Backend>,
  ...args: Parameters<Backend["keyringReadNextDerivationPath"]>
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.keyringReadNextDerivationPath(...args);
  return [resp];
}

async function handleKeyringImportWallet(
  ctx: Context<Backend>,
  ...args: Parameters<Backend["keyringImportWallet"]>
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.keyringImportWallet(...args);
  return [resp];
}

async function handleKeyIsColdUpdate(
  ctx: Context<Backend>,
  blockchain: Blockchain,
  publicKey: string,
  isCold: boolean
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.keyIsColdUpdate(blockchain, publicKey, isCold);
  return [resp];
}

async function handleKeynameRead(
  ctx: Context<Backend>,
  pubkey: string,
  blockchain: Blockchain
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.keynameRead(pubkey, blockchain);
  return [resp];
}

async function handleKeynameUpdate(
  ctx: Context<Backend>,
  pubkey: string,
  newName: string,
  blockchain: Blockchain
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.keynameUpdate(pubkey, newName, blockchain);
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

async function handleUserRead(
  ctx: Context<Backend>
): Promise<RpcResponse<number>> {
  const resp = await ctx.backend.userRead();
  return [resp];
}

async function handleAllUsersRead(
  ctx: Context<Backend>
): Promise<RpcResponse<Array<User>>> {
  const resp = await ctx.backend.allUsersRead();
  return [resp];
}

async function handleUsernameAccountCreate(
  ctx: Context<Backend>,
  ...args: Parameters<Backend["usernameAccountCreate"]>
): Promise<RpcResponse<number>> {
  const resp = await ctx.backend.usernameAccountCreate(...args);
  return [resp];
}

async function handleUserAccountLogout(
  ctx: Context<Backend>,
  ...args: Parameters<Backend["userAccountLogout"]>
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.userAccountLogout(...args);
  return [resp];
}

async function handleFindWalletDescriptor(
  ctx: Context<Backend>,
  ...args: Parameters<Backend["findWalletDescriptor"]>
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.findWalletDescriptor(...args);
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

async function handleKeyringExportSecretKey(
  ctx: Context<Backend>,
  password: string,
  pubkey: string
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.keyringExportSecretKey(password, pubkey);
  return [resp];
}

function handleKeyringHasMnemonic(ctx: Context<Backend>): RpcResponse<string> {
  const resp = ctx.backend.keyringHasMnemonic();
  return [resp];
}

async function handleKeyringSetMnemonic(
  ctx: Context<Backend>,
  mnemonic: string
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.keyringSetMnemonic(mnemonic);
  return [resp];
}

function handleValidateMnemonic(
  ctx: Context<Backend>,
  mnemonic: string
): RpcResponse<boolean> {
  const resp = ctx.backend.validateMnemonic(mnemonic);
  return [resp];
}

async function handleKeyringExportMnemonic(
  ctx: Context<Backend>,
  password: string
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.keyringExportMnemonic(password);
  return [resp];
}

async function handleKeyringAutoLockSettingsRead(
  ctx: Context<Backend>,
  uuid: string
): Promise<RpcResponse<number | undefined>> {
  const resp = await ctx.backend.keyringAutoLockSettingsRead(uuid);
  return [resp];
}

async function handleKeyringAutoLockSettingsUpdate(
  ctx: Context<Backend>,
  seconds?: number,
  option?: AutolockSettingsOption
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.keyringAutoLockSettingsUpdate(seconds, option);
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

async function handleNavigationPush(
  ctx: Context<Backend>,
  url: string,
  tab?: string,
  pushAboveRoot?: boolean
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.navigationPush(url, tab, pushAboveRoot);
  return [resp];
}

async function handleNavigationPop(
  ctx: Context<Backend>,
  tab?: string
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.navigationPop(tab);
  return [resp];
}

async function handleNavigationCurrentUrlUpdate(
  ctx: Context<Backend>,
  url: string,
  activeTab?: string
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.navigationCurrentUrlUpdate(url, activeTab);
  return [resp];
}

async function handleNavRead(
  ctx: Context<Backend>
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.navRead();
  return [resp];
}

async function handleNavReadUrl(
  ctx: Context<Backend>
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.navReadUrl();
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

async function handleNavigationToDefault(
  ctx: Context<Backend>
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.navigationToDefault();
  return [resp];
}

async function handleDarkModeRead(
  ctx: Context<Backend>,
  uuid: string
): Promise<RpcResponse<boolean>> {
  const resp = await ctx.backend.darkModeRead(uuid);
  return [resp];
}

async function handleDarkModeUpdate(
  ctx: Context<Backend>,
  darkMode: boolean
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.darkModeUpdate(darkMode);
  return [resp];
}

async function handleLockFullScreenUpdate(
  ctx: Context<Backend>,
  isFullScreen: boolean
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.fullScreenUpdate(isFullScreen);
  return [resp];
}

async function handleDeveloperModeRead(
  ctx: Context<Backend>,
  uuid: string
): Promise<RpcResponse<boolean>> {
  const resp = await ctx.backend.developerModeRead(uuid);
  return [resp];
}

async function handleDeveloperModeUpdate(
  ctx: Context<Backend>,
  developerMode: boolean
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.developerModeUpdate(developerMode);
  return [resp];
}

async function handleAggregateWalletsUpdate(
  ctx: Context<Backend>,
  aggregateWallets: boolean
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.aggregateWalletsUpdate(aggregateWallets);
  return [resp];
}

async function handleConnectionUrlRead(
  ctx: Context<Backend>,
  uuid: string,
  blockchain: string
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.connectionUrlRead(
    uuid,
    blockchain as Blockchain
  );
  return [resp];
}

async function handleConnectionUrlUpdate(
  ctx: Context<Backend>,
  url: string,
  blockchain: string
): Promise<RpcResponse<boolean>> {
  const didChange = await ctx.backend.connectionUrlUpdate(
    url,
    blockchain as Blockchain
  );
  return [didChange];
}

async function handleCommitmentUpdate(
  ctx: Context<Backend>,
  commitment: string,
  blockchain: string
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.commitmentUpdate(
    commitment as Commitment,
    blockchain as Blockchain
  );
  return [resp];
}

async function handleExplorerUpdate(
  ctx: Context<Backend>,
  url: string,
  blockchain: string
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.explorerUpdate(url, blockchain as Blockchain);
  return [resp];
}

async function handleSolanaSimulate(
  ctx: Context<Backend>,
  txStr: string,
  accounts: Array<string>
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.solanaSimulate(txStr, accounts);
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

async function handleSignMessageForPublicKey(
  ctx: Context<Backend>,
  ...args: Parameters<Backend["signMessageForPublicKey"]>
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.signMessageForPublicKey(...args);
  return [resp];
}

async function handleApprovedOriginsRead(
  ctx: Context<Backend>,
  uuid: string
): Promise<RpcResponse<Array<string>>> {
  const resp = await ctx.backend.approvedOriginsRead(uuid);
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

async function handleGetXnftPreferences(ctx: Context<Backend>, uuid: string) {
  const resp = await ctx.backend.getXnftPreferences(uuid);
  return [resp];
}

async function handleSetXnftPreferences(
  ctx: Context<Backend>,
  uuid: string,
  xnftId: string,
  preference: XnftPreference
) {
  const resp = await ctx.backend.setXnftPreferences(uuid, xnftId, preference);
  return [resp];
}

async function handleBlockchainKeyringsAdd(
  ctx: Context<Backend>,
  ...args: Parameters<Backend["blockchainKeyringsAdd"]>
): Promise<RpcResponse<Array<string>>> {
  const resp = await ctx.backend.blockchainKeyringsAdd(...args);
  return [resp];
}

async function handleKeyringLedgerImport(
  ctx: Context<Backend>,
  ...args: Parameters<Backend["ledgerImport"]>
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.ledgerImport(...args);
  return [resp];
}

async function handlePreviewPubkeys(
  ctx: Context<Backend>,
  ...args: Parameters<Backend["previewPubkeys"]>
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.previewPubkeys(...args);
  return [resp];
}

async function handleHiddenTokensUpdate(
  ctx: Context<Backend>,
  ...args: Parameters<Backend["updateHiddenTokensForBlockchain"]>
): Promise<RpcResponse<string>> {
  const resp = await ctx.backend.updateHiddenTokensForBlockchain(...args);
  return [resp];
}
