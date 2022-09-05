import { ethers } from "ethers";
import type { UnsignedTransaction } from "@ethersproject/transactions";
import type { TransactionRequest } from "@ethersproject/abstract-provider";
import type { RequestManager } from "../request-manager";
import {
  ETHEREUM_RPC_METHOD_SIGN_TX,
  ETHEREUM_RPC_METHOD_SIGN_AND_SEND_TX,
  ETHEREUM_RPC_METHOD_SIGN_MESSAGE,
} from "@coral-xyz/common";

export async function signTransaction(
  publicKey: string,
  requestManager: RequestManager,
  transaction: UnsignedTransaction
): Promise<any> {
  return await requestManager.request({
    method: ETHEREUM_RPC_METHOD_SIGN_TX,
    params: [transaction, publicKey],
  });
}

export async function sendTransaction(
  publicKey: string,
  requestManager: RequestManager,
  transaction: TransactionRequest
): Promise<any> {
  return await requestManager.request({
    method: ETHEREUM_RPC_METHOD_SIGN_AND_SEND_TX,
    params: [transaction, publicKey],
  });
}

export async function sendAndConfirmTransaction(
  publicKey: string,
  requestManager: RequestManager,
  transaction: TransactionRequest
): Promise<any> {
  this.sendTransaction(publicKey, requestManager, transaction);
  // TODO: wait for confirmation
}

export async function signMessage(
  publicKey: string,
  requestManager: RequestManager,
  msg: string
): Promise<Uint8Array> {
  const encodedMsg = ethers.utils.base58.encode(ethers.utils.toUtf8Bytes(msg));
  return await requestManager.request({
    method: ETHEREUM_RPC_METHOD_SIGN_MESSAGE,
    params: [encodedMsg, publicKey],
  });
}
