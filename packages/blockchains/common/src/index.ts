import type { EvmSettings } from "@coral-xyz/blockchain-evm";
import {
  DefaultSettings as EthereumDefaultSettings,
  EthereumHdKeyringFactory,
  EthereumKeyringFactory,
  EthereumLedgerKeyringFactory,
  resolveExplorerUrl as resolveEthereumExplorerUrl,
} from "@coral-xyz/blockchain-evm";
import { BlockchainKeyring } from "@coral-xyz/blockchain-keyring";
import type { SolanaSettings } from "@coral-xyz/blockchain-solana";
import {
  DefaultSettings as SolanaDefaultSettings,
  resolveExplorerUrl as resolveSolanaExplorerUrl,
  SolanaHdKeyringFactory,
  SolanaKeyringFactory,
  SolanaLedgerKeyringFactory,
} from "@coral-xyz/blockchain-solana";

enum Blockchain {
  SOLANA = "solana",
  ETHEREUM = "ethereum",
}

// TODO we can clean these up with a common interface in the blockchain specific packages

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

export function defaultSettingsForBlockchain(blockchain: Blockchain) {
  return {
    [Blockchain.SOLANA]: SolanaDefaultSettings,
    [Blockchain.ETHEREUM]: EthereumDefaultSettings,
  }[blockchain];
}

export function explorerResolverForBlockchain(blockchain: Blockchain) {
  return {
    [Blockchain.SOLANA]: resolveSolanaExplorerUrl,
    [Blockchain.ETHEREUM]: resolveEthereumExplorerUrl,
  }[blockchain];
}

export type BlockchainSettings = EvmSettings | SolanaSettings;

// Exports
export type { EvmSettings } from "@coral-xyz/blockchain-evm";
export {
  EthereumConnectionUrl,
  EthereumExplorer,
} from "@coral-xyz/blockchain-evm";
export {
  BlockchainKeyring,
  DefaultKeyname,
} from "@coral-xyz/blockchain-keyring";
export type { SolanaSettings } from "@coral-xyz/blockchain-solana";
export {
  DEFAULT_SOLANA_CLUSTER,
  SolanaCluster,
  SolanaExplorer,
} from "@coral-xyz/blockchain-solana";
