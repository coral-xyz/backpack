import { BACKPACK_CONFIG_VERSION } from "./generated-config";

//
// Secure-background /client communication channels
//
export const CHANNEL_SECURE_BACKGROUND_REQUEST =
  "channel-secure-background-request";
export const CHANNEL_SECURE_BACKGROUND_RESPONSE =
  "channel-secure-background-response";
export const CHANNEL_SECURE_UI_REQUEST = "channel-secure-ui-request";
export const CHANNEL_SECURE_UI_RESPONSE = "channel-secure-ui-response";
export const CHANNEL_SECURE_BACKGROUND_EXTENSION_REQUEST =
  "channel-secure-ui-background-request";
export const CHANNEL_SECURE_BACKGROUND_EXTENSION_RESPONSE =
  "channel-secure-ui-background-response";
export const CHANNEL_SECURE_BACKGROUND_NOTIFICATION =
  "channel-secure-background-notification";

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
export const PLUGIN_NOTIFICATION_MOUNT = "plugin-notification-mount";
export const PLUGIN_NOTIFICATION_UPDATE_METADATA =
  "plugin-notification-update-metadata";
export const PLUGIN_NOTIFICATION_UNMOUNT = "plugin-notification-unmount";
export const PLUGIN_NOTIFICATION_PUBLIC_KEY_UPDATED =
  "plugin-notification-public-key-updated";
export const PLUGIN_NOTIFICATION_CONNECTION_URL_UPDATED =
  "plugin-notification-connection-url-updated";

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
export const UI_RPC_METHOD_APPROVED_ORIGINS_DELETE =
  "ui-rpc-method-approved-origins-delete";
export const UI_RPC_METHOD_APPROVED_ORIGINS_READ =
  "ui-rpc-method-approved-origins-read";
export const UI_RPC_METHOD_APPROVED_ORIGINS_UPDATE =
  "ui-rpc-method-approved-origins-update";
export const UI_RPC_METHOD_BLOCKCHAINS_ENABLED_READ =
  "ui-rpc-method-blockchains-enabled-read";
export const UI_RPC_METHOD_BLOCKCHAINS_ENABLED_ADD =
  "ui-rpc-method-blockchains-enabled-add";
export const UI_RPC_METHOD_BLOCKCHAINS_ENABLED_DELETE =
  "ui-rpc-method-blockchains-enabled-delete";
export const UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD =
  "ui-rpc-method-blockchain-keyrings-add";
export const UI_RPC_METHOD_FIND_WALLET_DESCRIPTOR =
  "ui-rpc-method-find-wallet-descriptor";
export const UI_RPC_METHOD_KEY_IS_COLD_UPDATE =
  "ui-rpc-method-key-is-cold-update";
export const UI_RPC_METHOD_KEYNAME_READ = "ui-rpc-method-keyname-read";
export const UI_RPC_METHOD_KEYNAME_UPDATE = "ui-rpc-method-keyname-update";
export const UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE =
  "ui-rpc-method-keyring-active-wallet-update";
export const UI_RPC_METHOD_KEYRING_AUTO_LOCK_SETTINGS_READ =
  "ui-rpc-method-auto-lock-settings-read";
export const UI_RPC_METHOD_KEYRING_AUTO_LOCK_SETTINGS_UPDATE =
  "ui-rpc-method-auto-lock-settings-update";
export const UI_RPC_METHOD_KEYRING_READ_NEXT_DERIVATION_PATH =
  "ui-rpc-method-keyring-read-next-derivation-path";
export const UI_RPC_METHOD_KEYRING_IMPORT_WALLET =
  "ui-rpc-method-keyring-import-wallet";
export const UI_RPC_METHOD_KEYRING_SET_MNEMONIC =
  "ui-rpc-method-keyring-set-mnemonic";
export const UI_RPC_METHOD_KEYRING_EXPORT_MNEMONIC =
  "ui-rpc-method-export-mnemonic";
