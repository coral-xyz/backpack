import type { NetworkSettings } from "@coral-xyz/blockchain-types";

export type EvmSettings = {
  chainId?: string;
} & NetworkSettings;
