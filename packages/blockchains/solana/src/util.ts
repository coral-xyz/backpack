import {
  accountDerivationPath,
  Blockchain,
  DerivationPath,
} from "@coral-xyz/common";
import { Keypair } from "@solana/web3.js";
import * as bip32 from "bip32";
import { derivePath } from "ed25519-hd-key";
import nacl from "tweetnacl";

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
  let dSeed = deriveSeed(seedHex, derivationPath, accountIndex);
  const secret = nacl.sign.keyPair.fromSeed(dSeed).secretKey;
  return Keypair.fromSecretKey(secret);
}

function deriveSeed(
  seedHex: string,
  derivationPath: DerivationPath,
  accountIndex: number,
  walletIndex?: number
): any {
  const pathStr = accountDerivationPath(
    Blockchain.SOLANA,
    derivationPath,
    accountIndex,
    walletIndex
  );
  switch (derivationPath) {
    case DerivationPath.SolletDeprecated:
      return bip32.fromSeed(Buffer.from(seedHex, "hex")).derivePath(pathStr)
        .privateKey;
    default:
      return derivePath(pathStr, seedHex).key;
  }
}
