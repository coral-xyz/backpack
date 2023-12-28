import type { InjectedRequestManager } from "@coral-xyz/common";
import {
  ETHEREUM_RPC_METHOD_SIGN_AND_SEND_TX,
  ETHEREUM_RPC_METHOD_SIGN_MESSAGE,
  ETHEREUM_RPC_METHOD_SIGN_TX,
} from "@coral-xyz/common";
import type { TransactionRequest } from "@ethersproject/abstract-provider";
import type { UnsignedTransaction } from "@ethersproject/transactions";
import { ethers } from "ethers5";

import type { ChainedRequestManager } from "../chained-request-manager";

const { base58: bs58 } = ethers.utils;

export async function signTransaction(
  publicKey: string,
  requestManager: InjectedRequestManager | ChainedRequestManager,
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
  requestManager: InjectedRequestManager | ChainedRequestManager,
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
  requestManager: InjectedRequestManager | ChainedRequestManager,
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
  requestManager: InjectedRequestManager | ChainedRequestManager,
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
  // Set transaction type if fully formed EIP1559
  if (
    (transaction.type === 2 ||
      transaction.type === "0x2" ||
      transaction.type == null) &&
    transaction.maxFeePerGas != null &&
    transaction.maxPriorityFeePerGas != null
  ) {
    transaction.type = 2;
  }
  return bs58.encode(ethers.utils.serializeTransaction(transaction));
}
