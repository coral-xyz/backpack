import { pbkdf2 } from "crypto";
import nacl, { randomBytes, secretbox } from "tweetnacl";
import * as bs58 from "bs58";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import { ethers } from "ethers";
import type { Wallet } from "ethers";
import { Blockchain, DerivationPath } from "@coral-xyz/common";
import { generateMnemonic, mnemonicToSeed } from "bip39";

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

export function deriveEthereumWallets(
  seed: Buffer,
  derivationPath: DerivationPath,
  accountIndices: Array<number>
): Array<Wallet> {
  const wallets: Array<Wallet> = [];
  for (const accountIndex of accountIndices) {
    wallets.push(deriveEthereumWallet(seed, accountIndex, derivationPath));
  }
  return wallets;
}

export function deriveEthereumWallet(
  seed: Buffer,
  accountIndex: number,
  derivationPath: DerivationPath
): Wallet {
  const hdNode = ethers.utils.HDNode.fromSeed(seed);
  const path = derivePathStr(Blockchain.ETHEREUM, derivationPath, accountIndex);
  const child = hdNode.derivePath(path);
  return new ethers.Wallet(child.privateKey);
}

function derivePathStr(
  blockchain: Blockchain,
  derivationPath: DerivationPath,
  accountIndex: number
): string {
  const coinType = {
    [Blockchain.ETHEREUM]: 60,
    [Blockchain.SOLANA]: 501,
  }[blockchain];
  switch (derivationPath) {
    case DerivationPath.Bip44:
      return accountIndex === 0
        ? `m/44'/${coinType}'`
        : `m/44'/${coinType}'/${accountIndex - 1}'`;
    case DerivationPath.Bip44Change:
      return `m/44'/${coinType}'/${accountIndex}'/0'`;
    default:
      throw new Error(`invalid derivation path: ${derivationPath}`);
  }
}

// Creates a new mnemonic and seed.
export async function generateMnemonicAndSeed(): Promise<MnemonicSeed> {
  const mnemonic = generateMnemonic(256);
  const seed = await mnemonicToSeed(mnemonic);
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
