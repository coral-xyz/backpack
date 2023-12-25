import type { Blockchain } from "@coral-xyz/common";

import type { SecureEventBase } from "../../types/transports";

// Also add new events to: ../../events.ts

export type SECURE_SVM_EVENTS =
  | "SECURE_SVM_SIGN_MESSAGE"
  | "SECURE_SVM_SIGN_TX"
  | "SECURE_SVM_SIGN_ALL_TX"
  | "SECURE_SVM_DISCONNECT"
  | "SECURE_SVM_CONNECT"
  | "SECURE_SVM_PREVIEW_PUBLIC_KEYS";

export interface SECURE_SVM_PREVIEW_PUBLIC_KEYS
  extends SecureEventBase<"SECURE_SVM_PREVIEW_PUBLIC_KEYS"> {
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

export interface SECURE_SVM_SIGN_MESSAGE
  extends SecureEventBase<"SECURE_SVM_SIGN_MESSAGE"> {
  request: {
    message: string;
    publicKey: string;
    uuid?: string;
  };
  response: {
    signedMessage: string;
  };
  uiResponse: {
    confirmed: true;
  };
}

export interface SECURE_SVM_CONNECT
  extends SecureEventBase<"SECURE_SVM_CONNECT"> {
  request: {
    blockchain: Blockchain;
  };
  response: {
    publicKey: string;
    connectionUrl: string;
  };
}
export interface SECURE_SVM_DISCONNECT
  extends SecureEventBase<"SECURE_SVM_DISCONNECT"> {
  request: {};
  response: {
    disconnected: true;
  };
}

export interface SECURE_SVM_SIGN_TX
  extends SecureEventBase<"SECURE_SVM_SIGN_TX"> {
  request: {
    publicKey: string;
    tx: string;
    uuid?: string;
  };
  uiOptions:
    | { type: "ANY" }
    | {
        type: "SEND_TOKEN" | "SEND_NFT";
        assetId: string;
        tokenMint: string;
        amount: string;
        to: {
          address: string;
          username?: string;
        };
      }
    | {
        type: "SWAP_TOKENS";
        toToken: string;
        toAmount: string;
        fromToken: string;
        fromAmount: string;
        rate: string;
        backpackFeePercent: number;
        transactionFees?: {
          fees: { [label: string]: string };
          total: string;
        };
        expirationTimeMs: number;
        priceImpact: string;
      }
    | {
        type: "WRAP_SOL" | "UNWRAP_SOL";
        amount: string;
      }
    | {
        type: "BURN_NFT";
        assetId: string;
        tokenMint: string;
        amount: string;
      }
    | {
        type: "INSTALL_XNFT" | "UNINSTALL_XNFT";
        assetId: string;
        tokenMint: string;
        iconUrl: string;
      };
  uiResponse: {
    confirmed: true;
    transactionOverrides: {
      priorityFee: string;
      computeUnits: string;
      disableFeeConfig: boolean;
    };
  };
  response: {
    signature: string;
    transactionEncoding: string;
  };
}

export interface SECURE_SVM_SIGN_ALL_TX
  extends SecureEventBase<"SECURE_SVM_SIGN_ALL_TX"> {
  request: {
    publicKey: string;
    txs: string[];
    uuid?: string;
  };
  uiResponse: {
    confirmed: true;
    transactionOverrides: {
      priorityFee: string;
      computeUnits: string;
      disableFeeConfig: boolean;
    }[];
  };
  response: {
    signatures: Array<{
      signature: string;
      transactionEncoding: string;
    }>;
  };
}
