import type { TokenListEntry } from "./types";

export { EthereumTokenList } from "./ethereum";
export { SolanaTokenList } from "./solana";

export const BitcoinToken: Omit<TokenListEntry, "id"> = {
  address: "00000000000000000000000000",
  coingeckoId: "bitcoin",
  logo: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
  name: "Bitcoin",
  symbol: "BTC",
};
