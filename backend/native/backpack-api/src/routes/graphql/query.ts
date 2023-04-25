import { getBlockchainForId } from "./blockchain";
import type {
  Nft,
  QueryResolvers,
  QueryWalletArgs,
  Wallet,
  WalletBalances,
  WalletResolvers,
} from "./types";

export const queryResolvers: QueryResolvers = {
  async wallet(_, __, ___, ____): Promise<Wallet | null> {
    return {};
  },
};

export const walletResolvers: WalletResolvers = {
  async balances(_, __, ___, info): Promise<WalletBalances | null> {
    if (info.path.prev?.key !== "wallet") return null;
    const { address, chainId } = info.variableValues as QueryWalletArgs;
    return getBlockchainForId(chainId).getBalancesForAddress(address);
  },

  async nfts(_, __, ___, info): Promise<Nft[] | null> {
    if (info.path.prev?.key !== "wallet") return null;
    const { address, chainId } = info.variableValues as QueryWalletArgs;
    return getBlockchainForId(chainId).getNftsForAddress(address);
  },
};
