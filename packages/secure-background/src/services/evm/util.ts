import { HDNodeWallet, Wallet } from "ethers6";

export function deriveEthereumWallet(
  seed: Buffer,
  derivationPath: string
): Wallet {
  const privateKey = deriveEthereumPrivateKey(seed, derivationPath);
  return new Wallet(privateKey);
}

export function deriveEthereumPrivateKey(
  seed: Buffer,
  derivationPath: string
): string {
  const hdNode = HDNodeWallet.fromSeed(seed);
  const child = hdNode.derivePath(derivationPath);
  return child.privateKey;
}
