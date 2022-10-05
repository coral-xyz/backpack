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
export const UI_RPC_METHOD_ACTIVE_BLOCKCHAIN =
  "ui-rpc-method-blockchain-active";
export const UI_RPC_METHOD_ACTIVE_BLOCKCHAIN_UPDATE =
  "ui-rpc-method-blockchain-active-update";
export const UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLET =
  "ui-rpc-method-wallet-active";
export const UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLET_UPDATE =
  "ui-rpc-method-wallet-active-update";
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
export const UI_RPC_METHOD_SOLANA_COMMITMENT_UPDATE =
  "ui-rpc-method-solana-commitment-update";
export const UI_RPC_METHOD_SOLANA_SIMULATE = "ui-rpc-method-solana-simulate";
export const UI_RPC_METHOD_SOLANA_EXPLORER_READ =
  "ui-rpc-method-solana-explorer-read";
export const UI_RPC_METHOD_SOLANA_EXPLORER_UPDATE =
  "ui-rpc-method-solana-explorer-update";
export const UI_RPC_METHOD_SOLANA_SIGN_TRANSACTION =
  "ui-rpc-method-solana-sign-tx";
export const UI_RPC_METHOD_SOLANA_SIGN_ALL_TRANSACTIONS =
  "ui-rpc-method-solana-sign-all-txs";
export const UI_RPC_METHOD_SOLANA_SIGN_AND_SEND_TRANSACTION =
  "ui-rpc-method-solana-sign-and-send-tx";
export const UI_RPC_METHOD_SOLANA_SIGN_MESSAGE =
  "ui-rpc-method-solana-sign-message";
// Ethereum
export const UI_RPC_METHOD_ETHEREUM_EXPLORER_READ =
  "ui-rpc-method-ethereum-explorer-read";
export const UI_RPC_METHOD_ETHEREUM_EXPLORER_UPDATE =
  "ui-rpc-method-ethereum-explorer-update";
export const UI_RPC_METHOD_ETHEREUM_CONNECTION_URL_READ =
  "ui-rpc-method-ethereum-connection-url-read";
export const UI_RPC_METHOD_ETHEREUM_CONNECTION_URL_UPDATE =
  "ui-rpc-method-ethereum-connection-url-update";
export const UI_RPC_METHOD_ETHEREUM_CHAIN_ID_READ =
  "ui-rpc-method-ethereum-chain-id-read";
export const UI_RPC_METHOD_ETHEREUM_CHAIN_ID_UPDATE =
  "ui-rpc-method-ethereum-chain-id-update";
export const UI_RPC_METHOD_ETHEREUM_SIGN_TRANSACTION =
  "ui-rpc-method-ethereum-sign-tx";
export const UI_RPC_METHOD_ETHEREUM_SIGN_AND_SEND_TRANSACTION =
  "ui-rpc-method-ethereum-sign-and-send-tx";
export const UI_RPC_METHOD_ETHEREUM_SIGN_MESSAGE =
  "ui-rpc-method-ethereum-sign-message";

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
export const NOTIFICATION_KEYNAME_UPDATE = "notification-keyname-update";
export const NOTIFICATION_KEYRING_KEY_DELETE =
  "notification-keyring-key-delete";
export const NOTIFICATION_KEYRING_DERIVED_WALLET =
  "notification-keyring-derived-wallet";
export const NOTIFICATION_KEYRING_IMPORTED_SECRET_KEY =
  "notification-keyring-imported-secret-key";
export const NOTIFICATION_KEYRING_RESET_MNEMONIC =
  "notification-keyring-reset-mnemonic";
export const NOTIFICATION_KEYRING_CREATED = "notification-keyring-created";
export const NOTIFICATION_KEYRING_ACTIVE_BLOCKCHAIN_UPDATED =
  "notification-keyring-active-blockchain-updated";
export const NOTIFICATION_APPROVED_ORIGINS_UPDATE =
  "notification-approved-origins-update";
