import { TransactionSignature } from "@solana/web3.js";

const SUCCESS_RESPONSE = "success";

export class Backend {
  connect(ctx: Context, onlyIfTrustedMaybe: boolean) {
    // todo
    return SUCCESS_RESPONSE;
  }

  disconnect(ctx: Context) {
    // todo
    return SUCCESS_RESPONSE;
  }

  signAndSendTx(ctx: Context, tx: any): TransactionSignature {
    // todo
    const txId = "todo";
    return txId;
  }

  signMessage(ctx: Context, msg: any): MessageSignature {
    // todo
    const signature = "todo";
    return signature;
  }
}

export type Context = {
  sender: any;
};

type MessageSignature = string;
