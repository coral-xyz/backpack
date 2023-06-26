import type { CustomTokenList } from "./types";

export const PolygonTokenList: CustomTokenList = {
  native: {
    address: "0x0000000000000000000000000000000000001010",
    coingeckoId: "matic-network",
    name: "Polygon",
    symbol: "MATIC",
    logo: "https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png?1624446912",
  },
  "0xc2132d05d31c914a87c6611c10748aeb04b58e8f": {
    address: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
    coingeckoId: "tether",
    logo: "https://assets.coingecko.com/coins/images/325/large/Tether.png?1668148663",
    name: "Tether",
    symbol: "USDT",
  },
};
