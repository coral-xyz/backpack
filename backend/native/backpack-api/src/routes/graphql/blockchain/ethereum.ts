import { ChainId, type WalletBalances } from "../types";

import type { Blockchain } from ".";

export class Ethereum implements Blockchain {
  constructor() {}

  async getBalancesForAddress(
    _address: string
  ): Promise<WalletBalances | null> {
    return null;
  }

  id(): ChainId {
    return ChainId.Ethereum;
  }

  nativeDecimals(): number {
    return 18;
  }
}
