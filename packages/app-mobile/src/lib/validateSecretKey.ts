// TODO used in app-extensions Settings/index.tsx but we'll need to unify
import type { WalletPublicKeys } from "@coral-xyz/recoil";

import { Blockchain } from "@coral-xyz/common";
import { Keypair } from "@solana/web3.js";
import * as bs58 from "bs58";
import { ethers } from "ethers";

// eslint-disable-next-line
const Buffer = require("buffer/").Buffer;

// Validate a secret key and return a normalised hex representation
export function validateSecretKey(
  blockchain: Blockchain,
  secretKey: string,
  keyring: WalletPublicKeys
): string {
  // Extract public keys from keychain object into array of strings
  const existingPublicKeys = Object.values(keyring[blockchain])
    .map((k) => k.map((i) => i.publicKey))
    .flat();

  if (blockchain === Blockchain.SOLANA) {
    let keypair: Keypair | null = null;
    try {
      // Attempt to create a keypair from JSON secret key
      keypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(secretKey)));
    } catch (_) {
      try {
        // Attempt to create a keypair from bs58 decode of secret key
        keypair = Keypair.fromSecretKey(new Uint8Array(bs58.decode(secretKey)));
      } catch (_) {
        // Failure
        throw new Error("Invalid private key");
      }
    }

    if (existingPublicKeys.includes(keypair.publicKey.toString())) {
      throw new Error("Key already exists");
    }

    return Buffer.from(keypair.secretKey).toString("hex");
  } else if (blockchain === Blockchain.ETHEREUM) {
    try {
      const wallet = new ethers.Wallet(secretKey);

      if (existingPublicKeys.includes(wallet.publicKey)) {
        throw new Error("Key already exists");
      }

      return wallet.privateKey;
    } catch (_) {
      throw new Error("Invalid private key");
    }
  }
  throw new Error("secret key validation not implemented for blockchain");
}
