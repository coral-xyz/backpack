import { atom } from "recoil";
import {
  PLUGIN_REQUEST_SOLANA_SIGN_TRANSACTION,
  PLUGIN_REQUEST_SOLANA_SIGN_ALL_TRANSACTIONS,
  PLUGIN_REQUEST_SOLANA_SIGN_AND_SEND_TRANSACTION,
  PLUGIN_REQUEST_SOLANA_SIGN_MESSAGE,
  PLUGIN_REQUEST_ETHEREUM_SIGN_TRANSACTION,
  PLUGIN_REQUEST_ETHEREUM_SIGN_AND_SEND_TRANSACTION,
  PLUGIN_REQUEST_ETHEREUM_SIGN_MESSAGE,
} from "@coral-xyz/common";
import { SignaturePubkeyPairV2 } from "@coral-xyz/common-public";

//
// Transaction being requested for signing.
//
export const transactionRequest = atom<TransactionRequest | undefined>({
  key: "transactionRequest",
  default: undefined,
});

export type TransactionRequest = {
  xnftAddress: string;
  pluginUrl?: string;
  data: string | string[];
  publicKey: string;
  kind:
    | typeof PLUGIN_REQUEST_SOLANA_SIGN_TRANSACTION
    | typeof PLUGIN_REQUEST_SOLANA_SIGN_ALL_TRANSACTIONS
    | typeof PLUGIN_REQUEST_SOLANA_SIGN_AND_SEND_TRANSACTION
    | typeof PLUGIN_REQUEST_SOLANA_SIGN_MESSAGE
    | typeof PLUGIN_REQUEST_ETHEREUM_SIGN_TRANSACTION
    | typeof PLUGIN_REQUEST_ETHEREUM_SIGN_AND_SEND_TRANSACTION
    | typeof PLUGIN_REQUEST_ETHEREUM_SIGN_MESSAGE;
  resolve: (signature: string) => void;
  signatures?: SignaturePubkeyPairV2[];
  reject: (error: any) => void;
};