export const UI_RPC_METHOD_KEYRING_EXPORT_SECRET_KEY =
  "ui-rpc-method-export-secret-key";
export const UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY =
  "ui-rpc-method-keyring-import-secret-key";
export const UI_RPC_METHOD_KEYRING_HAS_MNEMONIC =
  "ui-rpc-method-keyring-has-mnemonic";
export const UI_RPC_METHOD_KEYRING_KEY_DELETE = "ui-rpc-method-keyring-delete";
export const UI_RPC_METHOD_KEYRING_RESET = "ui-rpc-method-keyring-reset";
export const UI_RPC_METHOD_KEYRING_STORE_CHECK_PASSWORD =
  "ui-rpc-method-keyring-store-check-password";
export const UI_RPC_METHOD_KEYRING_STORE_CREATE =
  "ui-rpc-method-keyring-store-create";
export const UI_RPC_METHOD_KEYRING_STORE_LOCK =
  "ui-rpc-method-keyring-store-lock";
export const UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_CREATE =
  "ui-rpc-method-keyring-mnemonic-create";
export const UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS =
  "ui-rpc-method-keyring-read-all-pubkeys";
export const UI_RPC_METHOD_KEYRING_STORE_STATE =
  "ui-rpc-method-keyring-store-state";
export const UI_RPC_METHOD_KEYRING_STORE_UNLOCK =
  "ui-rpc-method-keyring-store-unlock";
export const UI_RPC_METHOD_KEYRING_VALIDATE_MNEMONIC =
  "ui-rpc-method-validate-mnemonic";
export const UI_RPC_METHOD_LEDGER_CONNECT = "ui-rpc-method-ledger-connect";
export const UI_RPC_METHOD_LEDGER_IMPORT = "ui-rpc-method-ledger-import";
export const UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE =
  "ui-rpc-method-navigation-active-tab-update";
export const UI_RPC_METHOD_NAVIGATION_CURRENT_URL_UPDATE =
  "ui-rpc-method-navigation-current-url-update";
export const UI_RPC_METHOD_NAVIGATION_POP = "ui-rpc-method-navigation-pop";
export const UI_RPC_METHOD_NAVIGATION_PUSH = "ui-rpc-method-navigation-push";
export const UI_RPC_METHOD_NAVIGATION_READ = "ui-rpc-method-navigation-read";
export const UI_RPC_METHOD_NAVIGATION_READ_URL =
  "ui-rpc-method-navigation-read-url";
export const UI_RPC_METHOD_NAVIGATION_TO_ROOT =
  "ui-rpc-method-navigation-to-root";
export const UI_RPC_METHOD_NAVIGATION_TO_DEFAULT =
  "ui-rpc-method-navigation-to-default";
export const UI_RPC_METHOD_PASSWORD_UPDATE = "ui-rpc-method-password-update";
export const UI_RPC_METHOD_SET_FEATURE_GATES =
  "ui-rpc-method-set-feature-gates";
export const UI_RPC_METHOD_GET_FEATURE_GATES =
  "ui-rpc-method-get-feature-gates";
export const UI_RPC_METHOD_GET_XNFT_PREFERENCES =
  "ui-rpc-method-get-xnft-preference";
export const UI_RPC_METHOD_SET_XNFT_PREFERENCES =
  "ui-rpc-method-set-xnft-preference";

export const UI_RPC_METHOD_PREVIEW_PUBKEYS =
  "ui-rpc-method-keyring-preview-pubkeys";
export const UI_RPC_METHOD_SETTINGS_DARK_MODE_READ =
  "ui-rpc-method-settings-dark-mode-read";
export const UI_RPC_METHOD_SETTINGS_DARK_MODE_UPDATE =
  "ui-rpc-method-settings-dark-mode-update";
export const UI_RPC_METHOD_SETTINGS_LOCK_FULL_SCREEN_UPDATE =
  "ui-rpc-method-settings-lock-full-screen-update";
