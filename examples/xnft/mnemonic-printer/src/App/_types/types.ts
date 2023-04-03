export enum Blockchain {
  SOLANA = "solana",
  ETHEREUM = "ethereum",
}

export type MnemonicResponse = {
  /** Derivation path of the public key */
  derivationPath: string;
  /** Public key */
  publicKey: string;
};
