import type { SolanaNft } from "@coral-xyz/common";
import { DerivationPath } from "@coral-xyz/common";
import { Keypair } from "@solana/web3.js";
import * as bip32 from "bip32";
import { derivePath } from "ed25519-hd-key";
import nacl from "tweetnacl";

import { SolanaCluster, SolanaExplorer } from "./settings";

const join = (...args: Array<string>) => args.join("/");

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
  let dSeed = deriveSeed(seedHex, derivationPath, accountIndex);
  const secret = nacl.sign.keyPair.fromSeed(dSeed).secretKey;
  return Keypair.fromSecretKey(secret);
}

function deriveSeed(
  seedHex: string,
  derivationPath: DerivationPath,
  accountIndex: number
): any {
  const pathStr = derivePathStr(derivationPath, accountIndex);
  switch (derivationPath) {
    case DerivationPath.SolletDeprecated:
      return bip32.fromSeed(Buffer.from(seedHex, "hex")).derivePath(pathStr)
        .privateKey;
    default:
      return derivePath(pathStr, seedHex).key;
  }
}

function derivePathStr(derivationPath: DerivationPath, accountIndex: number) {
  switch (derivationPath) {
    case DerivationPath.Bip44:
      return accountIndex === 0
        ? `m/44'/501'`
        : `m/44'/501'/${accountIndex - 1}'`;
    case DerivationPath.Bip44Change:
      return `m/44'/501'/${accountIndex}'/0'`;
    case DerivationPath.SolletDeprecated:
      return `m/501'/${accountIndex}'/0/0`;
    default:
      throw new Error(`invalid derivation path: ${derivationPath}`);
  }
}

export function resolveExplorerUrl(
  base: string,
  transactionOrNft: string | SolanaNft,
  connectionUrl: string
) {
  return join(
    base,
    `${transactionOrNftQuery(base, transactionOrNft)}${clusterSuffix(
      base,
      connectionUrl
    )}`
  );
}

/**
 * Returns query string to view a transaction or NFT required by each explorer.
 */
function transactionOrNftQuery(
  base: String,
  transactionOrNft: string | SolanaNft
) {
  const isTransaction = typeof transactionOrNft === "string";
  if (!isTransaction) {
    return `address/${transactionOrNft.mint.toString()}`;
  }
  switch (base) {
    case SolanaExplorer.SOLANA_EXPLORER:
    case SolanaExplorer.SOLSCAN:
    case SolanaExplorer.SOLANA_FM:
      return `tx/${transactionOrNft}`;
    case SolanaExplorer.SOLANA_BEACH:
      return `transaction/${transactionOrNft}`;
    default:
      throw new Error("unknown Solana explorer base");
  }
}

/**
 * Returns the cluster search params required by each explorer.
 */
function clusterSuffix(base: string, connectionUrl: string): string {
  switch (base) {
    case SolanaExplorer.SOLANA_FM:
      switch (connectionUrl) {
        case SolanaCluster.MAINNET:
          return "?cluster=mainnet";
        case SolanaCluster.DEVNET:
          return "?cluster=devnet";
        case SolanaCluster.LOCALNET:
          return "?cluster=localnet";
        default:
          return "?cluster=custom";
      }
    case SolanaExplorer.SOLANA_EXPLORER:
    case SolanaExplorer.SOLSCAN:
    case SolanaExplorer.SOLANA_BEACH:
      switch (connectionUrl) {
        case SolanaCluster.MAINNET:
          return "?cluster=mainnet";
        case SolanaCluster.DEVNET:
          return "?cluster=devnet";
        case SolanaCluster.LOCALNET:
          return "?cluster=localnet";
        default:
          return "";
      }
    default:
      throw new Error("unknown Solana explorer base");
  }
}
