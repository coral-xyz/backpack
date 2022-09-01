import { BACKPACK_CONFIG_VERSION } from "./generated-config";

//
// Messaging communication channel topics.
//
export const CHANNEL_PLUGIN_RPC_REQUEST = "anchor-plugin-request";
export const CHANNEL_PLUGIN_RPC_RESPONSE = "anchor-plugin-response";
export const CHANNEL_PLUGIN_RENDER_REQUEST =
  "anchor-channel-plugin-render-request";
export const CHANNEL_PLUGIN_LAUNCH_REQUEST =
  "anchor-channel-plugin-launch-request";
export const CHANNEL_PLUGIN_NOTIFICATION = "anchor-channel-plugin-notification";
export const CHANNEL_PLUGIN_CONNECTION_BRIDGE =
  "anchor-channel-plugin-connection-bridge";
export const CHANNEL_POPUP_RPC = "anchor-popup-rpc";
export const CHANNEL_POPUP_RESPONSE = "anchor-popup-response";
export const CHANNEL_POPUP_NOTIFICATIONS = "anchor-popup-notifications";
export const CHANNEL_SOLANA_RPC_REQUEST = "anchor-solana-rpc-request";
export const CHANNEL_SOLANA_RPC_RESPONSE = "anchor-solana-rpc-response";
export const CHANNEL_SOLANA_NOTIFICATION = "anchor-solana-notification";
export const CHANNEL_SOLANA_CONNECTION_RPC_UI = "solana-connection-rpc-ui";
export const CHANNEL_SOLANA_CONNECTION_INJECTED_REQUEST =
  "solana-connection-injected-request";
export const CHANNEL_SOLANA_CONNECTION_INJECTED_RESPONSE =
  "solana-connection-injected-response";
export const CHANNEL_ETHEREUM_RPC_REQUEST = "anchor-ethereum-rpc-request";
export const CHANNEL_ETHEREUM_RPC_RESPONSE = "anchor-ethereum-rpc-response";
export const CHANNEL_ETHEREUM_NOTIFICATION = "anchor-ethereum-rpc-notification";
export const CHANNEL_ETHEREUM_CONNECTION_RPC_UI = "ethereum-connection-rpc-ui";
export const CHANNEL_ETHEREUM_CONNECTION_INJECTED_REQUEST =
  "ethereum-connection-injected-request";
export const CHANNEL_ETHEREUM_CONNECTION_INJECTED_RESPONSE =
  "ethereum-connection-injected-response";

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
export const PLUGIN_NOTIFICATION_RENDER = "render";
export const PLUGIN_NOTIFICATION_CONNECT = "connect";
export const PLUGIN_NOTIFICATION_ON_CLICK = "on-click";
export const PLUGIN_NOTIFICATION_ON_CHANGE = "on-change";
export const PLUGIN_NOTIFICATION_MOUNT = "mount";
export const PLUGIN_NOTIFICATION_UNMOUNT = "unmount";
export const PLUGIN_NOTIFICATION_CONNECTION_URL_UPDATED =
  "connection-url-updated";
export const PLUGIN_NOTIFICATION_PUBLIC_KEY_UPDATED = "public-key-updated";

//
// xNFT host API.
//
export const PLUGIN_RPC_METHOD_LOCAL_STORAGE_GET = "store-get";
export const PLUGIN_RPC_METHOD_LOCAL_STORAGE_PUT = "store-put";

//
// Trusted app API.
//
export const UI_RPC_METHOD_KEYRING_STORE_CREATE = "keyring-store-create";
export const UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS =
  "keyring-read-all-pubkeys";
export const UI_RPC_METHOD_KEYRING_STORE_STATE = "keyring-store-state";
export const UI_RPC_METHOD_APPROVED_ORIGINS_READ = "approved-origins-read";
export const UI_RPC_METHOD_APPROVED_ORIGINS_UPDATE = "approved-origins-update";
export const UI_RPC_METHOD_APPROVED_ORIGINS_DELETE = "approved-origins-delete";
export const UI_RPC_METHOD_KEYRING_STORE_KEEP_ALIVE =
  "keyring-store-keep-alive";
export const UI_RPC_METHOD_KEYRING_STORE_CHECK_PASSWORD =
  "keyring-store-check-password";
export const UI_RPC_METHOD_KEYRING_STORE_UNLOCK = "keyring-store-unlock";
export const UI_RPC_METHOD_KEYRING_STORE_LOCK = "keyring-store-lock";
export const UI_RPC_METHOD_KEYRING_DERIVE_WALLET = "keyring-derive";
export const UI_RPC_METHOD_KEYRING_KEY_DELETE = "keyring-delete";
export const UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY = "keyring-import-wallet";
export const UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_CREATE =
  "keyring-mnemonic-create";
