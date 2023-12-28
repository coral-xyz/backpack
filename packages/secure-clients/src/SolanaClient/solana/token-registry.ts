import type { TokenInfo } from "@solana/spl-token-registry";
import { TokenListProvider } from "@solana/spl-token-registry";

import { SOL_NATIVE_MINT, WSOL_MINT } from "./programs";

export const SOL_LOGO_URI =
  "https://assets.coingecko.com/coins/images/4128/large/solana.png?1640133422";

const BERN_MINT = "CKfatsPMUf8SkiURsDXs7eK6GWb4Jsd6UDbs7twMCWxo";

export type TokenRegistry = Map<string, TokenInfo>;

export async function getTokenRegistry(): Promise<TokenRegistry> {
  const tokens = await new TokenListProvider().resolve();
  const tokenList = tokens
    .filterByClusterSlug("mainnet-beta") // TODO: get network atom.
    .getList();
  const tokenMap = tokenList.reduce((map, item) => {
    if (item.address === WSOL_MINT) {
      map.set(item.address, { ...item, symbol: "wSOL" });
    } else {
      map.set(item.address, item);
    }
    return map;
  }, new Map());
  tokenMap.set(SOL_NATIVE_MINT, {
    name: "Solana",
    address: SOL_NATIVE_MINT,
    chainId: 101,
    decimals: 9,
    symbol: "SOL",
    logoURI: SOL_LOGO_URI,
    extensions: {
      coingeckoId: "solana",
    },
  });
  tokenMap.set(BERN_MINT, {
    name: "Bonk Earn",
    address: BERN_MINT,
    chainId: 101,
    decimals: 9,
    symbol: "BERN",
    logoURI: "https://i.imgur.com/nd9AVZ4.jpeg",
  });
  return tokenMap;
}
