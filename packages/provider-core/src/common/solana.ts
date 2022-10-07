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
  Version,
} from "@solana/web3.js";
import type { RequestManager } from "../request-manager";
import {
  isVersionedTransaction,
  SOLANA_RPC_METHOD_SIGN_ALL_TXS,
  SOLANA_RPC_METHOD_SIGN_AND_SEND_TX,
  SOLANA_RPC_METHOD_SIGN_MESSAGE,
  SOLANA_RPC_METHOD_SIGN_TX,
  SOLANA_RPC_METHOD_SIMULATE,
} from "@coral-xyz/common";
import { VersionedTransaction } from "@solana/web3.js";

export async function sendAndConfirm<
  T extends Transaction | VersionedTransaction
>(
  publicKey: PublicKey,
  requestManager: RequestManager,
  connection: Connection,
  tx: T,
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

export async function send<T extends Transaction | VersionedTransaction>(
  publicKey: PublicKey,
  requestManager: RequestManager,
  connection: Connection,
  tx: T,
  signers?: Signer[],
  options?: SendOptions
): Promise<TransactionSignature> {
  const versioned = isVersionedTransaction(tx);
  if (!versioned) {
    if (signers) {
      signers.forEach((s: Signer) => {
        tx.partialSign(s);
      });
    }
    if (!tx.feePayer) {
      tx.feePayer = publicKey;
    }
    if (!tx.recentBlockhash) {
      const { blockhash } = await connection!.getLatestBlockhash(
        options?.preflightCommitment
      );
      tx.recentBlockhash = blockhash;
    }
  } else {
    if (signers) {
      tx.sign(signers);
    }
  }
  const txSerialize = tx.serialize({
    requireAllSignatures: false,
  });
  const txStr = encode(txSerialize);
  return await requestManager.request({
    method: SOLANA_RPC_METHOD_SIGN_AND_SEND_TX,
    params: [txStr, publicKey.toString(), options],
  });
}

export async function signTransaction<
  T extends Transaction | VersionedTransaction
>(
  publicKey: PublicKey,
  requestManager: RequestManager,
  connection: Connection,
  tx: T
): Promise<T> {
  const versioned = isVersionedTransaction(tx);
  if (!versioned) {
    if (!tx.feePayer) {
      tx.feePayer = publicKey;
    }
    if (!tx.recentBlockhash) {
      const { blockhash } = await connection!.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
    }
  }
  const txStr = encode(tx.serialize({ requireAllSignatures: false }));
  const signature = await requestManager.request({
    method: SOLANA_RPC_METHOD_SIGN_TX,
    params: [txStr, publicKey.toString()],
  });
  // @ts-ignore
  tx.addSignature(publicKey, decode(signature));
  return tx;
}

export async function signAllTransactions<
  T extends Transaction | VersionedTransaction
>(
  publicKey: PublicKey,
  requestManager: RequestManager,
  connection: Connection,
  txs: Array<T>
): Promise<Array<T>> {
  let _blockhash: string | undefined;
  for (let k = 0; k < txs.length; k += 1) {
    const tx = txs[k];
    if (isVersionedTransaction(tx)) {
      continue;
    }
    if (!tx.feePayer) {
      tx.feePayer = publicKey;
    }
    if (!tx.recentBlockhash) {
      if (!_blockhash) {
        const { blockhash } = await connection!.getLatestBlockhash();
        _blockhash = blockhash;
      }
      tx.recentBlockhash = _blockhash;
    }
  }

  // Serialize messages.
  const txStrs = txs.map((tx) => {
    const txSerialized = tx.serialize({ requireAllSignatures: false });
    return encode(txSerialized);
  });

  // Get signatures from the background script.
  const signatures: Array<string> = await requestManager.request({
    method: SOLANA_RPC_METHOD_SIGN_ALL_TXS,
    params: [txStrs, publicKey.toString()],
  });

  // Add the signatures to the transactions.
  txs.forEach((t, idx) => {
    // @ts-ignore
    t.addSignature(publicKey, decode(signatures[idx]));
  });

  return txs;
}

export async function simulate<T extends Transaction | VersionedTransaction>(
  publicKey: PublicKey,
  requestManager: RequestManager,
  connection: Connection,
  tx: T,
  signers?: Signer[],
  commitment?: Commitment
): Promise<SimulatedTransactionResponse> {
  if (!isVersionedTransaction(tx)) {
    if (signers) {
      signers.forEach((s: Signer) => {
        tx.partialSign(s);
      });
    }
    if (!tx.feePayer) {
      tx.feePayer = publicKey;
    }
    if (!tx.recentBlockhash) {
      const { blockhash } = await connection!.getLatestBlockhash(commitment);
      tx.recentBlockhash = blockhash;
    }
  } else {
    if (signers) {
      tx.sign(signers);
    }
  }

  const txSerialize = tx.serialize({
    requireAllSignatures: false,
  });

  const txStr = encode(txSerialize);
  return await requestManager.request({
    method: SOLANA_RPC_METHOD_SIMULATE,
    params: [txStr, publicKey.toString(), commitment],
  });
}

export async function signMessage(
  publicKey: PublicKey,
  requestManager: RequestManager,
  msg: Uint8Array
): Promise<Uint8Array> {
  const msgStr = encode(msg);
  const signature = await requestManager.request({
    method: SOLANA_RPC_METHOD_SIGN_MESSAGE,
    params: [msgStr, publicKey.toString()],
  });
  return decode(signature);
}
