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
  const salt = randomBytes(16);
  const kdf = "pbkdf2";
  const iterations = 100000;
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

async function deriveEncryptionKey(
  password: string,
  salt: Uint8Array,
  iterations: number,
  digest: string,
  keyLength: number
): Promise<any> {
  return new Promise((resolve, reject) =>
    Crypto.pbkdf2(password, salt, iterations, keyLength, digest, (err, key) =>
      err ? reject(err) : resolve(key)
    )
  );
}
