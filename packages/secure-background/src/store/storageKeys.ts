export enum PersistentStorageKeys {
  USER_PUBLIC_KEY_STORE = "public-key-store",
  KEY_IS_COLD_STORE = "is-cold-store",
  KEY_KEYNAME_STORE = "keyname-store",
  STORE_KEY_USER_DATA = "user-data",
  STORE_KEY_WALLET_DATA = "wallet-data",
  KEY_KEYRING_STORE = "keyring-store",
  STORE_MIGRATION_KEY = "last-migration",
  STORE_MIGRATION_LOG_KEY = "migration-log",
  STORE_UNLOCK_UNTIL_KEY = "unlocked-until",

  // Legacy
  KEY_FEATURE_GATES_STORE = "feature-gates-store",
  STORE_KEY_NAV = "nav-store7",
  KEY_XNFT_PREFERENCES_STORE = "xnft-preferences-store",

  // Also per wallet data:
  // STORE_KEY_WALLET_DATA_[publickey] = `${PersistentStorageKeys.STORE_KEY_WALLET_DATA}_${publickey}`
  // KEY_XNFT_PREFERENCES_STORE[uuid] = `${PersistentStorageKeys.KEY_XNFT_PREFERENCES_STORE}_${uuid}`
}

export enum SessionStorageKeys {
  // DONT CHANGE THIS VALUE
  // mobile requires "SECRET_VAR"
  // otherwise update will make keyrings non-decryptable.
  KEYRING_SESSION_PASSWORD_STORAGE_KEY = "SECRET_VAR",
}
