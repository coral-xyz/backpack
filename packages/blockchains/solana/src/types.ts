import type { Commitment } from "@solana/web3.js";
import type { NetworkSettings } from "@coral-xyz/blockchain-types";

export type SolanaSettings = {
  commitment: Commitment;
  cluster: string;
} & NetworkSettings;