export const UI_RPC_METHOD_PREVIEW_PUBKEYS = "keyring-preview-pubkeys";
export const UI_RPC_METHOD_KEYRING_RESET = "keyring-reset";
export const UI_RPC_METHOD_ACTIVE_BLOCKCHAIN = "blockchain-active";
export const UI_RPC_METHOD_ACTIVE_BLOCKCHAIN_UPDATE =
  "blockchain-active-update";
export const UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLET = "wallet-active";
export const UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLET_UPDATE =
  "wallet-active-update";
export const UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLETS = "wallets-active";
export const UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLETS_UPDATE =
  "wallets-active-update";
export const UI_RPC_METHOD_KEYNAME_READ = "keyname-read";
export const UI_RPC_METHOD_KEYNAME_UPDATE = "keyname-update";
export const UI_RPC_METHOD_PASSWORD_UPDATE = "password-update";
export const UI_RPC_METHOD_KEYRING_EXPORT_SECRET_KEY = "export-secret-key";
export const UI_RPC_METHOD_KEYRING_VALIDATE_MNEMONIC = "validate-mnemonic";
export const UI_RPC_METHOD_KEYRING_EXPORT_MNEMONIC = "export-mnemonic";
export const UI_RPC_METHOD_KEYRING_RESET_MNEMONIC = "reset-mnemonic";
export const UI_RPC_METHOD_KEYRING_AUTOLOCK_READ = "autolock-read";
export const UI_RPC_METHOD_KEYRING_AUTOLOCK_UPDATE = "autolock-update";
export const UI_RPC_METHOD_NAVIGATION_PUSH = "navigation-push";
export const UI_RPC_METHOD_NAVIGATION_POP = "navigation-pop";
export const UI_RPC_METHOD_NAVIGATION_TO_ROOT = "navigation-to-root";
export const UI_RPC_METHOD_NAVIGATION_CURRENT_URL_UPDATE =
  "navigation-current-url-update";
export const UI_RPC_METHOD_NAVIGATION_READ = "navigation-read";
export const UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE =
  "navigation-active-tab-update";
export const UI_RPC_METHOD_SETTINGS_DARK_MODE_READ = "settings-dark-mode-read";
export const UI_RPC_METHOD_SETTINGS_DARK_MODE_UPDATE =
  "settings-dark-mode-update";
export const UI_RPC_METHOD_LEDGER_CONNECT = "ui-rpc-method-ledger-connect";
export const UI_RPC_METHOD_LEDGER_IMPORT = "ledger-import";
export const UI_RPC_METHOD_PLUGIN_LOCAL_STORAGE_GET = "plugin-storage-get";
export const UI_RPC_METHOD_PLUGIN_LOCAL_STORAGE_PUT = "plugin-storage-put";
export const UI_RPC_METHOD_SOLANA_CONNECTION_URL_READ =
  "solana-connection-url-read";
export const UI_RPC_METHOD_SOLANA_CONNECTION_URL_UPDATE =
  "solana-connection-url-update";
export const UI_RPC_METHOD_SOLANA_COMMITMENT_READ = "solana-commitment-read";
export const UI_RPC_METHOD_SOLANA_COMMITMENT_UPDATE =
  "solana-commitment-update";
export const UI_RPC_METHOD_SOLANA_SIMULATE = "solana-simulate";
export const UI_RPC_METHOD_SOLANA_EXPLORER_READ = "solana-explorer-read";
export const UI_RPC_METHOD_SOLANA_EXPLORER_UPDATE = "solana-explorer-update";
export const UI_RPC_METHOD_SOLANA_SIGN_TRANSACTION = "solana-sign-tx";
export const UI_RPC_METHOD_SOLANA_SIGN_MESSAGE = "solana-sign-message";
export const UI_RPC_METHOD_SOLANA_SIGN_ALL_TRANSACTIONS = "solana-sign-all-txs";
export const UI_RPC_METHOD_SOLANA_SIGN_AND_SEND_TRANSACTION =
  "solana-sign-and-send-tx";
export const UI_RPC_METHOD_ETHEREUM_EXPLORER_READ = "ethereum-exporer-read";
export const UI_RPC_METHOD_ETHEREUM_EXPLORER_UPDATE = "ethereum-exporer-update";
export const UI_RPC_METHOD_ETHEREUM_CONNECTION_URL_READ =
  "ethereum-connection-url-read";
export const UI_RPC_METHOD_ETHEREUM_CONNECTION_URL_UPDATE =
  "ethereum-connection-url-update";
export const UI_RPC_METHOD_ETHEREUM_SIGN_TRANSACTION = "ethereum-sign-tx";
export const UI_RPC_METHOD_ETHEREUM_SIGN_AND_SEND_TRANSACTION =
  "ethereum-sign-and-send-tx";

