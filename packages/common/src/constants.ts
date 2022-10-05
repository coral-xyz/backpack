import { BACKPACK_CONFIG_VERSION } from "./generated-config";

//
// Messaging communication channel topics.
//
export const CHANNEL_PLUGIN_RPC_REQUEST = "channel-plugin-request";
export const CHANNEL_PLUGIN_RPC_RESPONSE = "channel-plugin-response";
export const CHANNEL_PLUGIN_RENDER_REQUEST =
  "channel-channel-plugin-render-request";
export const CHANNEL_PLUGIN_LAUNCH_REQUEST =
  "channel-channel-plugin-launch-request";
export const CHANNEL_PLUGIN_NOTIFICATION =
  "channel-channel-plugin-notification";
export const CHANNEL_PLUGIN_CONNECTION_BRIDGE =
  "channel-channel-plugin-connection-bridge";
export const CHANNEL_POPUP_RPC = "channel-popup-rpc";
export const CHANNEL_POPUP_RESPONSE = "channel-popup-response";
export const CHANNEL_POPUP_NOTIFICATIONS = "channel-popup-notifications";
export const CHANNEL_SOLANA_RPC_REQUEST = "channel-solana-rpc-request";
export const CHANNEL_SOLANA_RPC_RESPONSE = "channel-solana-rpc-response";
export const CHANNEL_SOLANA_NOTIFICATION = "channel-solana-notification";
export const CHANNEL_SOLANA_CONNECTION_RPC_UI =
  "channel-solana-connection-rpc-ui";
export const CHANNEL_SOLANA_CONNECTION_INJECTED_REQUEST =
  "channel-solana-connection-injected-request";
export const CHANNEL_SOLANA_CONNECTION_INJECTED_RESPONSE =
  "channel-solana-connection-injected-response";
export const CHANNEL_ETHEREUM_RPC_REQUEST = "channel-ethereum-rpc-request";
export const CHANNEL_ETHEREUM_RPC_RESPONSE = "channel-ethereum-rpc-response";
export const CHANNEL_ETHEREUM_NOTIFICATION =
  "channel-ethereum-rpc-notification";
export const CHANNEL_ETHEREUM_CONNECTION_RPC_UI =
  "channel-ethereum-connection-rpc-ui";
export const CHANNEL_ETHEREUM_CONNECTION_INJECTED_REQUEST =
  "channel-ethereum-connection-injected-request";
export const CHANNEL_ETHEREUM_CONNECTION_INJECTED_RESPONSE =
  "channel-ethereum-connection-injected-response";

//
// Mobile specific webview messaging subsystem channels.
//
export const MOBILE_CHANNEL_HOST_RPC_REQUEST = "mobile-host-rpc-request";
export const MOBILE_CHANNEL_HOST_RPC_RESPONSE = "mobile-host-rpc-response";
export const MOBILE_CHANNEL_BG_REQUEST = "mobile-bg-request";
export const MOBILE_CHANNEL_BG_RESPONSE = "mobile-bg-response";
export const MOBILE_CHANNEL_BG_RESPONSE_INNER = "mobile-bg-response-inner";
export const MOBILE_CHANNEL_FE_REQUEST = "mobile-fe-request";
export const MOBILE_CHANNEL_FE_RESPONSE = "mobile-fe-response";
export const MOBILE_CHANNEL_FE_RESPONSE_INNER = "mobile-fe-response-inner";

//
// xNFT notifications sent from the host to the xNFT.
//
export const PLUGIN_NOTIFICATION_RENDER = "plugin-notification-render";
export const PLUGIN_NOTIFICATION_CONNECT = "plugin-notification-connect";
export const PLUGIN_NOTIFICATION_ON_CLICK = "plugin-notification-on-click";
export const PLUGIN_NOTIFICATION_ON_CHANGE = "plugin-notification-on-change";
export const PLUGIN_NOTIFICATION_MOUNT = "plugin-notification-mount";
export const PLUGIN_NOTIFICATION_UNMOUNT = "plugin-notification-unmount";
export const PLUGIN_NOTIFICATION_SOLANA_CONNECTION_URL_UPDATED =
  "plugin-notification-solana-connection-url-updated";
export const PLUGIN_NOTIFICATION_SOLANA_PUBLIC_KEY_UPDATED =
  "plugin-notification-solana-public-key-updated";
export const PLUGIN_NOTIFICATION_ETHEREUM_CONNECTION_URL_UPDATED =
  "plugin-notification-ethereum-connection-url-updated";
export const PLUGIN_NOTIFICATION_ETHEREUM_PUBLIC_KEY_UPDATED =
  "plugin-notification-ethereum-public-key-updated";

export const PLUGIN_REQUEST_SOLANA_SIGN_TRANSACTION =
  "plugin-request-solana-sign-tx";
export const PLUGIN_REQUEST_SOLANA_SIGN_ALL_TRANSACTIONS =
  "plugin-request-solana-sign-all-txs";
export const PLUGIN_REQUEST_SOLANA_SIGN_AND_SEND_TRANSACTION =
  "plugin-request-solana-sign-and-send-tx";
export const PLUGIN_REQUEST_SOLANA_SIGN_MESSAGE =
  "plugin-request-solana-sign-message";
export const PLUGIN_REQUEST_ETHEREUM_SIGN_TRANSACTION =
  "plugin-request-ethereum-sign-tx";
export const PLUGIN_REQUEST_ETHEREUM_SIGN_AND_SEND_TRANSACTION =
  "plugin-request-ethereum-sign-and-send-tx";
