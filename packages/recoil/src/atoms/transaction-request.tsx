import { atom } from "recoil";

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
  data: string;
  publicKey: string;
  kind: "sign-tx" | "sign-msg" | "sign-and-send-tx";
  resolve: (signature: string) => void;
  reject: (error: any) => void;
};
