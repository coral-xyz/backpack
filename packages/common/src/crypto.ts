import { Blockchain } from "./types";

export const DerivationPath: { [key: string]: DerivationPath } = {
  Bip44: "bip44",
  Bip44Change: "bip44-change",
  Default: "bip44-change",
};

export type DerivationPath = "bip44" | "bip44-change";

export const derivationPathPrefix = (
  blockchain: Blockchain,
  derivationPath: DerivationPath
) => {
  const paths = {
    [Blockchain.ETHEREUM]: {
      [DerivationPath.Bip44]: "44'/60'",
      [DerivationPath.Bip44Change]: "44'/60'/0'",
    },
    [Blockchain.SOLANA]: {
      [DerivationPath.Bip44]: "44'/501'",
      [DerivationPath.Bip44Change]: "44'/501'/0'",
    },
  };

  if (!paths[blockchain] || !paths[blockchain][derivationPath]) {
    throw new Error("derivation path prefix not found");
  }

  return paths[blockchain][derivationPath];
};

/**
 * Get the complete derivation path for an account. Note that account 0 is reindex to be the root,
 *  and account 1 becomes the 0th account.
 */
export const accountDerivationPath = (
  blockchain: Blockchain,
  derivationPath: DerivationPath,
  account: number
) => {
  if (account === 0) {
    return derivationPathPrefix(blockchain, derivationPath);
  } else {
    return `${derivationPathPrefix(blockchain, derivationPath)}/${account - 1}`;
  }
};
