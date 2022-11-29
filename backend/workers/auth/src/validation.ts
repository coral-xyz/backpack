import {
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { ethers } from "ethers";
import { sign } from "tweetnacl";

export const validateEthereumSignature = (
  msg: Buffer,
  signature: string,
  publicKey: string
) => {
  return ethers.utils.verifyMessage(msg, signature) === publicKey;
};

export const validateSolanaSignature = (
  msg: Buffer,
  signature: Uint8Array,
  publicKey: Uint8Array
) => {
  if (sign.detached.verify(msg, signature, publicKey)) {
    return true;
  }

  try {
    // This might be a Solana transaction because that is used for Ledger which
    // does not support signMessage
    const tx = new Transaction();
    tx.add(
      new TransactionInstruction({
        programId: new PublicKey(publicKey),
        keys: [],
        data: msg,
      })
    );
    tx.feePayer = new PublicKey(publicKey);
    // Not actually needed as it's not transmitted to the network
    tx.recentBlockhash = tx.feePayer.toString();
    tx.addSignature(new PublicKey(publicKey), Buffer.from(signature));
    return tx.verifySignatures();
  } catch (err) {
    console.error("dummy solana transaction error", err);
    return false;
  }
};
