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

export const accountDerivationPath = (
  blockchain: Blockchain,
  derivationPath: DerivationPath,
  account: number
) => {
  return `${derivationPathPrefix(blockchain, derivationPath)}/${account}`;
};