//
// Notifications sent from the background script to observers.
//
export const NOTIFICATION_KEYRING_STORE_CREATED =
  "notification-keyring-store-created";
export const NOTIFICATION_KEYRING_STORE_LOCKED =
  "notification-keyring-store-locked";
export const NOTIFICATION_KEYRING_STORE_UNLOCKED =
  "notification-keyring-store-unlocked";
export const NOTIFICATION_KEYRING_STORE_RESET =
  "notification-keyring-store-reset";
export const NOTIFICATION_KEYNAME_UPDATE = "anchor-keyname-update";
export const NOTIFICATION_KEYRING_KEY_DELETE = "anchor-keyring-key-delete";
export const NOTIFICATION_KEYRING_DERIVED_WALLET =
  "anchor-keyring-derived-wallet";
export const NOTIFICATION_KEYRING_IMPORTED_SECRET_KEY =
  "anchor-keyring-imported-secret-key";
export const NOTIFICATION_KEYRING_RESET_MNEMONIC =
  "anchor-keyring-reset-mnemonic";
export const NOTIFICATION_KEYRING_CREATED = "anchor-keyring-created";
export const NOTIFICATION_KEYRING_ACTIVE_BLOCKCHAIN_UPDATED =
  "anchor-keyring-active-blockchain-updated";
export const NOTIFICATION_APPROVED_ORIGINS_UPDATE =
  "anchor-approved-origins-update";
export const NOTIFICATION_NAVIGATION_URL_DID_CHANGE =
  "anchor-navigation-url-did-change";
export const NOTIFICATION_AUTO_LOCK_SECS_UPDATED =
  "anchor-auto-lock-secs-updated";
export const NOTIFICATION_DARK_MODE_UPDATED = "anchor-dark-mode-updated";
// Solana specific
export const NOTIFICATION_SOLANA_ACTIVE_WALLET_UPDATED =
  "anchor-keyring-solana-active-wallet-updated";
export const NOTIFICATION_SOLANA_CONNECTED = "anchor-solana-connected";
export const NOTIFICATION_SOLANA_DISCONNECTED = "anchor-solana-disconnected";
export const NOTIFICATION_SOLANA_CONNECTION_URL_UPDATED =
  "anchor-solana-connection-url-updated";
export const NOTIFICATION_SOLANA_EXPLORER_UPDATED =
  "anchor-solana-explorer-updated";
export const NOTIFICATION_SOLANA_COMMITMENT_UPDATED =
  "anchor-solana-commitment-updated";
export const NOTIFICATION_SOLANA_SPL_TOKENS_DID_UPDATE =
  "anchor-solana-spl-tokens-did-update";
// Ethereum specific
export const NOTIFICATION_ETHEREUM_CONNECTED = "anchor-ethereum-connected";
export const NOTIFICATION_ETHEREUM_DISCONNECTED =
  "anchor-ethereum-disconnected";
export const NOTIFICATION_ETHEREUM_CONNECTION_URL_UPDATED =
  "anchor-ethereum-connection-url-updated";
export const NOTIFICATION_ETHEREUM_EXPLORER_UPDATED =
  "anchor-ethereum-explorer-updated";
export const NOTIFICATION_ETHEREUM_ACTIVE_WALLET_UPDATED =
  "anchor-keyring-ethereum-active-wallet-updated";
export const NOTIFICATION_ETHEREUM_TOKENS_DID_UPDATE =
  "anchor-ethereum-tokens-did-update";

//
// Solana web injected provider API.
//
export const SOLANA_RPC_METHOD_CONNECT = "solana-connect";
export const SOLANA_RPC_METHOD_DISCONNECT = "solana-disconnect";
export const SOLANA_RPC_METHOD_SIGN_AND_SEND_TX = "solana-sign-and-send-tx";
export const SOLANA_RPC_METHOD_SIGN_TX = "solana-sign-tx";
export const SOLANA_RPC_METHOD_SIGN_ALL_TXS = "solana-sign-all-txs";
export const SOLANA_RPC_METHOD_SIGN_MESSAGE = "solana-sign-message";
export const SOLANA_RPC_METHOD_SIMULATE = "solana-simulate";

//
// Solana connection api. These are the methods available for the background
// connection implementation (which the frontends use via message passing).
//
export const SOLANA_CONNECTION_RPC_GET_ACCOUNT_INFO = "solana-get-account-info";
export const SOLANA_CONNECTION_RPC_GET_LATEST_BLOCKHASH =
  "solana-get-latest-blockhash";
export const SOLANA_CONNECTION_RPC_GET_TOKEN_ACCOUNTS_BY_OWNER =
  "solana-get-token-accounts-by-owner";
export const SOLANA_CONNECTION_RPC_SEND_RAW_TRANSACTION =
  "solana-send-raw-transaction";
