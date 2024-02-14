import { Blockchain } from "@coral-xyz/common";
import { mnemonicToSeedSync } from "bip39";

import {
  EthereumHdKeyringFactory,
  EthereumKeyringFactory,
  EthereumLedgerKeyringFactory,
} from "../services/evm/keyring";
import {
  SolanaHdKeyringFactory,
  SolanaKeyringFactory,
  SolanaLedgerKeyringFactory,
} from "../services/svm/keyring";
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

// TODO: rename SolanaXYZ to SvmXYZ and EthereumXYZ to EvmXYZ.
