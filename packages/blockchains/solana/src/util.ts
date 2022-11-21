import nacl from "tweetnacl";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
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
  const pathStr = derivePathStr(derivationPath, accountIndex);
  const dSeed = derivePath(pathStr, seedHex).key;
  const secret = nacl.sign.keyPair.fromSeed(dSeed).secretKey;
  return Keypair.fromSecretKey(secret);
}

function derivePathStr(derivationPath: DerivationPath, accountIndex: number) {
  switch (derivationPath) {
    case DerivationPath.Bip44:
      return accountIndex === 0
        ? `m/44'/501'`
        : `m/44'/501'/${accountIndex - 1}'`;
    case DerivationPath.Bip44Change:
      return `m/44'/501'/${accountIndex}'/0'`;
    default:
      throw new Error(`invalid derivation path: ${derivationPath}`);
  }
}