export const UI_RPC_METHOD_SETTINGS_DEVELOPER_MODE_READ =
  "ui-rpc-method-settings-developer-mode-read";
export const UI_RPC_METHOD_SETTINGS_DEVELOPER_MODE_UPDATE =
  "ui-rpc-method-settings-developer-mode-update";
export const UI_RPC_METHOD_SETTINGS_AGGREGATE_WALLETS_UPDATE =
  "ui-rpc-method-settings-aggregate-wallet-update";
export const UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY =
  "ui-rpc-method-sign-message-for-public-key";
export const UI_RPC_METHOD_TRY_TO_SIGN_MESSAGE =
  "ui-rpc-method-try-to-sign-message";
export const UI_RPC_METHOD_USER_READ = "ui-rpc-method-user-read";
export const UI_RPC_METHOD_ALL_USERS_READ = "ui-rpc-method-all-users-read";
export const UI_RPC_METHOD_USERNAME_ACCOUNT_CREATE =
  "ui-rpc-method-username-account-create";
export const UI_RPC_METHOD_PREFERENCES_READ = "ui-rpc-method-references-read";
// User account methods that interact with the API
export const UI_RPC_METHOD_USER_ACCOUNT_LOGOUT = "ui-rpc-method-user-logout";
export const UI_RPC_METHOD_USER_ACCOUNT_READ =
  "ui-rpc-method-user-account-read";

// Solana
export const UI_RPC_METHOD_COMMITMENT_UPDATE =
  "ui-rpc-method-commitment-update";
export const UI_RPC_METHOD_CONNECTION_URL_READ =
  "ui-rpc-method-connection-url-read";
export const UI_RPC_METHOD_CONNECTION_URL_UPDATE =
  "ui-rpc-method-connection-url-update";
export const UI_RPC_METHOD_EXPLORER_UPDATE = "ui-rpc-method-explorer-update";
export const UI_RPC_METHOD_HIDDEN_TOKENS_UPDATE =
  "ui-rpc-method-hidden-tokens-update";
export const UI_RPC_METHOD_SOLANA_SIGN_ALL_TRANSACTIONS =
  "ui-rpc-method-solana-sign-all-txs";
export const UI_RPC_METHOD_SOLANA_SIGN_AND_SEND_TRANSACTION =
  "ui-rpc-method-solana-sign-and-send-tx";
export const UI_RPC_METHOD_SOLANA_SIGN_MESSAGE =
  "ui-rpc-method-solana-sign-message";
export const UI_RPC_METHOD_SOLANA_SIGN_TRANSACTION =
  "ui-rpc-method-solana-sign-tx";
export const UI_RPC_METHOD_SOLANA_SIMULATE = "ui-rpc-method-solana-simulate";
// Ethereum
export const UI_RPC_METHOD_ETHEREUM_CHAIN_ID_READ =
  "ui-rpc-method-ethereum-chain-id-read";
export const UI_RPC_METHOD_ETHEREUM_CHAIN_ID_UPDATE =
  "ui-rpc-method-ethereum-chain-id-update";
export const UI_RPC_METHOD_ETHEREUM_SIGN_AND_SEND_TRANSACTION =
  "ui-rpc-method-ethereum-sign-and-send-tx";
export const UI_RPC_METHOD_ETHEREUM_SIGN_MESSAGE =
  "ui-rpc-method-ethereum-sign-message";
export const UI_RPC_METHOD_ETHEREUM_SIGN_TRANSACTION =
  "ui-rpc-method-ethereum-sign-tx";

//
// Notifications sent from the background script to observers.
//

export const NOTIFICATION_KEY_IS_COLD_UPDATE =
  "notification-key-is-cold-update";
export const NOTIFICATION_APPROVED_ORIGINS_UPDATE =
  "notification-approved-origins-update";
export const NOTIFICATION_AUTO_LOCK_SETTINGS_UPDATED =
  "notification-auto-lock-settings-updated";
