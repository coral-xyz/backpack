import type { Wallet } from "ethers";
import { ethers } from "ethers";

export function deriveEthereumWallet(
  seed: Buffer,
  derivationPath: string
): Wallet {
  const privateKey = deriveEthereumPrivateKey(seed, derivationPath);
  return new ethers.Wallet(privateKey);
}

export function deriveEthereumPrivateKey(
  seed: Buffer,
  derivationPath: string
): string {
  const hdNode = ethers.utils.HDNode.fromSeed(seed);
  const child = hdNode.derivePath(derivationPath);
  return child.privateKey;
}
