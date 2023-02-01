import type { Wallet } from "ethers";
import { ethers } from "ethers";

export function deriveEthereumWallet(
  seed: Buffer,
  derivationPath: string
): Wallet {
  const hdNode = ethers.utils.HDNode.fromSeed(seed);
  const child = hdNode.derivePath(derivationPath);
  return new ethers.Wallet(child.privateKey);
}
