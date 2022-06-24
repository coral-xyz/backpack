import { pbkdf2 } from "crypto";
import nacl, { randomBytes, secretbox } from "tweetnacl";
import * as bs58 from "bs58";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import { DerivationPath } from "@coral-xyz/common";

// An encrypted secret with associated metadata required for decryption.
export type SecretPayload = {
  ciphertext: string;
  nonce: string;
  salt: string;
  kdf: string;
  iterations: number;
  digest: string;
};

type MnemonicSeed = {
  mnemonic: string;
  seed: string;
};

export function deriveKeypairs(
  seed: Buffer,
  dPath: DerivationPath,
  accountIndices: Array<number>
): Array<Keypair> {
  const kps: Array<Keypair> = [];
  const seedHex = seed.toString("hex");
  for (const accountIndex of accountIndices) {
    const kp = deriveKeypair(seedHex, accountIndex, dPath);
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

// Creates a new mnemonic and seed.
export async function generateMnemonicAndSeed(): Promise<MnemonicSeed> {
  const bip39 = await import("bip39");
  const mnemonic = bip39.generateMnemonic(256);
  const seed = await bip39.mnemonicToSeed(mnemonic);
  return { mnemonic, seed: Buffer.from(seed).toString("hex") };
}

export async function encrypt(
  plaintext: string,
  password: string
): Promise<SecretPayload> {
  const salt = randomBytes(16);
  const kdf = "pbkdf2";
  const iterations = 100000;
  const digest = "sha256";
  const key = await deriveEncryptionKey(password, salt, iterations, digest);
  const nonce = randomBytes(secretbox.nonceLength);
  const ciphertext = secretbox(Buffer.from(plaintext), nonce, key);
  return {
    ciphertext: bs58.encode(ciphertext),
    nonce: bs58.encode(nonce),
    kdf,
    salt: bs58.encode(salt),
    iterations,
    digest,
  };
}

export async function decrypt(
  cipherObj: SecretPayload,
  password: string
): Promise<string> {
  const {
    ciphertext: encodedCiphertext,
    nonce: encodedNonce,
    salt: encodedSalt,
    iterations,
    digest,
  } = cipherObj;
  const ciphertext = bs58.decode(encodedCiphertext);
  const nonce = bs58.decode(encodedNonce);
  const salt = bs58.decode(encodedSalt);
  const key = await deriveEncryptionKey(password, salt, iterations, digest);
  const plaintext = secretbox.open(ciphertext, nonce, key);
  if (!plaintext) {
    throw new Error("Incorrect password");
  }
  const decodedPlaintext = Buffer.from(plaintext).toString();
  return decodedPlaintext;
}

async function deriveEncryptionKey(
  password: string,
  salt: Uint8Array,
  iterations: number,
  digest: string
): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    pbkdf2(
      password,
      salt,
      iterations,
      secretbox.keyLength,
      digest,
      (err, key) => (err ? reject(err) : resolve(key))
    )
  );
}
