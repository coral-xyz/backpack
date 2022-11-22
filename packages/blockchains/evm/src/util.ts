import { ethers } from "ethers";
import type { Wallet } from "ethers";
import { DerivationPath } from "@coral-xyz/common";

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
  const path = derivePathStr(derivationPath, accountIndex);
  const child = hdNode.derivePath(path);
  return new ethers.Wallet(child.privateKey);
}

function derivePathStr(derivationPath: DerivationPath, accountIndex: number) {
  switch (derivationPath) {
    case DerivationPath.Bip44:
      return accountIndex === 0
        ? `m/44'/60'`
        : `m/44'/60'/${accountIndex - 1}'`;
    case DerivationPath.Bip44Change:
      return `m/44'/60'/${accountIndex}'/0'`;
    default:
      throw new Error(`invalid derivation path: ${derivationPath}`);
  }
}
