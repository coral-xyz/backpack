import { LOAD_PUBLIC_KEY_AMOUNT } from "./constants";
import { Blockchain } from "./types";

export const DerivationPath: { [key: string]: DerivationPath } = {
  Bip44: "bip44",
  Bip44Change: "bip44-change",
  SolletDeprecated: "sollet-deprecated",
  Default: "bip44",
};

export type DerivationPath = "bip44" | "bip44-change" | "sollet-deprecated";

export const derivationPathPrefix = (
  blockchain: Blockchain,
  derivationPath: DerivationPath
) => {
  const paths = {
    [Blockchain.ETHEREUM]: {
      [DerivationPath.Bip44]: "m/44'/60'",
      [DerivationPath.Bip44Change]: "m/44'/60'/0'",
    },
    [Blockchain.SOLANA]: {
      [DerivationPath.Bip44]: "m/44'/501'",
      [DerivationPath.Bip44Change]: "m/44'/501'/0'",
      [DerivationPath.SolletDeprecated]: "m/501'/0'/0/0",
    },
  };

  if (!paths[blockchain] || !paths[blockchain][derivationPath]) {
    throw new Error("derivation path prefix not found");
  }

  return paths[blockchain][derivationPath];
};

/**
 * Get the complete derivation path for an account. Note that account 0 is
 * reindex to be the root, and account 1 becomes the 0th account.
 */
export const accountDerivationPath = (
  blockchain: Blockchain,
  derivationPath: DerivationPath,
  account: number,
  index?: number
) => {
  if (!index) {
    // Deprecated paths but still required for recovery
    if (account === 0) {
      return derivationPathPrefix(blockchain, derivationPath);
    } else {
      return `${derivationPathPrefix(blockchain, derivationPath)}/${
        account - 1
      }`;
    }
  }
  // New Backpack derivation path scheme
  if (index === 0) {
    return `${derivationPathPrefix(blockchain, derivationPath)}/${account}`;
  } else {
    return `${derivationPathPrefix(blockchain, derivationPath)}/${account}/0/${
      index - 1
    }`;
  }
};

/**
 * Get up to `count` public keys for a given blockchain and derivation path
 */
export const getPublicKeysForAccount = (
  blockchain: Blockchain,
  derivationPath: DerivationPath,
  account: number,
  count = LOAD_PUBLIC_KEY_AMOUNT
) => {
  return [...Array(count).keys()].map((i) =>
    accountDerivationPath(blockchain, derivationPath, account, i)
  );
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
  const paths: Array<string> = [];

  // Legacy created/imported accounts (m/44/501'/ and m/44/501'/{0...n})
  paths.concat(
    [...Array(LOAD_PUBLIC_KEY_AMOUNT).keys()].map((i) =>
      accountDerivationPath(blockchain, DerivationPath.Bip44, i)
    )
  );

  // Legacy imported accounts (m/44/501'/0' and m/44/501'/0'/{0...n})
  paths.concat(
    [...Array(LOAD_PUBLIC_KEY_AMOUNT).keys()].map((i) =>
      accountDerivationPath(blockchain, DerivationPath.Bip44Change, i)
    )
  );

  // TODO
  // How many accounts should be searched before giving up? It's possible that
  // the user created up to the nth account and deleted all the rest
  const numAccounts = 5;
  // New derivation path scheme, search the first `LOAD_PUBLIC_KEY_AMOUNT`
  // indexes on the first `numAccounts` account paths
  paths.concat(
    [...Array(numAccounts).keys()]
      .map((k) =>
        [...Array(LOAD_PUBLIC_KEY_AMOUNT).keys()].map((j) =>
          accountDerivationPath(blockchain, DerivationPath.Bip44, k, j)
        )
      )
      .flat()
  );

  // Deduplicate and return
  return [...new Set(paths)];
};
