import { getBlockchainForId } from "./blockchain";
import type { Nft, QueryResolvers, WalletBalances } from "./types";

export const queryResolver: QueryResolvers = {
  async balances(_, { chainId, address }): Promise<WalletBalances | null> {
    const bc = getBlockchainForId(chainId);
    return bc.getBalancesForAddress(address);
  },
  async nfts(_, { chainId, address }): Promise<Nft[] | null> {
    const bc = getBlockchainForId(chainId);
    return bc.getNftsForAddress(address);
  },
};
