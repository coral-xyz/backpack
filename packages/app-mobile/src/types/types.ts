import type { Blockchain } from "@coral-xyz/common";
import type { useBlockchainTokensSorted } from "@coral-xyz/recoil";
export type Token = ReturnType<typeof useBlockchainTokensSorted>[number];

export enum NavTokenAction {
  Receive,
  Send,
  Swap,
}

export type NavTokenOptions = any;

export type Wallet = {
  publicKey: string;
  blockchain: Blockchain;
  name: string;
  type?: string;
  isCold: boolean;
};
