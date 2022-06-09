export const DerivationPath: { [key: string]: DerivationPath } = {
  Bip44: "bip44",
  Bip44Change: "bip44-change",
  Default: "bip44-change",
};

export type DerivationPath = "bip44" | "bip44-change";
