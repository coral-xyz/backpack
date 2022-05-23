import * as bs58 from "bs58";
import {
  Connection,
  PublicKey,
  Transaction,
  Signer,
  Commitment,
  SendOptions,
  TransactionSignature,
  SimulatedTransactionResponse,
} from "@solana/web3.js";
import {
  RequestManager,
  RPC_METHOD_SIGN_MESSAGE,
  RPC_METHOD_SIGN_TX,
  RPC_METHOD_SIMULATE,
  RPC_METHOD_SIGN_ALL_TXS,
  RPC_METHOD_SIGN_AND_SEND_TX,
} from "@200ms/common";

export async function signTransaction(
  publicKey: PublicKey,
  requestManager: RequestManager,
  tx: Transaction
): Promise<Transaction> {
  tx.feePayer = publicKey;
  const message = bs58.encode(tx.serializeMessage());
  const signature = await requestManager.request({
    method: RPC_METHOD_SIGN_TX,
    params: [message, publicKey!.toString()],
  });
  // @ts-ignore
  tx.addSignature(publicKey, bs58.decode(signature));
  return tx;
}

export async function signAllTransactions(
  publicKey: PublicKey,
  requestManager: RequestManager,
  txs: Array<Transaction>
): Promise<Array<Transaction>> {
  // Serialize messages.
  const messages = txs.map((tx) => {
    const txSerialized = tx.serializeMessage();
    const message = bs58.encode(txSerialized);
    return message;
  });

  // Get signatures from the background script.
  const signatures: Array<string> = await requestManager.request({
    method: RPC_METHOD_SIGN_ALL_TXS,
    params: [messages, publicKey!.toString()],
  });

  // Add the signatures to the transactions.
  txs.forEach((t, idx) => {
    t.addSignature(publicKey!, Buffer.from(bs58.decode(signatures[idx])));
  });

  return txs;
}

export async function send(
  publicKey: PublicKey,
  requestManager: RequestManager,
  connection: Connection,
  tx: Transaction,
  signers?: Signer[],
  options?: SendOptions
): Promise<TransactionSignature> {
  if (signers) {
    signers.forEach((s: Signer) => {
      tx.partialSign(s);
    });
  }
  const { blockhash } = await connection!.getLatestBlockhash(
    options?.preflightCommitment
  );
  tx.feePayer = publicKey;
  tx.recentBlockhash = blockhash;
  const txSerialize = tx.serialize({
    requireAllSignatures: false,
  });
  const message = bs58.encode(txSerialize);
  return await requestManager.request({
    method: RPC_METHOD_SIGN_AND_SEND_TX,
    params: [message, publicKey!.toString(), options],
  });
}

export async function simulate(
  publicKey: PublicKey,
  requestManager: RequestManager,
  connection: Connection,
  tx: Transaction,
  signers?: Signer[],
  commitment?: Commitment
): Promise<SimulatedTransactionResponse> {
  if (signers) {
    signers.forEach((s: Signer) => {
      tx.partialSign(s);
    });
  }
  const { blockhash } = await connection!.getLatestBlockhash(commitment);
  tx.feePayer = publicKey;
  tx.recentBlockhash = blockhash;
  const txSerialize = tx.serialize({
    requireAllSignatures: false,
  });
  const message = bs58.encode(txSerialize);
  return await requestManager.request({
    method: RPC_METHOD_SIMULATE,
    params: [message, publicKey!.toString(), commitment],
  });
}

export async function signMessage(
  publicKey: PublicKey,
  requestManager: RequestManager,
  msg: Uint8Array
): Promise<Uint8Array | null> {
  const msgStr = bs58.encode(msg);
  const signature = await requestManager.request({
    method: RPC_METHOD_SIGN_MESSAGE,
    params: [msgStr, publicKey!.toString()],
  });
  if (!signature) {
    return signature;
  }
  return bs58.decode(signature);
}
