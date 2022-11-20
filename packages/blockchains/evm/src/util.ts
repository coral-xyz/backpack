import { ethers } from "ethers";
import type { Wallet } from "ethers";
import { Blockchain, DerivationPath } from "@coral-xyz/common";
import { derivePathStr } from "@coral-xyz/blockchain-common";

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