export const NOTIFICATION_BLOCKCHAIN_KEYRING_CREATED =
  "notification-blockchain-keyring-created";
export const NOTIFICATION_BLOCKCHAIN_KEYRING_DELETED =
  "notification-blockchain-keyring-deleted";
export const NOTIFICATION_AGGREGATE_WALLETS_UPDATED =
  "notification-aggregate-wallets-updated";
export const NOTIFICATION_DARK_MODE_UPDATED = "notification-dark-mode-updated";
export const NOTIFICATION_LOCK_FULL_SCREEN_UPDATED =
  "notification-lock-full-screen-updated";
export const NOTIFICATION_DEVELOPER_MODE_UPDATED =
  "notification-developer-mode-updated";
export const NOTIFICATION_FEATURE_GATES_UPDATED =
  "notification-feature-gates-updated";
export const NOTIFICATION_KEYNAME_UPDATE = "notification-keyname-update";
export const NOTIFICATION_KEYRING_ACTIVE_BLOCKCHAIN_UPDATED =
  "notification-keyring-active-blockchain-updated";
export const NOTIFICATION_KEYRING_CREATED = "notification-keyring-created";
export const NOTIFICATION_KEYRING_IMPORTED_WALLET =
  "notification-keyring-imported-wallet";
export const NOTIFICATION_KEYRING_DERIVED_WALLET =
  "notification-keyring-derived-wallet";
export const NOTIFICATION_KEYRING_IMPORTED_SECRET_KEY =
  "notification-keyring-imported-secret-key";
export const NOTIFICATION_KEYRING_KEY_DELETE =
  "notification-keyring-key-delete";
export const NOTIFICATION_KEYRING_SET_MNEMONIC =
  "notification-keyring-set-mnemonic";
export const NOTIFICATION_KEYRING_RESET_MNEMONIC =
  "notification-keyring-reset-mnemonic";
export const NOTIFICATION_KEYRING_STORE_CREATED =
  "notification-keyring-store-created";
export const NOTIFICATION_KEYRING_STORE_LOCKED =
  "NOTIFICATION_KEYRING_STORE_LOCKED";
export const NOTIFICATION_KEYRING_STORE_RESET =
  "notification-keyring-store-reset";
export const NOTIFICATION_KEYRING_STORE_UNLOCKED =
  "NOTIFICATION_KEYRING_STORE_UNLOCKED";
export const NOTIFICATION_NAVIGATION_URL_DID_CHANGE =
  "notification-navigation-url-did-change";
export const NOTIFICATION_KEYRING_STORE_USERNAME_ACCOUNT_CREATED =
  "notification-username-account-created";
export const NOTIFICATION_KEYRING_STORE_USER_AVATAR_UPDATED =
  "notification-user-avatar-updated";
export const NOTIFICATION_KEYRING_STORE_ACTIVE_USER_UPDATED =
  "notification-active-user-updated";
export const NOTIFICATION_KEYRING_STORE_REMOVED_USER =
  "notification-keyring-store-removed-user";
export const NOTIFICATION_ACTIVE_BLOCKCHAIN_UPDATED =
  "notification-keyring-active-blockchain-updated";
export const NOTIFICATION_XNFT_PREFERENCE_UPDATED =
  "notification-xnft-preference-updated";
// Ethereum specific notifications
export const NOTIFICATION_ETHEREUM_CHAIN_ID_UPDATED =
  "notification-ethereum-chain-id-updated";
export const NOTIFICATION_ETHEREUM_CONNECTED =
  "notification-ethereum-connected";
export const NOTIFICATION_ETHEREUM_DISCONNECTED =
  "notification-ethereum-disconnected";
export const NOTIFICATION_ETHEREUM_FEE_DATA_DID_UPDATE =
  "notification-ethereum-fee-data-did-update";
