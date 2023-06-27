import type { TokenListEntry } from "./types";

export { EclipseTokenList } from "./eclipse";
export { EthereumTokenList } from "./ethereum";
export { PolygonTokenList } from "./polygon";
export { SolanaTokenList } from "./solana";
export type { CustomTokenList } from "./types";

export const BitcoinToken: Omit<TokenListEntry, "id"> = {
  address: "00000000000000000000000000",
  coingeckoId: "bitcoin",
  logo: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
  name: "Bitcoin",
  symbol: "BTC",
};
