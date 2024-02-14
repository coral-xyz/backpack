import { getEnv } from "@coral-xyz/common";
import { decode, encode } from "bs58";
import Crypto from "crypto";
import { randomBytes, secretbox } from "tweetnacl";

// An encrypted secret with associated metadata required for decryption.
export type SecretPayload = {
  ciphertext: string;
  nonce: string;
  salt: string;
  kdf: string;
  iterations: number;
  digest: string;
};

export async function encrypt(
  plaintext: string,
  password: string
): Promise<SecretPayload> {
  const platform = getEnv();
  const isMobile = platform.startsWith("mobile");

  const salt = randomBytes(16);
  const kdf = "pbkdf2";
  const iterations = isMobile ? 100000 : 600000;
  const digest = "sha256";
  const key = await deriveEncryptionKey(
    password,
    salt,
    iterations,
    digest,
    secretbox.keyLength
  );
  const nonce = randomBytes(secretbox.nonceLength);
  const ciphertext = secretbox(Buffer.from(plaintext), nonce, key);
  return {
    ciphertext: encode(ciphertext),
    nonce: encode(nonce),
    kdf,
    salt: encode(salt),
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
  const ciphertext = decode(encodedCiphertext);
  const nonce = decode(encodedNonce);
  const salt = decode(encodedSalt);
  const key = await deriveEncryptionKey(
    password,
    salt,
    iterations,
    digest,
    secretbox.keyLength
  );
  const plaintext = secretbox.open(ciphertext, nonce, key);
  if (!plaintext) {
    throw new Error("Incorrect password");
  }
  const decodedPlaintext = Buffer.from(plaintext).toString();
  return decodedPlaintext;
}

const cache: { [key: string]: Promise<any> } = {};
async function deriveEncryptionKey(
  password: string,
  salt: Uint8Array,
  iterations: number,
  digest: string,
  keyLength: number
): Promise<any> {
  const key = JSON.stringify({ password, salt, iterations, keyLength, digest });
  const derive = () =>
    new Promise((resolve, reject) =>
      Crypto.pbkdf2(password, salt, iterations, keyLength, digest, (err, key) =>
        err ? reject(err) : resolve(key)
      )
    );

  const platform = getEnv();
  const isMobile = platform.startsWith("mobile");

  // on extension we always re-derive the key
  if (!isMobile) {
    return derive();
  }
  // on mobile we cache the derived key in memory
  else {
    if (!cache[key]) {
      cache[key] = derive();
    }
    return cache[key];
  }
}