export const NOTIFICATION_ETHEREUM_TOKENS_DID_UPDATE =
  "notification-ethereum-tokens-did-update";
// Solana specific notifications
export const NOTIFICATION_ACTIVE_WALLET_UPDATED =
  "notification-keyring-active-wallet-updated";
export const NOTIFICATION_COMMITMENT_UPDATED =
  "notification-commitment-updated";
export const NOTIFICATION_SOLANA_CONNECTED = "notification-solana-connected";
export const NOTIFICATION_CONNECTION_URL_UPDATED =
  "notification-connection-url-updated";
export const NOTIFICATION_SOLANA_DISCONNECTED =
  "notification-solana-disconnected";
export const NOTIFICATION_EXPLORER_UPDATED = "notification-explorer-updated";
export const NOTIFICATION_SOLANA_SPL_TOKENS_DID_UPDATE =
  "notification-solana-spl-tokens-did-update";

//
// Ethereum web injected provider API.
//
export const ETHEREUM_RPC_METHOD_CONNECT = "ethereum-connect";
export const ETHEREUM_RPC_METHOD_SWITCH_CHAIN = "ethereum-switch-chain";
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

export const CONTENT_SCRIPT_KEEP_ALIVE = "keep-alive";

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
export const SOLANA_CONNECTION_RPC_GET_ACCOUNT_INFO_AND_CONTEXT =
  "solana-get-account-info-and-context";
export const SOLANA_CONNECTION_RPC_GET_LATEST_BLOCKHASH =
  "solana-get-latest-blockhash";
export const SOLANA_CONNECTION_RPC_GET_LATEST_BLOCKHASH_AND_CONTEXT =
  "solana-get-latest-blockhash-and-context";
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
export const SOLANA_CONNECTION_RPC_CUSTOM_SPL_METADATA_URI =
  "solana-custom-spl-metadata-uri";
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
export const SOLANA_CONNECTION_RPC_GET_ADDRESS_LOOKUP_TABLE =
  "solana-get-address-lookup-table";
export const SOLANA_CONNECTION_RPC_GET_PARSED_ACCOUNT_INFO =
  "solana-get-parsed-account-info";
export const SOLANA_CONNECTION_RPC_GET_PARSED_PROGRAM_ACCOUNTS =
  "solana-get-parsed-program-accounts";

//
// Ledger API.
//
export const LEDGER_IFRAME_URL =
  "https://coral-xyz.github.io/ledger-injection/";
// BACKPACK_CONFIG_VERSION === "development"
//   ? "https://localhost:4443/dist"
//   : "https://coral-xyz.github.io/ledger-injection/";

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

export const PLUGIN_RPC_METHOD_PLUGIN_OPEN = "rpc-method-plugin-open";
export const PLUGIN_RPC_METHOD_POP_OUT = "rpc-method-pop-out";

export const PLUGIN_RPC_METHOD_RESIZE_EXTENSION_WINDOW =
  "rpc-method-resize-extension-window";

export const BACKGROUND_SERVICE_WORKER_READY = "service-worker-ready";

export const POST_MESSAGE_ORIGIN = "*";

export const EXTENSION_WIDTH = 375;
export const EXTENSION_HEIGHT = 600;

//
// UI View Model Constants.
//
export const TAB_BALANCES = "balances";
export const TAB_TOKENS = "tokens";
export const TAB_SWAP = "swap";
export const TAB_NFTS = "nfts";
export const TAB_APPS = "apps";
export const TAB_XNFT = "xnft";
export const TAB_RECENT_ACTIVITY = "recent-activity";
export const TAB_SET = new Set([
  TAB_BALANCES,
  TAB_TOKENS,
  TAB_SWAP,
  TAB_NFTS,
  TAB_APPS,
  TAB_XNFT,
  TAB_RECENT_ACTIVITY,
]);
export const TAB_BALANCES_SET = new Set([
  TAB_TOKENS,
  TAB_NFTS,
  TAB_RECENT_ACTIVITY,
]);

