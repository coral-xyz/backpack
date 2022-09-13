import { ethers } from "ethers";
import type { UnsignedTransaction } from "@ethersproject/transactions";
import type { TransactionRequest } from "@ethersproject/abstract-provider";
import type { RequestManager } from "../request-manager";
import {
  ETHEREUM_RPC_METHOD_SIGN_TX,
  ETHEREUM_RPC_METHOD_SIGN_AND_SEND_TX,
  ETHEREUM_RPC_METHOD_SIGN_MESSAGE,
} from "@coral-xyz/common";

const { base58: bs58 } = ethers.utils;

export async function signTransaction(
  publicKey: string,
  requestManager: RequestManager,
  transaction: UnsignedTransaction
): Promise<TransactionRequest> {
  const serializedTx = encodeTransaction(transaction);
  return await requestManager.request({
    method: ETHEREUM_RPC_METHOD_SIGN_TX,
    params: [serializedTx, publicKey],
  });
}

export async function sendTransaction(
  publicKey: string,
  requestManager: RequestManager,
  transaction: UnsignedTransaction
): Promise<any> {
  const serializedTx = encodeTransaction(transaction);
  return await requestManager.request({
    method: ETHEREUM_RPC_METHOD_SIGN_AND_SEND_TX,
    params: [serializedTx, publicKey],
  });
}

export async function sendAndConfirmTransaction(
  publicKey: string,
  requestManager: RequestManager,
  transaction: UnsignedTransaction
): Promise<any> {
  const signature = this.sendTransaction(
    publicKey,
    requestManager,
    transaction
  );
  // TODO wait
  return signature;
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

function encodeTransaction(transaction: any) {
  // Remove eth_sendTransaction gas key since it is incompatible with ethers
  // https://github.com/ethers-io/ethers.js/issues/299
  transaction.gasLimit = transaction.gas;
  delete transaction.gas;
  // As above
  delete transaction.from;
  return bs58.encode(ethers.utils.serializeTransaction(transaction));
}