export const SOLANA_CONNECTION_RPC_CONFIRM_TRANSACTION =
  "solana-confirm-transaction";
export const SOLANA_CONNECTION_RPC_GET_PARSED_TRANSACTIONS =
  "solana-get-parsed-transactions";
export const SOLANA_CONNECTION_RPC_GET_PARSED_TRANSACTION =
  "solana-get-parsed-transaction";
export const SOLANA_CONNECTION_GET_MULTIPLE_ACCOUNTS_INFO =
  "solana-get-multiple-accounts-info";
export const SOLANA_CONNECTION_RPC_GET_CONFIRMED_SIGNATURES_FOR_ADDRESS_2 =
  "solana-get-confirmed-signatures-for-address-2";
export const SOLANA_CONNECTION_RPC_CUSTOM_SPL_TOKEN_ACCOUNTS =
  "solana-custom-spl-token-accounts";
export const SOLANA_CONNECTION_RPC_GET_PROGRAM_ACCOUNTS =
  "solana-get-program-accounts";
export const SOLANA_CONNECTION_RPC_GET_FEE_FOR_MESSAGE =
  "solana-get-fee-for-message";
export const SOLANA_CONNECTION_RPC_GET_MINIMUM_BALANCE_FOR_RENT_EXEMPTION =
  "solana-get-minimum-balance-for-rent-exemption";

//
// Ethereum web injected provider API.
//
export const ETHEREUM_RPC_METHOD_CONNECT = "ethereum-connect";
export const ETHEREUM_RPC_METHOD_DISCONNECT = "ethereum-disconnect";
export const ETHEREUM_RPC_METHOD_SIGN_AND_SEND_TX = "ethereum-sign-and-send-tx";
export const ETHEREUM_RPC_METHOD_SIGN_TX = "ethereum-sign-tx";
export const ETHEREUM_RPC_METHOD_SIGN_ALL_TXS = "ethereum-sign-all-txs";
export const ETHEREUM_RPC_METHOD_SIGN_MESSAGE = "ethereum-sign-message";
export const ETHEREUM_RPC_METHOD_SIMULATE = "ethereum-simulate";

//
// Ledger API.
//
export const LEDGER_IFRAME_URL =
  BACKPACK_CONFIG_VERSION === "development"
    ? "https://localhost:4443/dist"
    : "https://coral-xyz.github.io/ledger-injection/";

export const LEDGER_INJECTED_CHANNEL_REQUEST = "ledger-injected-request";
export const LEDGER_INJECTED_CHANNEL_RESPONSE = "ledger-injected-response";
export const LEDGER_METHOD_UNLOCK = "ledger-method-unlock";
export const LEDGER_METHOD_SIGN_TRANSACTION = "ledger-method-sign-transaction";
export const LEDGER_METHOD_SIGN_MESSAGE = "ledger-method-sign-message";

export const BACKGROUND_SERVICE_WORKER_READY = "service-worker-ready";

export const POST_MESSAGE_ORIGIN = "*";

export const EXTENSION_WIDTH = 375;
export const EXTENSION_HEIGHT = 600;

//
// UI View Model Constants.
//
export const TAB_BALANCES = "balances";
export const TAB_SWAP = "swap";
export const TAB_NFTS = "nfts";
export const TAB_APPS = "apps";
export const TAB_SET = new Set([TAB_BALANCES, TAB_SWAP, TAB_NFTS, TAB_APPS]);

export const NAV_COMPONENT_TOKEN = "balances/token";
export const NAV_COMPONENT_NFT_DETAIL = "nfts/detail";
export const NAV_COMPONENT_NFT_COLLECTION = "nfts/collection";

export const BACKEND_EVENT = "backend-event";

//
// Popup query routes.
//
export const QUERY_LOCKED = "locked=true";
export const QUERY_APPROVAL = "approval=true";
export const QUERY_LOCKED_APPROVAL = "locked-approval=true";
export const QUERY_APPROVE_TRANSACTION = "approve-tx=true";
export const QUERY_APPROVE_ALL_TRANSACTIONS = "approve-all-txs=true";
export const QUERY_APPROVE_MESSAGE = "approve-message=true";
export const QUERY_CONNECT_HARDWARE = "connect-hardware=true";
export const QUERY_ONBOARDING = "onboarding=true";

export const SIMULATOR_PORT = 9933;

export const NATIVE_ACCOUNT_RENT_EXEMPTION_LAMPORTS = 890880;
export const TOKEN_ACCOUNT_RENT_EXEMPTION_LAMPORTS = 2039280;

export const DISCORD_INVITE_LINK = "https://discord.gg/RfwUqWrn7T";
export const TWITTER_LINK = "https://twitter.com/xNFT_Backpack";
export const XNFT_GG_LINK = "https://xnft.gg";
export const BACKPACK_LINK = "https://backpack.app";
