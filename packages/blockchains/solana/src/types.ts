import type { Commitment } from "@solana/web3.js";
import type { NetworkBaseSettings } from "@coral-xyz/blockchain-types";

export type SolanaSettings = {
  commitment: Commitment;
} & NetworkBaseSettings;