export const NOTIFICATION_NAVIGATION_URL_DID_CHANGE =
  "notification-navigation-url-did-change";
export const NOTIFICATION_AUTO_LOCK_SECS_UPDATED =
  "notification-auto-lock-secs-updated";
export const NOTIFICATION_DARK_MODE_UPDATED = "notification-dark-mode-updated";
// Solana specific
export const NOTIFICATION_SOLANA_ACTIVE_WALLET_UPDATED =
  "notification-keyring-solana-active-wallet-updated";
export const NOTIFICATION_SOLANA_CONNECTED = "notification-solana-connected";
export const NOTIFICATION_SOLANA_DISCONNECTED =
  "notification-solana-disconnected";
export const NOTIFICATION_SOLANA_CONNECTION_URL_UPDATED =
  "notification-solana-connection-url-updated";
export const NOTIFICATION_SOLANA_EXPLORER_UPDATED =
  "notification-solana-explorer-updated";
export const NOTIFICATION_SOLANA_COMMITMENT_UPDATED =
  "notification-solana-commitment-updated";
export const NOTIFICATION_SOLANA_SPL_TOKENS_DID_UPDATE =
  "notification-solana-spl-tokens-did-update";
// Ethereum specific
export const NOTIFICATION_ETHEREUM_CONNECTED =
  "notification-ethereum-connected";
export const NOTIFICATION_ETHEREUM_DISCONNECTED =
  "notification-ethereum-disconnected";
export const NOTIFICATION_ETHEREUM_CONNECTION_URL_UPDATED =
  "notification-ethereum-connection-url-updated";
export const NOTIFICATION_ETHEREUM_CHAIN_ID_UPDATED =
  "notification-ethereum-chain-id-updated";
export const NOTIFICATION_ETHEREUM_EXPLORER_UPDATED =
  "notification-ethereum-explorer-updated";
export const NOTIFICATION_ETHEREUM_ACTIVE_WALLET_UPDATED =
  "notification-keyring-ethereum-active-wallet-updated";
export const NOTIFICATION_ETHEREUM_TOKENS_DID_UPDATE =
  "notification-ethereum-tokens-did-update";
export const NOTIFICATION_ETHEREUM_FEE_DATA_DID_UPDATE =
  "notification-ethereum-fee-data-did-update";

//
// Ethereum web injected provider API.
//
export const ETHEREUM_RPC_METHOD_CONNECT = "ethereum-connect";
export const ETHEREUM_RPC_METHOD_DISCONNECT = "ethereum-disconnect";
export const ETHEREUM_RPC_METHOD_SIGN_TX = "ethereum-sign-tx";
export const ETHEREUM_RPC_METHOD_SIGN_AND_SEND_TX = "ethereum-sign-and-send-tx";
export const ETHEREUM_RPC_METHOD_SIGN_MESSAGE = "ethereum-sign-message";

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
export const SOLANA_RPC_METHOD_OPEN_XNFT = "solana-open-xnft";

//
// Ethereum connection api. These are the methods available for the background
// connection implementation (which the frontends use via message passing).
//
export const ETHEREUM_PROVIDER_RPC_GET_BALANCE =
  "ethereum-provider-rpc-get-balance";
export const ETHEREUM_PROVIDER_RPC_GET_CODE = "ethereum-provider-rpc-get-code";
export const ETHEREUM_PROVIDER_RPC_GET_STORAGE_AT =
  "ethereum-provider-rpc-get-storage-at";
export const ETHEREUM_PROVIDER_RPC_GET_TRANSACTION_COUNT =
  "ethereum-provider-rpc-get-transaction-count";
export const ETHEREUM_PROVIDER_RPC_GET_BLOCK =
  "ethereum-provider-rpc-get-block";
export const ETHEREUM_PROVIDER_RPC_GET_BLOCK_WITH_TRANSACTIONS =
  "ethereum-provider-rpc-get-block-with-transactions";
export const ETHEREUM_PROVIDER_RPC_GET_AVATAR =
  "ethereum-provider-rpc-get-avatar";
