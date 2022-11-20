import nacl from "tweetnacl";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import { derivePathStr } from "@coral-xyz/blockchain-common";
import { Blockchain, DerivationPath } from "@coral-xyz/common";

export function deriveSolanaKeypairs(
  seed: Buffer,
  derivationPath: DerivationPath,
  accountIndices: Array<number>
): Array<Keypair> {
  const kps: Array<Keypair> = [];
  const seedHex = seed.toString("hex");
  for (const accountIndex of accountIndices) {
    const kp = deriveSolanaKeypair(seedHex, accountIndex, derivationPath);
    kps.push(kp);
  }
  return kps;
}

// Returns the account Keypair for the given seed and derivation path.
export function deriveSolanaKeypair(
  seedHex: string,
  accountIndex: number,
  derivationPath: DerivationPath
): Keypair {
  const pathStr = derivePathStr(
    Blockchain.SOLANA,
    derivationPath,
    accountIndex
  );
  const dSeed = derivePath(pathStr, seedHex).key;
  const secret = nacl.sign.keyPair.fromSeed(dSeed).secretKey;
  return Keypair.fromSecretKey(secret);
}
