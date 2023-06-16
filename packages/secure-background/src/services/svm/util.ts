import { Keypair } from "@solana/web3.js";
import { fromSeed } from "bip32";
import { derivePath } from "ed25519-hd-key";
import nacl from "tweetnacl";

// Returns the account Keypair for the given seed and derivation path.
export function deriveSolanaKeypair(
  seed: Buffer,
  derivationPath: string
): Keypair {
  const secret = deriveSolanaPrivateKey(seed, derivationPath);
  return Keypair.fromSecretKey(secret);
}

export function deriveSolanaPrivateKey(
  seed: Buffer,
  derivationPath: string
): Uint8Array {
  let derivedSeed: Buffer;
  if (derivationPath.startsWith("501'")) {
    // Sollet deprecated path
    derivedSeed = fromSeed(seed).derivePath(derivationPath).privateKey!;
  } else {
    derivedSeed = derivePath(derivationPath, seed.toString("hex")).key;
  }
  return nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
}
