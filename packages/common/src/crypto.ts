import { LOAD_PUBLIC_KEY_AMOUNT } from "./constants";
import { Blockchain } from "./types";

/*
 * BIP44 path defines the following levels:
 * - m / purpose' / coin_type' / account' / change / address_index
 *
 * This class allows passing undefined account, change and address_index to
 * generate
 * root paths which may not be strictly conformant. E.g.
 *
 * - m/44'/501'/
 * - m/44'/501'/0'
 *
 * https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
 * https://github.com/bitcoin/bips/blob/master/bip-0043.mediawiki
 * https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
 */

export class BIP44Path {
  public static readonly HARDENING: number = 0x80000000;
  private static readonly REGEX_VALID_BIP44: string =
    "^((m/)?(44'?))(/[0-9]+'?){2}((/[0-9]+){2})?$";
  // Elements of the derivation path in order, e.g. address_index would be at
  // index 4
  private _elements: Array<number | undefined> = [];

  public static blockchainCoinType(blockchain: Blockchain) {
    // TODO could use SLIP44?
    const coinType = {
      [Blockchain.ETHEREUM]: 60 + BIP44Path.HARDENING,
      [Blockchain.SOLANA]: 501 + BIP44Path.HARDENING,
    }[blockchain];
    if (!coinType) {
      throw new Error("Invalid blockchain");
    }
    return coinType;
  }

  constructor(
    coinType: number,
    account?: number,
    change?: number,
    addressIndex?: number
  ) {
    this.coinType = coinType;
    this.account = account;
    this.change = change;
    this.addressIndex = addressIndex;
  }

  get purpose() {
    return 44 + BIP44Path.HARDENING;
  }

  get coinType() {
    return this._elements[1]!;
  }

  set coinType(coinType: number) {
    // Enforce hardening
    if (coinType < BIP44Path.HARDENING) coinType += BIP44Path.HARDENING;
    this._elements[1] = coinType;
  }

  get account() {
    return this._elements[2]!;
  }

  set account(account: number | undefined) {
    // Enforce hardening
    if (account !== undefined && account < BIP44Path.HARDENING)
      account += BIP44Path.HARDENING;
    this._elements[2] = account;
  }

  get change() {
    return this._elements[3];
  }

  set change(change: number | undefined) {
    this._elements[3] = change;
  }

  get addressIndex() {
    return this._elements[4];
  }

  set addressIndex(addressIndex: number | undefined) {
    this._elements[4] = addressIndex;
  }

  toString() {
    return `m/${[this.purpose, ...this._elements]
      .map((n) =>
        n !== undefined && n >= BIP44Path.HARDENING
          ? `${n - BIP44Path.HARDENING}'`
          : n
      )
      .filter((n) => n !== undefined)
      .join("/")}`;
  }

  fromString(path: string) {
    if (!path.toString().match(new RegExp(BIP44Path.REGEX_VALID_BIP44, "g"))) {
      throw new Error(`${path} is an invalid path`);
    }
    const _elements: number[] = [];
    for (const level in path.replace("m/", "").split("/")) {
      let element = parseInt(level, 10);
      if (level.length > 1 && level.endsWith("'")) {
        element += BIP44Path.HARDENING;
      }
      _elements.push(element);
    }
    this._elements = _elements;
  }
}

export const getLegacyIndexedPath = (blockchain: Blockchain, index) => {};

// Get the nth index account according to the Backpack derivation path scheme
export const getIndexedPath = (
  blockchain: Blockchain,
  account = 0,
  index = 0
) => {
  return new BIP44Path(
    BIP44Path.blockchainCoinType(blockchain),
    account + BIP44Path.HARDENING,
    0 + BIP44Path.HARDENING,
    index === 0 ? undefined : index - 1
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
      // Pass undefined for the 0th index so the first is the root
      new BIP44Path(
        BIP44Path.blockchainCoinType(blockchain),
        i === 0 ? undefined : i - 1
      ).toString()
    )
  );

  // Legacy imported accounts (m/44/501'/0' and m/44/501'/0'/{0...n})
  paths.concat(
    [...Array(LOAD_PUBLIC_KEY_AMOUNT).keys()].map((i) =>
      new BIP44Path(
        BIP44Path.blockchainCoinType(blockchain),
        // Harden the account
        i + BIP44Path.HARDENING,
        // Pass undefined for the 0th index so first is the root
        i === 0 ? undefined : i - 1
      ).toString()
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
          getIndexedPath(blockchain, k, j).toString()
        )
      )
      .flat()
  );

  // Deduplicate and return
  return [...new Set(paths)];
};
