import { ethers } from "ethers";
import type { UnsignedTransaction } from "@ethersproject/transactions";
import {
  UI_RPC_METHOD_ETHEREUM_SIGN_TRANSACTION,
  UI_RPC_METHOD_ETHEREUM_SIGN_AND_SEND_TRANSACTION,
} from "../constants";
import type { EthereumContext } from ".";

// Provider API to be used by the app UI.
export class EthereumProvider {
  /**
   * Serialize a transaction and send it to the background script for signing.
   */
  public static async signTransaction(
    ctx: EthereumContext,
    tx: any
  ): Promise<any> {
    const { walletPublicKey, backgroundClient, provider } = ctx;
    // This is just a void signer, it can't really sign things
    const voidSigner = new ethers.VoidSigner(walletPublicKey, provider);
    // Populate any missing fields, e.g. nonce, gas settings
    const populatedTx = await voidSigner.populateTransaction(
      tx as ethers.providers.TransactionRequest
    );
    const serializedTx = ethers.utils.base58.encode(
      ethers.utils.serializeTransaction(populatedTx as UnsignedTransaction)
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
    const { walletPublicKey, backgroundClient, provider } = ctx;
    // This is just a void signer, it can't really sign things
    const voidSigner = new ethers.VoidSigner(walletPublicKey, provider);
    // Populate any missing fields, e.g. nonce, gas settings
    const populatedTx = await voidSigner.populateTransaction(
      tx as ethers.providers.TransactionRequest
    );
    const serializedTx = ethers.utils.base58.encode(
      ethers.utils.serializeTransaction(populatedTx as UnsignedTransaction)
    );
    const txHash = await backgroundClient.request({
      method: UI_RPC_METHOD_ETHEREUM_SIGN_AND_SEND_TRANSACTION,
      params: [serializedTx, walletPublicKey],
    });
    return txHash;
  }
}
