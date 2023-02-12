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
  const coinType = BIPPath.fromString(derivationPath).toPathArray()[1];
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
  const path = [44 + HARDENING, coinType, index + HARDENING, 0 + HARDENING];
  return new BIPPath.fromPathArray(path).toString();
};

/**
 * m/44'/60'/0'/0
 */
export const ethereumIndexed = (index: number) => {
  const coinType = getCoinType(Blockchain.ETHEREUM);
  const path = [44 + HARDENING, coinType, 0 + HARDENING, 0, index];
  return new BIPPath.fromPathArray(path).toString();
};

/**
 * m/44'/60'/0'
 */
export const legacyLedgerIndexed = (index: number) => {
  const coinType = getCoinType(Blockchain.ETHEREUM);
  const path = [44 + HARDENING, coinType, 0 + HARDENING, index];
  return new BIPPath.fromPathArray(path).toString();
};

/**
 * m/44'/60'
 */
export const legacyLedgerLiveIndexed = (index: number) => {
  const coinType = getCoinType(Blockchain.ETHEREUM);
  const path = [44 + HARDENING, coinType, index];
  return new BIPPath.fromPathArray(path).toString();
};

export const legacySolletIndexed = (index: number) => {
  const coinType = 501 + HARDENING;
  const path = [coinType, index + HARDENING, 0, 0];
  return new BIPPath.fromPathArray(path).toString();
};

// Get the nth index account according to the Backpack derivation path scheme
export const getIndexedPath = (
  blockchain: Blockchain,
  accountIndex = 0,
  walletIndex = 0
) => {
  const coinType = getCoinType(blockchain);
  const path = [
    44 + HARDENING,
    coinType,
    accountIndex + HARDENING,
    0 + HARDENING,
  ];
  // If walletIndex is 0, this is the same as legacyBip44ChangeIndexed
  if (walletIndex > 0) path.push(walletIndex - 1 + HARDENING);
  return new BIPPath.fromPathArray(path).toString();
};

//
// Legacy scheme for newly created wallets
//
//     m/44/501'/ and m/44/501'/{0...n}
//
export const legacyBip44RecoveryPaths = (blockchain: Blockchain) => {
  return [...Array(LOAD_PUBLIC_KEY_AMOUNT).keys()].map((i) =>
    legacyBip44Indexed(blockchain, i)
  );
};

//
// Legacy scheme for newly created wallets
//
//     m/44/501'/{0...n}'/0'
//
export const legacyBip44ChangeRecoveryPaths = (blockchain: Blockchain) => {
  return [...Array(LOAD_PUBLIC_KEY_AMOUNT).keys()].map((i) =>
    legacyBip44ChangeIndexed(blockchain, i)
  );
};

export const getAccountRecoveryPaths = (
  blockchain: Blockchain,
  accountIndex: number
) => {
  return [...Array(LOAD_PUBLIC_KEY_AMOUNT).keys()].map((j) =>
    getIndexedPath(blockchain, accountIndex, j)
  );
};

//
// Get a sensible account and wallet index from a list of derivation paths.
//
export const derivationPathsToIndexes = (
  derivationPaths: Array<string>
): { accountIndex: number; walletIndex: number } => {
  if (derivationPaths.length === 0) {
    return { accountIndex: 0, walletIndex: 0 };
  }
  const pathArrays = derivationPaths.map((x) =>
    BIPPath.fromString(x).toPathArray()
  );
  const accountIndex = Math.max(
    ...pathArrays
      // Account index should be the element at index 2, this is not true for
      // deprecated sollet paths but they are 0 anyway
      .map((p: Array<number>) => (p[2] ? p[2] : 0))
      .map((i: number) => (i >= HARDENING ? i - HARDENING : i))
  );
  const walletIndex = Math.max(
    ...pathArrays
      // Account index should be the element at index 2, this is not true for
      // deprecated sollet paths but they are 0 anyway
      .map((p: Array<number>) => (p[4] ? p[4] + 1 : 0))
      .map((i: number) => (i >= HARDENING ? i - HARDENING : i))
  );
  return { accountIndex, walletIndex };
};

export const getRecoveryPaths = (blockchain: Blockchain) => {
  /**
   * There is a fixed set of derivation paths we should check for wallets when
   * doing recovery.
   *
   * Created wallets from the legacy derivation scheme used by Backpack were
   *
   *     m/44/501'/ and m/44/501'/{0...n}' (bip44)
   *
   * It was possible to import and then derive more wallets from the paths:
   *
   *     m/44/501'/ and m/44/501'/{0...n} (bip44)
   *     m/44/501'/{0...n}'/0' (bip44change)
   *
   * Under the new derivation path scheme created wallets use the derivation
   * paths:
   *
   *     1st account: m/44/501'/, m/44/501'/0', and m/44/501'/0'/0/{0...n}
   *     2nd account: m/44/501'/1'/0', and m/44/501'/1'/0'/{0...n}
   *     3rd account: m/44/501'/2'/0', and m/44/501'/2'/0'/{0...n}
   *     etc
   *
   */
  // Build an array of derivation paths to search for recovery
  let paths: Array<string> = [];
  // Legacy created/imported accounts (m/44/501'/ and m/44/501'/{0...n})
  paths = paths.concat(legacyBip44RecoveryPaths(blockchain));

  // Legacy imported accounts (m/44/501'/0' and m/44/501'/0'/{0...n})
  paths = paths.concat(legacyBip44ChangeRecoveryPaths(blockchain));

  if (blockchain === Blockchain.ETHEREUM) {
    paths = paths.concat(
      [...Array(LOAD_PUBLIC_KEY_AMOUNT).keys()].map(ethereumIndexed)
    );
    paths = paths.concat(
      [...Array(LOAD_PUBLIC_KEY_AMOUNT).keys()].map(legacyLedgerIndexed)
    );
    paths = paths.concat(
      [...Array(LOAD_PUBLIC_KEY_AMOUNT).keys()].map(legacyLedgerLiveIndexed)
    );
  }

  // TODO
  // How many accounts should be searched before giving up? It's possible that
  // the user created up to the nth account and deleted all the rest
  const numAccounts = 2;
  // New derivation path scheme, search the first `LOAD_PUBLIC_KEY_AMOUNT`
  // indexes on the first `numAccounts` account paths
  paths = paths.concat(
    [...Array(numAccounts).keys()]
      .map((j) => getAccountRecoveryPaths(blockchain, j))
      .flat()
  );

  // Deduplicate and return
  return [...new Set(paths)];
};
