import { ChainId, type WalletBalances } from "../types";

import { Ethereum } from "./ethereum";
import { Solana } from "./solana";

export interface Blockchain {
  getBalancesForAddress(address: string): Promise<WalletBalances | null>;
  getNftsForAddress(address: string): Promise<any>;
  id(): ChainId;
  nativeDecimals(): number;
}

/**
 * Factory function for returning an instance of `Blockchain` based
 * on the enum variant argued.
 * @export
 * @param {ChainId} id
 * @returns {Blockchain}
 */
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

/**
 * Calculate the decimaled value for an account's token balance.
 * @export
 * @param {number} amt
 * @param {number} decimals
 * @returns {number}
 */
export function toBalance(amt: number, decimals: number): number {
  return amt / 10 ** decimals;
}
