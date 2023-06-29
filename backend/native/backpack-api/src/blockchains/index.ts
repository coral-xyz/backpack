import { Blockchain } from "@coral-xyz/common";
import {
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { ethers } from "ethers";
import { sign } from "tweetnacl";

const { base58 } = ethers.utils;

type BlockchainsNative = Record<
  Blockchain,
  {
    validateSignature: (msg: Buffer, sig: string, pubkey: string) => boolean;
  }
>;

export const BLOCKCHAINS_NATIVE: BlockchainsNative = {
  [Blockchain.ETHEREUM]: {
    /**
     * Validate an Ethereum signature.
     * @param msg - signed message
     * @param signature
     * @param publicKey - public key that signed the data
     */
    validateSignature: (msg: Buffer, signature: string, publicKey: string) => {
      return ethers.utils.verifyMessage(msg, signature) === publicKey;
    },
  },
  [Blockchain.SOLANA]: {
    /**
     * Validate a Solana signature and ensure it matches the message content
     * given in `msg` using a faux Solana transaction.
     * @param msg - signed message
     * @param encodedSignature - base58 encoded signature of the transaction
     * @param encodedPublicKey - base58 encoded public key
     */
    validateSignature: (
      msg: Buffer,
      encodedSignature: string,
      encodedPublicKey: string
    ) => {
      const signature = base58.decode(encodedSignature);
      const publicKey = base58.decode(encodedPublicKey);

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
    },
  },
  [Blockchain.ECLIPSE]: {
    validateSignature: (
      msg: Buffer,
      encodedSignature: string,
      encodedPublicKey: string
    ) => {
      return BLOCKCHAINS_NATIVE[Blockchain.SOLANA].validateSignature(
        msg,
        encodedSignature,
        encodedPublicKey
      );
    },
  },
};
