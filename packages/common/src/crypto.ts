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
 * m/44'/60'/0'/0/x
 */
export const ethereumIndexed = (index: number) => {
  const coinType = getCoinType(Blockchain.ETHEREUM);
  const path = [44 + HARDENING, coinType, 0 + HARDENING, 0, index];
  return new BIPPath.fromPathArray(path).toString();
};

/**
 * m/44'/60'/x
 */
export const legacyEthereum = (index: number) => {
  const coinType = getCoinType(Blockchain.ETHEREUM);
  const path = [44 + HARDENING, coinType, index];
  return new BIPPath.fromPathArray(path).toString();
};

/**
 * m/44'/60'/0'/x
 */
export const legacyLedgerIndexed = (index: number) => {
  const coinType = getCoinType(Blockchain.ETHEREUM);
  const path = [44 + HARDENING, coinType, 0 + HARDENING, index];
  return new BIPPath.fromPathArray(path).toString();
};

/**
 * m/44'/60'/x'/0/0
 */
export const legacyLedgerLiveAccount = (accountIndex: number) => {
  const coinType = getCoinType(Blockchain.ETHEREUM);
  const path = [44 + HARDENING, coinType, accountIndex + HARDENING, 0, 0];
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
  if (walletIndex >= 0) path.push(walletIndex + HARDENING);
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
  return [...Array(LOAD_PUBLIC_KEY_AMOUNT + 1).keys()].map((j) =>
    getIndexedPath(blockchain, accountIndex, j - 1)
  );
};

//
// Get a sensible account and wallet index from a list of derivation paths.
//
export const nextIndicesFromPaths = (
  derivationPaths: Array<string>
): { accountIndex: number; walletIndex: number } => {
  if (derivationPaths.length === 0) {
    return { accountIndex: 0, walletIndex: 0 };
  }
  const pathArrays = derivationPaths.map((x) =>
    BIPPath.fromString(x).toPathArray()
  );

  function isDefined<T>(argument: T | undefined): argument is T {
    return argument !== undefined;
  }

  const accountIndices = pathArrays
    .map((p: Array<number> | undefined) => (p ? p[2] : undefined))
    .filter(isDefined);

  // If there is no account indices we likely have `m/44/501'`
  if (accountIndices.length == 0) {
    return { accountIndex: 0, walletIndex: -1 };
  }

  const accountIndex = Math.max(
    ...accountIndices.map((i: number) => (i >= HARDENING ? i - HARDENING : i))
  );

  const pathsForMaxAccountIndex = pathArrays.filter(
    (p) => p[2] === Math.max(...accountIndices) // Maintain hardening to filter
  );

  const walletIndices = pathsForMaxAccountIndex
    .map((p: Array<number> | undefined) => (p ? p[4] : undefined))
    .filter(isDefined);

  // If there are no wallet indices we likely have `m/44/501'/0'/0'`
  if (walletIndices.length === 0) {
    return { accountIndex: 0, walletIndex: 0 };
  }

  const walletIndex =
    Math.max(
      ...walletIndices.map((i: number) => (i >= HARDENING ? i - HARDENING : i))
    ) + 1; // Increment by 1 to get the next wallet index that should be used

  return { accountIndex, walletIndex };
};

export const getRecoveryPaths = (blockchain: Blockchain, ledger = false) => {
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
  // Legacy imported accounts (m/44/501'/0' and m/44/501'/{0..n}'/0')
  paths = paths.concat(legacyBip44ChangeRecoveryPaths(blockchain));
  // Legacy imported accounts (m/44/501'/{0...n})/0'/0'
  paths = paths.concat(
    legacyBip44ChangeRecoveryPaths(blockchain).map((x) => x + "/0'")
  );
  if (blockchain === Blockchain.SOLANA && !ledger) {
    // Handle legacy Solana wallets that were created in 0.5.0 that had
    // Ethereum derivation paths. Ledger does not allow these paths and
    // so is not impacted by this.
    paths = paths.concat(
      getAccountRecoveryPaths(Blockchain.SOLANA, 0).map((d) =>
        d.replace("501", "60")
      )
    );
  } else if (blockchain === Blockchain.ETHEREUM) {
    paths = paths.concat(
      [...Array(LOAD_PUBLIC_KEY_AMOUNT).keys()].map(legacyEthereum)
    );
    paths = paths.concat(
      [...Array(LOAD_PUBLIC_KEY_AMOUNT).keys()].map(ethereumIndexed)
    );
    paths = paths.concat(
      [...Array(LOAD_PUBLIC_KEY_AMOUNT).keys()].map(legacyLedgerIndexed)
    );
    paths = paths.concat(
      [...Array(LOAD_PUBLIC_KEY_AMOUNT).keys()].map(legacyLedgerLiveAccount)
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
