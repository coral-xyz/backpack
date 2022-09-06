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
  provider: ethers.providers.JsonRpcProvider,
  transaction: UnsignedTransaction
): Promise<TransactionRequest> {
  // This is just a void signer, it can't really sign things
  const voidSigner = new ethers.VoidSigner(publicKey, provider);
  // Populate any missing fields, e.g. nonce, gas settings
  const populatedTx = await voidSigner.populateTransaction(
    transaction as ethers.providers.TransactionRequest
  );
  const serializedTx = ethers.utils.base58.encode(
    ethers.utils.serializeTransaction(populatedTx as UnsignedTransaction)
  );
  return await requestManager.request({
    method: ETHEREUM_RPC_METHOD_SIGN_TX,
    params: [serializedTx, publicKey],
  });
}

export async function sendTransaction(
  publicKey: string,
  requestManager: RequestManager,
  provider: ethers.providers.JsonRpcProvider,
  transaction: UnsignedTransaction
): Promise<any> {
  // This is just a void signer, it can't really sign things
  const voidSigner = new ethers.VoidSigner(publicKey, provider);
  // Populate any missing fields, e.g. nonce, gas settings
  const populatedTx = await voidSigner.populateTransaction(
    transaction as ethers.providers.TransactionRequest
  );
  const serializedTx = ethers.utils.base58.encode(
    ethers.utils.serializeTransaction(populatedTx as UnsignedTransaction)
  );
  return await requestManager.request({
    method: ETHEREUM_RPC_METHOD_SIGN_AND_SEND_TX,
    params: [serializedTx, publicKey],
  });
}

export async function sendAndConfirmTransaction(
  publicKey: string,
  requestManager: RequestManager,
  provider: ethers.providers.JsonRpcProvider,
  transaction: UnsignedTransaction
): Promise<any> {
  const signature = this.sendTransaction(
    publicKey,
    requestManager,
    provider,
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
