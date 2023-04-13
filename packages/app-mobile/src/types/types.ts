import type { Blockchain } from "@coral-xyz/common";
import type { useBlockchainTokensSorted } from "@coral-xyz/recoil";
export type Token = ReturnType<typeof useBlockchainTokensSorted>[number];

export enum NavTokenAction {
  Receive,
  Send,
  Swap,
}

export type NavTokenOptions = any;
export type PublicKey = string;

export type Wallet = {
  publicKey: PublicKey;
  blockchain: Blockchain;
  name: string;
  type?: string;
  isCold: boolean;
};
