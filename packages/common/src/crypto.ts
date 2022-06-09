import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";

export const DerivationPath: { [key: string]: DerivationPath } = {
  Bip44: "bip44",
  Bip44Change: "bip44-change",
  Default: "bip44-change",
};

export type DerivationPath = "bip44" | "bip44-change";

export function deriveKeypairs(
  seed: Buffer,
  dPath: DerivationPath,
  numberOfAccounts: number
): Array<Keypair> {
  const kps: Array<Keypair> = [];
  const seedHex = seed.toString("hex");
  for (let k = 0; k < numberOfAccounts; k += 1) {
    const kp = deriveKeypair(seedHex, k, dPath);
    kps.push(kp);
  }
  return kps;
}

// Returns the account Keypair for the given seed and derivation path.
export function deriveKeypair(
  seedHex: string,
  accountIndex: number,
  dPath: DerivationPath
): Keypair {
  let pathStr = derivePathStr(dPath, accountIndex);
  const dSeed = derivePath(pathStr, seedHex).key;
  const secret = nacl.sign.keyPair.fromSeed(dSeed).secretKey;
  return Keypair.fromSecretKey(secret);
}

function derivePathStr(dPath: DerivationPath, accountIndex: number): string {
  switch (dPath) {
    case DerivationPath.Bip44:
      return accountIndex === 0
        ? `m/44'/501'`
        : `m/44'/501'/${accountIndex - 1}'`;
    case DerivationPath.Bip44Change:
      return `m/44'/501'/${accountIndex}'/0'`;
    default:
      throw new Error(`invalid derivation path: ${dPath}`);
  }
}
