import { Blockchain } from "@coral-xyz/common";
import { mnemonicToSeedSync } from "bip39";

import {
  EthereumHdKeyringFactory,
  EthereumKeyringFactory,
  EthereumLedgerKeyringFactory,
} from "../services/evm/keyring";
import { deriveEthereumPrivateKey } from "../services/evm/util";
import {
  SolanaHdKeyringFactory,
  SolanaKeyringFactory,
  SolanaLedgerKeyringFactory,
} from "../services/svm/keyring";
import { deriveSolanaPrivateKey } from "../services/svm/util";
import type { SecureStore } from "../store/SecureStore";

import { BlockchainKeyring } from "./BlockchainKeyring";

export function hdFactoryForBlockchain(blockchain: Blockchain) {
  return {
    [Blockchain.SOLANA]: new SolanaHdKeyringFactory(),
    [Blockchain.ECLIPSE]: new SolanaHdKeyringFactory(),
    [Blockchain.ETHEREUM]: new EthereumHdKeyringFactory(),
  }[blockchain];
}

export function keyringForBlockchain(
  blockchain: Blockchain,
  store: SecureStore
): BlockchainKeyring {
  return {
    [Blockchain.SOLANA]: new BlockchainKeyring(
      Blockchain.SOLANA,
      store,
      new SolanaHdKeyringFactory(),
      new SolanaKeyringFactory(),
      new SolanaLedgerKeyringFactory()
    ),
    [Blockchain.ECLIPSE]: new BlockchainKeyring(
      Blockchain.ECLIPSE,
      store,
      new SolanaHdKeyringFactory(),
      new SolanaKeyringFactory(),
      new SolanaLedgerKeyringFactory()
    ),
    [Blockchain.ETHEREUM]: new BlockchainKeyring(
      Blockchain.ETHEREUM,
      store,
      new EthereumHdKeyringFactory(),
      new EthereumKeyringFactory(),
      new EthereumLedgerKeyringFactory()
    ),
  }[blockchain];
}

export function mnemonicPathToPrivateKey(
  blockchain: Blockchain,
  mnemonic: string,
  derivationPath: string
): string {
  const seed = mnemonicToSeedSync(mnemonic);
  if (blockchain === Blockchain.ETHEREUM) {
    return deriveEthereumPrivateKey(seed, derivationPath);
  } else if (blockchain === Blockchain.SOLANA) {
    return Buffer.from(deriveSolanaPrivateKey(seed, derivationPath)).toString(
      "hex"
    );
  } else if (blockchain === Blockchain.ECLIPSE) {
    return Buffer.from(deriveSolanaPrivateKey(seed, derivationPath)).toString(
      "hex"
    );
  }
  throw new Error("invalid blockchain");
}

// TODO: rename SolanaXYZ to SvmXYZ and EthereumXYZ to EvmXYZ.
