import type { useBlockchainTokensSorted } from "@coral-xyz/recoil";
export type Token = ReturnType<typeof useBlockchainTokensSorted>[number];

export enum NavTokenAction {
  Receive,
  Send,
  Swap,
}

export type NavTokenOptions = any;
