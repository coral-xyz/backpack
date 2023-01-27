import {
  accountDerivationPath,
  Blockchain,
  DerivationPath,
} from "@coral-xyz/common";
import type { Wallet } from "ethers";
import { ethers } from "ethers";

export function deriveEthereumWallets(
  seed: Buffer,
  derivationPath: DerivationPath,
  accountIndices: Array<number>
): Array<Wallet> {
  const wallets: Array<Wallet> = [];
  for (const accountIndex of accountIndices) {
    wallets.push(
      deriveEthereumWallet(seed, derivationPath, accountIndex, walletIndex)
    );
  }
  return wallets;
}

export function deriveEthereumWallet(
  seed: Buffer,
  derivationPath: DerivationPath,
  accountIndex: number,
  walletIndex?: number
): Wallet {
  const hdNode = ethers.utils.HDNode.fromSeed(seed);
  const path = accountDerivationPath(
    Blockchain.ETHEREUM,
    derivationPath,
    accountIndex,
    walletIndex
  );
  const child = hdNode.derivePath(path);
  return new ethers.Wallet(child.privateKey);
}
