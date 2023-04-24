import { getBlockchainForId } from "./blockchain";
import type { QueryResolvers, WalletBalances } from "./types";

export const queryResolver: QueryResolvers = {
  async balances(_, { chainId, address }): Promise<WalletBalances | null> {
    const bc = getBlockchainForId(chainId);
    return bc.getBalancesForAddress(address);
  },
};