export const NAV_COMPONENT_TOKEN = "tokens/token";
export const NAV_COMPONENT_NFT_DETAIL = "nfts/detail";
export const NAV_COMPONENT_NFT_COLLECTION = "nfts/collection";
export const NAV_COMPONENT_NFT_EXPERIENCE = "nfts/experience";
export const NAV_COMPONENT_XNFT = "xnft/*";

export const BACKEND_EVENT = "backend-event";

//
// Popup query routes.
//
export const QUERY_LOCKED = "locked=true";
export const QUERY_LOCKED_APPROVAL = "locked-approval=true";
export const QUERY_APPROVAL = "approve-origin=true";
export const QUERY_APPROVE_TRANSACTION = "approve-tx=true";
export const QUERY_APPROVE_ALL_TRANSACTIONS = "approve-all-txs=true";
export const QUERY_APPROVE_MESSAGE = "approve-message=true";
export const QUERY_CONNECT_HARDWARE = "connect-hardware=true";
export const QUERY_ONBOARDING = "onboarding=true";
export const QUERY_ADD_USER_ACCOUNT = "add-user-account=true";

export const SIMULATOR_PORT = 9933;

export const NATIVE_ACCOUNT_RENT_EXEMPTION_LAMPORTS = 890880 as const;
export const TOKEN_ACCOUNT_RENT_EXEMPTION_LAMPORTS = 2039280 as const;

export const DISCORD_INVITE_LINK = "https://discord.gg/RhKxgS8SaD";
export const TWITTER_LINK = "https://twitter.com/xNFT_Backpack";
export const XNFT_GG_LINK = "https://xnft.gg";
export const BACKPACK_LINK = "https://backpack.app";
export const BACKPACK_TERMS_OF_SERVICE = "https://backpack.app/terms";
export const BACKPACK_GITHUB_LINK = "https://github.com/coral-xyz/backpack";

export const EXCHANGE_TERMS_OF_SERVICE_URL =
  "https://dev.treklabs.xyz/files/Trek%20Labs%20User%20Agreement.pdf";
export const EXCHANGE_SUMSUB_DOCS_URL =
  "https://sumsub.com/supported-documents";

export const AVATAR_BASE_URL = "https://swr.xnftdata.com/avatars";
export const BACKEND_API_URL = "https://backpack-api.xnfts.dev";
export const MESSAGING_COMMUNICATION_PUSH = "MESSAGING_COMMUNICATION_PUSH";
export const MESSAGING_COMMUNICATION_FETCH = "MESSAGING_COMMUNICATION_FETCH";
export const MESSAGING_COMMUNICATION_FETCH_RESPONSE =
  "MESSAGING_COMMUNICATION_FETCH_RESPONSE";

export const UNKNOWN_ICON_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12ZM10.9645 15.3015C10.9645 15.7984 11.3677 16.2015 11.8645 16.2015C12.3612 16.2015 12.7645 15.7984 12.7645 15.3015C12.7645 14.8047 12.3612 14.4015 11.8645 14.4015C11.3677 14.4015 10.9645 14.8047 10.9645 15.3015ZM13.3939 11.8791C13.9135 11.5085 14.2656 11.1748 14.4511 10.8777C14.8776 10.1948 14.8728 9.02088 14.0532 8.35291C12.9367 7.44383 10.8943 7.77224 9.6001 8.49763L10.2067 9.7155C10.9189 9.35193 11.553 9.17 12.1092 9.17C12.6546 9.17 13.1214 9.36453 13.1214 9.91004C13.1214 10.4891 12.6543 10.8231 12.1713 11.1684L12.171 11.1686L12.1645 11.173C11.9915 11.2996 11.8416 11.4235 11.7147 11.5442C11.5451 11.7059 11.4168 11.8621 11.3298 12.013C11.1013 12.4085 11.1014 12.736 11.1019 13.152V13.2015H12.5761L12.576 13.158C12.5755 12.6312 12.5753 12.4844 13.3939 11.8791ZM20.5 12C20.5 16.6944 16.6944 20.5 12 20.5C7.30558 20.5 3.5 16.6944 3.5 12C3.5 7.30558 7.30558 3.5 12 3.5C16.6944 3.5 20.5 7.30558 20.5 12ZM22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z' fill='%238F929E'/%3E%3C/svg%3E";

