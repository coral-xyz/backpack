import BIPPath from "bip32-path";

import { LOAD_PUBLIC_KEY_AMOUNT } from "./constants";
import { Blockchain } from "./types";

export const HARDENING = 0x80000000;

// TODO could use SLIP44
export const blockchainCoinType = {
  [Blockchain.ETHEREUM]: 60,
  [Blockchain.SOLANA]: 501,
};

export const getCoinType = (blockchain: Blockchain) => {
  const coinType = blockchainCoinType[blockchain];
  if (!coinType) {
    throw new Error("Invalid blockchain");
  }
  return coinType + HARDENING;
};

export const getBlockchainFromPath = (derivationPath: string): Blockchain => {
  const coinType = BIPPath.fromString(derivationPath)[1];
  return Object.keys(blockchainCoinType).find(
    (key) =>
      blockchainCoinType[key] === coinType ||
      blockchainCoinType[key] === coinType - HARDENING
  ) as Blockchain;
};

export const legacyBip44Indexed = (blockchain: Blockchain, index: number) => {
  const coinType = getCoinType(blockchain);
  const path = [44 + HARDENING, coinType];
  if (index > 0) path.push(index - 1 + HARDENING);
  return new BIPPath.fromPathArray(path).toString();
};

export const legacyBip44ChangeIndexed = (
  blockchain: Blockchain,
  index: number
) => {
  const coinType = getCoinType(blockchain);
  const path = [44 + HARDENING, coinType, 0 + HARDENING];
  if (index > 0) path.push(index - 1 + HARDENING);
  return new BIPPath.fromPathArray(path).toString();
};

export const legacySolletIndexed = (index: number) => {
  // TODO
  return "";
};

// Get the nth index account according to the Backpack derivation path scheme
export const getIndexedPath = (
  blockchain: Blockchain,
  account = 0,
  index = 0
) => {
  const coinType = getCoinType(blockchain);
  const path = [44 + HARDENING, coinType, account + HARDENING, 0 + HARDENING];
  if (index > 0) path.push(index - 1 + HARDENING);
  return new BIPPath.fromPathArray(path).toString();
};

export const getRecoveryPaths = (blockchain: Blockchain) => {
  /**
   * There is a fixed set of derivation paths we should check for wallets when
   * doing recovery.
   *
   * Created wallets from the legacy derivation scheme used by Backpack were
   *
   *     m/44/501'/ and m/44/501'/{0...n}
   *
   * It was possible to import wallets from the paths:
   *
   *     m/44/501'/ and m/44/501'/{0...n}
   *     m/44/501'/0' and m/44/501'/0'/{0...n}
   *
   * Under the new derivation path scheme created wallets use the derivation
   * paths:
   *
   *     1st account: m/44/501'/, m/44/501'/0', and m/44/501'/0'/0/{0...n}
   *     2nd account: m/44/501'/1', and m/44/501'/1'/0/{0...n}
   *     3rd account: m/44/501'/2', and m/44/501'/2'/0/{0...n}
   *     etc
   *
   */

  // Build an array of derivation paths to search for recovery
  let paths: Array<string> = [];
  // Legacy created/imported accounts (m/44/501'/ and m/44/501'/{0...n})
  paths = paths.concat(
    [...Array(LOAD_PUBLIC_KEY_AMOUNT).keys()].map((i) =>
      legacyBip44Indexed(blockchain, i)
    )
  );

  // Legacy imported accounts (m/44/501'/0' and m/44/501'/0'/{0...n})
  paths = paths.concat(
    [...Array(LOAD_PUBLIC_KEY_AMOUNT).keys()].map((i) =>
      legacyBip44ChangeIndexed(blockchain, i)
    )
  );

  // TODO
  // How many accounts should be searched before giving up? It's possible that
  // the user created up to the nth account and deleted all the rest
  const numAccounts = 5;
  // New derivation path scheme, search the first `LOAD_PUBLIC_KEY_AMOUNT`
  // indexes on the first `numAccounts` account paths
  paths = paths.concat(
    [...Array(numAccounts).keys()]
      .map((k) =>
        [...Array(LOAD_PUBLIC_KEY_AMOUNT).keys()].map((j) =>
          getIndexedPath(blockchain, k, j).toString()
        )
      )
      .flat()
  );

  // Deduplicate and return
  return [...new Set(paths)];
};
