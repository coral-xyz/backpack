import { Keypair } from "@solana/web3.js";
import { mnemonicToSeedSync } from "bip39";
import { ethers } from "ethers";
import { HDKey } from "micro-ed25519-hdkey";

export type KeypairPath = {
  path: string;
  publicKey: string;
};

export function getBackgroundColor(path: string): string {
  const spl = path.split("/");
  switch (spl.length) {
    case 3:
      return "blue";
    case 4:
      return "green";
    case 5:
      return "red";
    default:
      return "purple";
  }
}

export function getMnemonicPaths(
  blockchain: "solana" | "ethereum",
  phrase: string
): KeypairPath[] {
  return blockchain === "solana"
    ? getSolanaMnemonicPaths(phrase)
    : getEthereumMnemonicPaths(phrase);
}

function getEthereumMnemonicPaths(phrase: string): KeypairPath[] {
  const paths: KeypairPath[] = [];

  const root = `m/44'/60'`;
  const wallet = ethers.Wallet.fromMnemonic(phrase, root);
  paths.push({ path: root, publicKey: wallet.address });

  for (let i = 0; i < 10; i++) {
    const p = `m/44'/60'/${i}'`;
    const wallet = ethers.Wallet.fromMnemonic(phrase, p);
    paths.push({ path: p, publicKey: wallet.address });
  }

  for (let i = 0; i < 10; i++) {
    const root = `m/44'/60'/${i}'/0'`;
    const wallet = ethers.Wallet.fromMnemonic(phrase, root);
    paths.push({ path: root, publicKey: wallet.address });

    for (let j = 0; j < 10; j++) {
      const p = `m/44'/60'/${i}'/0'/${j}'`;
      const wallet = ethers.Wallet.fromMnemonic(phrase, p);
      paths.push({ path: p, publicKey: wallet.address });
    }
  }

  return paths;
}

function getSolanaMnemonicPaths(phrase: string): KeypairPath[] {
  const paths: KeypairPath[] = [];

  const seed = mnemonicToSeedSync(phrase, "");
  const hd = HDKey.fromMasterSeed(seed.toString("hex"));

  const root = `m/44'/501'`;
  const kp = Keypair.fromSeed(hd.derive(root).privateKey);
  paths.push({ path: root, publicKey: kp.publicKey.toBase58() });

  for (let i = 0; i < 10; i++) {
    const p = `m/44'/501'/${i}'`;
    const kp = Keypair.fromSeed(hd.derive(p).privateKey);
    paths.push({ path: p, publicKey: kp.publicKey.toBase58() });
  }

  for (let i = 0; i < 10; i++) {
    const root = `m/44'/501'/${i}'/0'`;
    const kp = Keypair.fromSeed(hd.derive(root).privateKey);
    paths.push({ path: root, publicKey: kp.publicKey.toBase58() });

    for (let j = 0; j < 10; j++) {
      const p = `m/44'/501'/${i}'/0'/${j}'`;
      const kp = Keypair.fromSeed(hd.derive(p).privateKey);
      paths.push({ path: p, publicKey: kp.publicKey.toBase58() });
    }
  }

  return paths;
}
