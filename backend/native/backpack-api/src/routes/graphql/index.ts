import { queryResolvers, walletResolvers } from "./query";
import type { Resolvers } from "./types";

export const resolvers: Resolvers = {
  Query: queryResolvers,
  Wallet: walletResolvers,
};
