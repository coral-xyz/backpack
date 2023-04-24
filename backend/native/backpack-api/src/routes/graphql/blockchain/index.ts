import { ChainId, type WalletBalances } from "../types";

import { Ethereum } from "./ethereum";
import { Solana } from "./solana";

export interface Blockchain {
  getBalancesForAddress(address: string): Promise<WalletBalances | null>;
  id(): ChainId;
  nativeDecimals(): number;
}

export function getBlockchainForId(id: ChainId): Blockchain {
  switch (id) {
    case ChainId.Ethereum: {
      return new Ethereum();
    }

    case ChainId.Solana: {
      return new Solana();
    }
  }
}

export function toBalance(amt: number, decimals: number): number {
  return amt / 10 ** decimals;
}
