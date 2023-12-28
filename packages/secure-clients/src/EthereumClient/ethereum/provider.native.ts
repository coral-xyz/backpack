import {
  UI_RPC_METHOD_ETHEREUM_SIGN_AND_SEND_TRANSACTION,
  UI_RPC_METHOD_ETHEREUM_SIGN_TRANSACTION,
} from "@coral-xyz/common";
import type { SecureEvent } from "@coral-xyz/secure-background/types";
import type { UnsignedTransaction } from "@ethersproject/transactions";
import { ethers } from "ethers5";

import type { EthereumContext } from ".";

// Provider api used by the app UI. Spiritually the same as the injected
// provider with a slightly different API. Eventually it would be nice to
// combine the two.
export class EthereumProvider {
  /**
   * Serialize a transaction and send it to the background script for signing.
   */
  public static async signTransaction(
    ctx: EthereumContext,
    tx: any,
    _uiOptions: SecureEvent<"SECURE_EVM_SIGN_TX">["uiOptions"]
  ): Promise<any> {
    const { walletPublicKey, backgroundClient } = ctx;
    const serializedTx = ethers.utils.base58.encode(
      ethers.utils.serializeTransaction(tx as UnsignedTransaction)
    );
    // ph101pp todo
    const signedTx = await backgroundClient!.request({
      method: UI_RPC_METHOD_ETHEREUM_SIGN_TRANSACTION,
      params: [serializedTx, walletPublicKey],
    });
    return signedTx;
  }

  /**
   * Serialize a transaction and send it to the background script for signing
   * and sending.
   */
  public static async signAndSendTransaction(
    ctx: EthereumContext,
    tx: any,
    _uiOptions: SecureEvent<"SECURE_EVM_SIGN_TX">["uiOptions"]
  ): Promise<any> {
    const { walletPublicKey, backgroundClient } = ctx;

    const serializedTx = ethers.utils.base58.encode(
      ethers.utils.serializeTransaction(tx as UnsignedTransaction)
    );
    // ph101pp todo
    const txHash = await backgroundClient!.request({
      method: UI_RPC_METHOD_ETHEREUM_SIGN_AND_SEND_TRANSACTION,
      params: [serializedTx, walletPublicKey],
    });
    return txHash;
  }
}
