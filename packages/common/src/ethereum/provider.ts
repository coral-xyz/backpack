import type { UnsignedTransaction } from "@ethersproject/transactions";
import { ethers } from "ethers";

import {
  UI_RPC_METHOD_ETHEREUM_SIGN_AND_SEND_TRANSACTION,
  UI_RPC_METHOD_ETHEREUM_SIGN_TRANSACTION,
} from "../constants";

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
    tx: any
  ): Promise<any> {
    const { walletPublicKey, backgroundClient } = ctx;
    const serializedTx = ethers.utils.base58.encode(
      ethers.utils.serializeTransaction(tx as UnsignedTransaction)
    );
    const signedTx = await backgroundClient.request({
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
    tx: any
  ): Promise<any> {
    const { walletPublicKey, backgroundClient } = ctx;
    console.log("Transaction", tx);
    const serializedTx = ethers.utils.base58.encode(
      ethers.utils.serializeTransaction(tx as UnsignedTransaction)
    );
    const txHash = await backgroundClient.request({
      method: UI_RPC_METHOD_ETHEREUM_SIGN_AND_SEND_TRANSACTION,
      params: [serializedTx, walletPublicKey],
    });
    return txHash;
  }
}
