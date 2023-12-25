import type { Blockchain } from "@coral-xyz/common";
import type { JsonRpcPayload, JsonRpcResult } from "ethers6";

import type { SecureEventBase } from "../../types/transports";

// Also add new events to: ../../events.ts

export type SECURE_EVM_EVENTS =
  | "SECURE_EVM_SIGN_MESSAGE"
  | "SECURE_EVM_GET_ACCOUNTS"
  | "SECURE_EVM_REQUEST_ACCOUNTS"
  | "SECURE_EVM_PROVIDER_SEND"
  | "SECURE_EVM_SIGN_TX"
  | "SECURE_EVM_SHOULD_BE_METAMASK"
  | "SECURE_EVM_PREVIEW_PUBLIC_KEYS";

export interface SECURE_EVM_PREVIEW_PUBLIC_KEYS
  extends SecureEventBase<"SECURE_EVM_PREVIEW_PUBLIC_KEYS"> {
  request: {
    blockchain: Blockchain;
    derivationPaths: string[];
    mnemonic?: string | true;
  };
  response: {
    walletDescriptors: {
      blockchain: Blockchain;
      publicKey: string;
      derivationPath: string;
      imported: boolean;
    }[];
  };
  uiResponse: {
    walletDescriptors: {
      blockchain: Blockchain;
      publicKey: string;
      derivationPath: string;
    }[];
  };
}

export interface SECURE_EVM_REQUEST_ACCOUNTS
  extends SecureEventBase<"SECURE_EVM_REQUEST_ACCOUNTS"> {
  request: {
    impersonatingMetaMask?: boolean;
    blockchain: Blockchain;
  };
  response: {
    connectionUrl: string;
    accounts: string[];
    chainId: string;
  };
}

export interface SECURE_EVM_SHOULD_BE_METAMASK
  extends SecureEventBase<"SECURE_EVM_SHOULD_BE_METAMASK"> {
  request: {};
  response: {
    doNotImpersonateMetaMask: boolean;
  };
}

export interface SECURE_EVM_GET_ACCOUNTS
  extends SecureEventBase<"SECURE_EVM_GET_ACCOUNTS"> {
  request: {};
  response: {
    accounts: string[];
    chainId: string;
  };
}

export interface SECURE_EVM_SIGN_MESSAGE
  extends SecureEventBase<"SECURE_EVM_SIGN_MESSAGE"> {
  request: {
    message58: string;
    publicKey: string;
    uuid?: string;
  };
  uiResponse: {
    confirmed: true;
  };
  response: {
    signatureHex: string;
  };
}

export interface SECURE_EVM_SIGN_TX
  extends SecureEventBase<"SECURE_EVM_SIGN_TX"> {
  request: {
    publicKey: string;
    txHex: string;
    uuid?: string;
  };
  uiOptions:
    | { type: "ANY" }
    | {
        type: "SEND_TOKEN" | "SEND_NFT";
        assetId: string;
        token: {
          address: string;
          logo: string;
          decimals: number;
          // For ERC721 sends
          tokenId?: string;
          ticker?: string;
          name?: string;
        };
        amount: string;
        to: {
          address: string;
          username?: string;
        };
      };
  uiResponse: {
    confirmed: true;
    nonce: number;
    gasLimit: string;
    gasPrice?: string;
    maxPriorityFeePerGas?: string;
    maxFeePerGas?: string;
  };
  response: {
    signedTxHex: string;
  };
}

export interface SECURE_EVM_PROVIDER_SEND
  extends SecureEventBase<"SECURE_EVM_PROVIDER_SEND"> {
  request: {
    payload: JsonRpcPayload[];
  };
  response: {
    result: JsonRpcResult[];
  };
}