export const ETHEREUM_PROVIDER_RPC_GET_RESOLVER =
  "ethereum-provider-rpc-get-resolver";
export const ETHEREUM_PROVIDER_RPC_LOOKUP_ADDRESS =
  "ethereum-provider-rpc-lookup-address";
export const ETHEREUM_PROVIDER_RPC_RESOLVE_NAME =
  "ethereum-provider-rpc-resolve-name";
export const ETHEREUM_PROVIDER_RPC_GET_NETWORK =
  "ethereum-provider-rpc-get-network";
export const ETHEREUM_PROVIDER_RPC_GET_BLOCK_NUMBER =
  "ethereum-provider-rpc-get-block-number";
export const ETHEREUM_PROVIDER_RPC_GET_GAS_PRICE =
  "ethereum-provider-rpc-get-gas-price";
export const ETHEREUM_PROVIDER_RPC_GET_FEE_DATA =
  "ethereum-provider-rpc-get-fee-data";
export const ETHEREUM_PROVIDER_RPC_CALL = "ethereum-provider-rpc-call";
export const ETHEREUM_PROVIDER_RPC_ESTIMATE_GAS =
  "ethereum-provider-rpc-estimate-gas";
export const ETHEREUM_PROVIDER_RPC_GET_TRANSACTION =
  "ethereum-provider-rpc-get-transaction";
export const ETHEREUM_PROVIDER_RPC_GET_TRANSACTION_RECEIPT =
  "ethereum-provider-rpc-get-transaction-receipt";
export const ETHEREUM_PROVIDER_RPC_WAIT_FOR_TRANSACTION =
  "ethereum-provider-rpc-wait-for-transaction";

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
export const SOLANA_CONNECTION_RPC_GET_TOKEN_ACCOUNT_BALANCE =
  "get-token-account-balance";
export const SOLANA_CONNECTION_RPC_GET_BALANCE = "solana-get-balance";
export const SOLANA_CONNECTION_RPC_GET_SLOT = "solana-get-slot";
export const SOLANA_CONNECTION_RPC_GET_BLOCK_TIME = "solana-get-block-time";
export const SOLANA_CONNECTION_RPC_GET_PARSED_TOKEN_ACCOUNTS_BY_OWNER =
  "solana-get-parsed-token-accounts-by-owner";
export const SOLANA_CONNECTION_RPC_GET_TOKEN_LARGEST_ACCOUNTS =
  "solana-get-token-largest-accounts";
export const SOLANA_CONNECTION_RPC_GET_PARSED_ACCOUNT_INFO =
  "solana-get-parsed-account-info";
export const SOLANA_CONNECTION_RPC_GET_PARSED_PROGRAM_ACCOUNTS =
  "solana-get-parsed-program-accounts";

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
export const LEDGER_METHOD_SOLANA_SIGN_TRANSACTION =
  "ledger-method-solana-sign-transaction";
export const LEDGER_METHOD_SOLANA_SIGN_MESSAGE =
  "ledger-method-solana-sign-message";
export const LEDGER_METHOD_ETHEREUM_SIGN_TRANSACTION =
  "ledger-method-ethereum-sign-transaction";
export const LEDGER_METHOD_ETHEREUM_SIGN_MESSAGE =
  "ledger-method-ethereum-sign-message";
export const LEDGER_METHOD_ETHEREUM_SIGN_EIP712_MESSAGE =
  "ledger-method-ethereum-sign-eip712-message";
export const LEDGER_METHOD_ETHEREUM_SIGN_EIP712_HASHED_MESSAGE =
  "ledger-method-ethereum-sign-eip712-hashed-message";

export const PLUGIN_RPC_METHOD_WINDOW_OPEN = "rpc-method-window-open";

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

export const ALCHEMY_ETHEREUM_MAINNET_API_KEY =
  "DlJr6QuBC2EaE-L60-iqQQGq9hi9-XSZ";