// Image displayed in the event of a broken NFT.
export const UNKNOWN_NFT_ICON_SRC =
  "data:image/png;base64,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";

export const LOCKABLE_COLLECTIONS = [
  "J1S9H3QjnRtBbbuD4HjPV6RpRhwuk4zKbxsnCHuTgh9w", // Mad Lads
  "DSwfRF1jhhu6HpSuzaig1G19kzP73PfLZBPLofkw6fLD", // Degen Ape Academy
  "6mszaj17KSfVqADrQj3o4W3zoLMTykgmV37W4QadCczK", // Claynosaurz
  "SMBtHCCC6RYRutFEPb4gZqeBLUZbMNhRKaMKZZLHi7W", // SMB Gen2
  "5PA96eCFHJSFPY9SWFeRJUHrpoNF5XZL6RrE1JADXhxf", // Tensorians
  "J6RJFQfLgBTcoAt3KoZFiTFW9AbufsztBNDgZ7Znrp1Q", // Galactic Geckos
  "4EaFiJNsoQzvTQckxZVsPfSttpgAT1Tehtg6bp7AuSfg", // Rouge Sharks
  "BuAYoZPVwQw4AfeEpHTx6iGPbQtB27W7tJUjgyLzgiko", // Quekz
  "54ZnA77u7j6niHEyyD9ZZ6QAkqjCqKY4k6iPT82wxgJ8", // Chads
  "7BQdHnBKERaCYCnwLbbSoYHQZxcq7zLenYERDp94o18z", // Aurory
  "3saAedkM9o5g1u5DCqsuMZuC4GRqPB4TuMkvSsSVvGQ3", // Okay Bears
  "CJMFQVAfnNu9XAAH2Kj5Ebh6J5bYTeN7phi2zBQdM4EM", // Photo Finish / Stylish Studs
  "8Rt3Ayqth4DAiPnW9MDFi63TiQJHmohfTWLMQFHi4KZH", // SMB Gen3
  "HF6SFg5RkWNQrEhmnXV7H8EmLPxg3jDaggEni1SMVAi6", // Degen Ape HS
];

// Load a fixed amount of public keys for various actions, e.g. import list,
// searching mnemonics
export const LOAD_PUBLIC_KEY_AMOUNT = 20;

export const DEFAULT_PUBKEY_STR = "11111111111111111111111111111111";

export const MOBILE_CHANNEL_LOGS = "mobile-logs";

export const BACKPACK_TEAM = [
  "ee7ce804-44b2-4360-bfbb-28e14cd0499b",
  "29c33e60-d54a-4fe4-80e9-4bbfcc6c69b8",
  "446a5f21-35b9-4248-970f-7b4558f57e21",
  "6ecf7d82-095d-4fa3-9830-3567b286066d",
  "68daeda7-2c20-49ea-9dab-f7a3ebd45ab5",
  "931fac1c-0fb1-4e0a-9119-0a9112506db1",
  "47dd7685-8eb1-4d4e-bbab-b7790eebb2b9",
  "b580347f-2ec8-4600-8af1-0f5982dc93e1",
  "b6615f78-b096-4d50-b247-05db6fe74ea4",
  "7c01a3a2-dc39-4369-afb8-0dd2189412fc",
  "50752e18-8796-4702-b140-a3d78960ee94",
];

export const MOBILE_SECRET_PASSWORD_KEY = "SECRET_VAR";
export const MOBILE_USER_PASSWORD_KEY = "user-password";
