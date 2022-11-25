import type { EvmSettings } from "@coral-xyz/blockchain-evm";
import {
  EthereumHdKeyringFactory,
  EthereumKeyringFactory,
  EthereumLedgerKeyringFactory,
} from "@coral-xyz/blockchain-evm";
import { BlockchainKeyring } from "@coral-xyz/blockchain-keyring";
import type { SolanaSettings } from "@coral-xyz/blockchain-solana";
import {
  SolanaHdKeyringFactory,
  SolanaKeyringFactory,
  SolanaLedgerKeyringFactory,
} from "@coral-xyz/blockchain-solana";

enum Blockchain {
  SOLANA = "solana",
  ETHEREUM = "ethereum",
}

export function hdFactoryForBlockchain(blockchain: Blockchain) {
  return {
    [Blockchain.SOLANA]: new SolanaHdKeyringFactory(),
    [Blockchain.ETHEREUM]: new EthereumHdKeyringFactory(),
  }[blockchain];
}

export function keyringForBlockchain(
  blockchain: Blockchain
): BlockchainKeyring {
  return {
    [Blockchain.SOLANA]: new BlockchainKeyring(
      new SolanaHdKeyringFactory(),
      new SolanaKeyringFactory(),
      new SolanaLedgerKeyringFactory()
    ),
    [Blockchain.ETHEREUM]: new BlockchainKeyring(
      new EthereumHdKeyringFactory(),
      new EthereumKeyringFactory(),
      new EthereumLedgerKeyringFactory()
    ),
  }[blockchain];
}

export type BlockchainSettings = EvmSettings | SolanaSettings;

// Exports
export type { EvmSettings } from "@coral-xyz/blockchain-evm";
export {
  DefaultKeyname,
  BlockchainKeyring,
} from "@coral-xyz/blockchain-keyring";
export type { SolanaSettings } from "@coral-xyz/blockchain-solana";