export const PLUGIN_REQUEST_ETHEREUM_SIGN_MESSAGE =
  "plugin-request-ethereum-sign-message";

//
// xNFT host API.
//
export const PLUGIN_RPC_METHOD_LOCAL_STORAGE_GET = "store-get";
export const PLUGIN_RPC_METHOD_LOCAL_STORAGE_PUT = "store-put";

//
// Trusted app API.
//
export const UI_RPC_METHOD_KEYRING_STORE_CREATE =
  "ui-rpc-method-keyring-store-create";
export const UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS =
  "ui-rpc-method-keyring-read-all-pubkeys";
export const UI_RPC_METHOD_KEYRING_STORE_STATE =
  "ui-rpc-method-keyring-store-state";
export const UI_RPC_METHOD_APPROVED_ORIGINS_READ =
  "ui-rpc-method-approved-origins-read";
export const UI_RPC_METHOD_APPROVED_ORIGINS_UPDATE =
  "ui-rpc-method-approved-origins-update";
export const UI_RPC_METHOD_APPROVED_ORIGINS_DELETE =
  "ui-rpc-method-approved-origins-delete";
export const UI_RPC_METHOD_KEYRING_STORE_KEEP_ALIVE =
  "ui-rpc-method-keyring-store-keep-alive";
export const UI_RPC_METHOD_KEYRING_STORE_CHECK_PASSWORD =
  "ui-rpc-method-keyring-store-check-password";
export const UI_RPC_METHOD_KEYRING_STORE_UNLOCK =
  "ui-rpc-method-keyring-store-unlock";
export const UI_RPC_METHOD_KEYRING_STORE_LOCK =
  "ui-rpc-method-keyring-store-lock";
export const UI_RPC_METHOD_KEYRING_DERIVE_WALLET =
  "ui-rpc-method-keyring-derive";
export const UI_RPC_METHOD_KEYRING_KEY_DELETE = "ui-rpc-method-keyring-delete";
export const UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY =
  "ui-rpc-method-keyring-import-wallet";
export const UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_CREATE =
  "ui-rpc-method-keyring-mnemonic-create";
export const UI_RPC_METHOD_PREVIEW_PUBKEYS =
  "ui-rpc-method-keyring-preview-pubkeys";
export const UI_RPC_METHOD_KEYRING_RESET = "ui-rpc-method-keyring-reset";
export const UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLETS =
  "ui-rpc-method-wallets-active";
export const UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLETS_UPDATE =
  "ui-rpc-method-wallets-active-update";
export const UI_RPC_METHOD_USERNAME_READ = "ui-rpc-method-username-read";
export const UI_RPC_METHOD_KEYNAME_READ = "ui-rpc-method-keyname-read";
export const UI_RPC_METHOD_KEYNAME_UPDATE = "ui-rpc-method-keyname-update";
export const UI_RPC_METHOD_PASSWORD_UPDATE = "ui-rpc-method-password-update";
export const UI_RPC_METHOD_KEYRING_EXPORT_SECRET_KEY =
  "ui-rpc-method-export-secret-key";
export const UI_RPC_METHOD_KEYRING_VALIDATE_MNEMONIC =
  "ui-rpc-method-validate-mnemonic";
export const UI_RPC_METHOD_KEYRING_EXPORT_MNEMONIC =
  "ui-rpc-method-export-mnemonic";
export const UI_RPC_METHOD_KEYRING_RESET_MNEMONIC =
  "ui-rpc-method-reset-mnemonic";
export const UI_RPC_METHOD_KEYRING_AUTOLOCK_READ =
  "ui-rpc-method-autolock-read";
export const UI_RPC_METHOD_KEYRING_AUTOLOCK_UPDATE =
  "ui-rpc-method-autolock-update";
export const UI_RPC_METHOD_NAVIGATION_PUSH = "ui-rpc-method-navigation-push";
export const UI_RPC_METHOD_NAVIGATION_POP = "ui-rpc-method-navigation-pop";
export const UI_RPC_METHOD_NAVIGATION_TO_ROOT =
  "ui-rpc-method-navigation-to-root";
export const UI_RPC_METHOD_NAVIGATION_CURRENT_URL_UPDATE =
  "ui-rpc-method-navigation-current-url-update";
export const UI_RPC_METHOD_NAVIGATION_READ = "ui-rpc-method-navigation-read";
export const UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE =
  "ui-rpc-method-navigation-active-tab-update";
export const UI_RPC_METHOD_SETTINGS_DARK_MODE_READ =
  "ui-rpc-method-settings-dark-mode-read";
export const UI_RPC_METHOD_SETTINGS_DARK_MODE_UPDATE =
  "ui-rpc-method-settings-dark-mode-update";
export const UI_RPC_METHOD_LEDGER_CONNECT = "ui-rpc-method-ledger-connect";
export const UI_RPC_METHOD_LEDGER_IMPORT = "ui-rpc-method-ledger-import";
export const UI_RPC_METHOD_PLUGIN_LOCAL_STORAGE_GET =
  "ui-rpc-method-plugin-storage-get";
export const UI_RPC_METHOD_PLUGIN_LOCAL_STORAGE_PUT =
  "ui-rpc-method-plugin-storage-put";
// Solana
export const UI_RPC_METHOD_SOLANA_CONNECTION_URL_READ =
  "ui-rpc-method-solana-connection-url-read";
export const UI_RPC_METHOD_SOLANA_CONNECTION_URL_UPDATE =
  "ui-rpc-method-solana-connection-url-update";
export const UI_RPC_METHOD_SOLANA_COMMITMENT_READ =
  "ui-rpc-method-solana-commitment-read";
