import { Blockchain } from "@coral-xyz/common";

import type { BlockchainConfig } from "../types/blockchain";

import { eclipseBlockchainConfig } from "./eclipse/config";
import { ethereumBlockchainConfig } from "./ethereum/config";
import { solanaBlockchainConfig } from "./solana/config";

type BlockchainConfigMap<B extends Blockchain = Blockchain> = Record<
  B,
  BlockchainConfig<B>
>;

const blockchainConfigs: BlockchainConfigMap = {
  [Blockchain.ETHEREUM]: ethereumBlockchainConfig,
  [Blockchain.SOLANA]: solanaBlockchainConfig,
  [Blockchain.ECLIPSE]: eclipseBlockchainConfig,
};

export function getAllBlockchainConfigs(): Record<
  Blockchain,
  BlockchainConfig
> {
  return blockchainConfigs;
}

export function getBlockchainConfig<B extends Blockchain = Blockchain>(
  blockchain: B
): BlockchainConfig<B> {
  return blockchainConfigs[blockchain] as BlockchainConfig<B>;
}

export function getEnabledBlockchainConfigs(): Partial<
  Record<Blockchain, BlockchainConfig>
> {
  return Object.fromEntries(
    Object.entries(blockchainConfigs).filter(([, config]) => config.Enabled)
  );
}
