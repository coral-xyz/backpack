import type {
  Blockchain,
  Preferences,
  WalletDescriptor,
} from "@coral-xyz/common";

import type { User, UserPublicKeyStore } from "../../store/SecureStore";
import type { BlockchainWalletInit } from "../../types/blockchain";
import type { KeyringStoreState } from "../../types/keyring";
import type { SecureUserType } from "../../types/secureUser";
import type {
  SecureEventBase,
  SecureEventOrigin,
} from "../../types/transports";

// Also add new events to: ../../events.ts

export type SECURE_USER_EVENTS =
  | "SECURE_USER_UNLOCK_KEYRING"
  | "SECURE_USER_SET_ACTIVE"
  | "SECURE_USER_SET_WALLET"
  | "SECURE_USER_UPDATE"
  | "SECURE_USER_INIT_WALLET"
  // | "SECURE_USER_REMOVE"
  | "SECURE_USER_GET"
  | "SECURE_USER_PING"
  | "SECURE_USER_GET_ALL"
  | "SECURE_USER_GET_ALL_WITH_ACCOUNTS"
  | "SECURE_USER_UPDATE_PREFERENCES"
  | "SECURE_USER_GET_KEYRING_STATE"
  | "SECURE_USER_GET_MNEMONIC"
  | "SECURE_USER_EXPORT_BACKUP"
  | "SECURE_USER_IMPORT_BACKUP"
  | "SECURE_USER_RESET_BACKPACK"
  | "SECURE_USER_CHECK_PASSWORD"
  | "SECURE_USER_REMOVE_ORIGIN"
  | "SECURE_USER_APPROVE_ORIGIN";

export interface SECURE_USER_INIT_WALLET
  extends SecureEventBase<"SECURE_USER_INIT_WALLET"> {
  request: {
    uuid: string;
    password?: string;
    blockchainWalletInits: BlockchainWalletInit[];
  };
  response: {
    wallets: Array<{ publicKey: string; name: string }>;
  };
}

export interface SECURE_USER_UNLOCK_KEYRING
  extends SecureEventBase<"SECURE_USER_UNLOCK_KEYRING"> {
  request: {
    uuid?: string;
    password?: string;
  };
  uiOptions: {
    noPopup?: true;
    noEvent?: true;
    force?: true;
  };
  response: {
    unlocked: true;
  };
  uiResponse: {
    unlocked: true;
  };
}

export interface SECURE_USER_GET extends SecureEventBase<"SECURE_USER_GET"> {
  request: {
    uuid?: string;
  };
  response:
    | {
        keyringStoreState: KeyringStoreState.NeedsOnboarding;
      }
    | ({
        keyringStoreState:
          | KeyringStoreState.Locked
          | KeyringStoreState.Unlocked;
      } & SecureUserType);
}

export interface SECURE_USER_UPDATE_PREFERENCES
  extends SecureEventBase<"SECURE_USER_UPDATE_PREFERENCES"> {
  request: {
    uuid: string;
    preferences: Partial<Preferences>;
  };
  response: {
    updated: true;
  };
}

export interface SECURE_USER_PING extends SecureEventBase<"SECURE_USER_PING"> {
  request: {
    unlockedUntil?: number;
  };
}

export interface SECURE_USER_GET_ALL
  extends SecureEventBase<"SECURE_USER_GET_ALL"> {
  request: {};
  response: {
    users: Array<{
      uuid: string;
      username: string;
    }>;
  };
}

export interface SECURE_USER_GET_ALL_WITH_ACCOUNTS
  extends SecureEventBase<"SECURE_USER_GET_ALL_WITH_ACCOUNTS"> {
  request: {};
  response: {
    activeUser: string;
    users: Array<{
      username: string;
      uuid: string;
      publicKeys: UserPublicKeyStore[number];
    }>;
  };
}

export interface SECURE_USER_GET_KEYRING_STATE
  extends SecureEventBase<"SECURE_USER_GET_KEYRING_STATE"> {
  request: {};
  response: {
    state: KeyringStoreState;
  };
}

export interface SECURE_USER_GET_MNEMONIC
  extends SecureEventBase<"SECURE_USER_GET_MNEMONIC"> {
  request: {
    password?: string;
  };
  uiResponse: { password: string | false };
  uiOptions: {
    backup?: string;
  };
  response: {
    exported: true;
  };
}

export interface SECURE_USER_CHECK_PASSWORD
  extends SecureEventBase<"SECURE_USER_CHECK_PASSWORD"> {
  request: {
    password: string;
  };
  response: {
    valid: true;
  };
}

export interface SECURE_USER_EXPORT_BACKUP
  extends SecureEventBase<"SECURE_USER_EXPORT_BACKUP"> {
  request: {};
  uiOptions: {
    backup: string;
  };
  response: {
    exported: true;
  };
}
export interface SECURE_USER_IMPORT_BACKUP
  extends SecureEventBase<"SECURE_USER_IMPORT_BACKUP"> {
  request: {
    backup: string;
  };
  response: {
    imported: true;
  };
}

export interface SECURE_USER_RESET_BACKPACK
  extends SecureEventBase<"SECURE_USER_RESET_BACKPACK"> {
  request: {};
  response: {
    reset: true;
  };
  uiResponse: {
    confirmed: true;
  };
}

export interface SECURE_USER_APPROVE_ORIGIN
  extends SecureEventBase<"SECURE_USER_APPROVE_ORIGIN"> {
  allowResubmission: true;
  request: {
    origin: SecureEventOrigin;
    blockchain: Blockchain;
    impersonatingMetaMask?: boolean;
  };
  response: {
    publicKey: string;
    approved: true;
  };
  uiResponse: {
    publicKey: string;
    confirmed: true;
  };
}

export interface SECURE_USER_REMOVE_ORIGIN
  extends SecureEventBase<"SECURE_USER_REMOVE_ORIGIN"> {
  allowResubmission: true;
  request: {
    origin: SecureEventOrigin;
  };
  response: {
    removed: true;
  };
}

// export interface SECURE_USER_REMOVE
//   extends SecureEventBase<"SECURE_USER_REMOVE"> {
//   request: {
//     uuid: string
//   };
//   response: {
//     removed: true;
//   };
// }

export interface SECURE_USER_UPDATE
  extends SecureEventBase<"SECURE_USER_UPDATE"> {
  request: Partial<User> & { uuid: string };
  response: {
    updated: true;
  };
}

export interface SECURE_USER_SET_ACTIVE
  extends SecureEventBase<"SECURE_USER_SET_ACTIVE"> {
  request: {
    uuid: string;
  };
  response: {
    updated: true;
  };
}

export interface SECURE_USER_SET_WALLET
  extends SecureEventBase<"SECURE_USER_SET_WALLET"> {
  request: {
    blockchain: Blockchain;
    publicKey: string;
  };
  response: {
    updated: true;
  };
}
