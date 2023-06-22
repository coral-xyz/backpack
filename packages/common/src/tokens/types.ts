export type TokenListEntry = {
  __typename?: "TokenListEntry";
  /** The mint or contract address of the token. */
  address: string;
  /** The Coingecko market listing ID. */
  coingeckoId?: string;
  /** The logo associated with the token. */
  logo?: string;
  /** The registered name of the token. */
  name: string;
  /** The registered symbol of the token. */
  symbol: string;
};
