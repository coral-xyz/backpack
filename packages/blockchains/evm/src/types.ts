import type { NetworkBaseSettings } from "@coral-xyz/blockchain-types";

export type EvmSettings = {
  chainId?: string;
} & NetworkBaseSettings;
