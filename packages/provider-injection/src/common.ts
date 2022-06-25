import { decode, encode } from "bs58";
import type {
  Connection,
  PublicKey,
  Transaction,
  Signer,
  Commitment,
  SendOptions,
  ConfirmOptions,
  TransactionSignature,
  SimulatedTransactionResponse,
} from "@solana/web3.js";
import type { RequestManager } from "@coral-xyz/common";
import {
  RPC_METHOD_SIGN_ALL_TXS,
  RPC_METHOD_SIGN_AND_SEND_TX,
  RPC_METHOD_SIGN_MESSAGE,
  RPC_METHOD_SIGN_TX,
  RPC_METHOD_SIMULATE,
} from "@coral-xyz/common";

export async function sendAndConfirm(
  publicKey: PublicKey,
  requestManager: RequestManager,
  connection: Connection,
  tx: Transaction,
  signers?: Signer[],
  options?: ConfirmOptions
): Promise<TransactionSignature> {
  const [signature, { blockhash, lastValidBlockHeight }] = await Promise.all([
    send(publicKey, requestManager, connection, tx, signers, options),
    connection.getLatestBlockhash(options?.preflightCommitment),
  ]);

  const resp = await connection.confirmTransaction(
    {
      signature,
      blockhash,
      lastValidBlockHeight,
    },
    options?.commitment
  );
  if (resp?.value.err) {
    throw new Error(
      `error confirming transaction: ${resp.value.err.toString()}`
    );
  }
  return signature;
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
  const message = encode(txSerialize);
  return await requestManager.request({
    method: RPC_METHOD_SIGN_AND_SEND_TX,
    params: [message, publicKey!.toString(), options],
  });
}

export async function signTransaction(
  publicKey: PublicKey,
  requestManager: RequestManager,
  tx: Transaction
): Promise<Transaction> {
  tx.feePayer = publicKey;
  const message = encode(tx.serializeMessage());
  const signature = await requestManager.request({
    method: RPC_METHOD_SIGN_TX,
    params: [message, publicKey!.toString()],
  });
  // @ts-ignore
  tx.addSignature(publicKey, decode(signature));
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
    const message = encode(txSerialized);
    return message;
  });

  // Get signatures from the background script.
  const signatures: Array<string> = await requestManager.request({
    method: RPC_METHOD_SIGN_ALL_TXS,
    params: [messages, publicKey!.toString()],
  });

  // Add the signatures to the transactions.
  txs.forEach((t, idx) => {
    t.addSignature(publicKey!, Buffer.from(decode(signatures[idx])));
  });

  return txs;
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
  const message = encode(txSerialize);
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
  const msgStr = encode(msg);
  const signature = await requestManager.request({
    method: RPC_METHOD_SIGN_MESSAGE,
    params: [msgStr, publicKey!.toString()],
  });
  if (!signature) {
    return signature;
  }
  return decode(signature);
}
