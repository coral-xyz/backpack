import type { CustomTokenList } from "./types";

export const PolygonTokenList: CustomTokenList = {
  native: {
    address: "0x0000000000000000000000000000000000000000",
    coingeckoId: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    logo: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
  },
  "0x0000000000000000000000000000000000001010": {
    address: "0x0000000000000000000000000000000000001010",
    coingeckoId: "matic-network",
    name: "Polygon",
    symbol: "MATIC",
    logo: "https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png?1624446912",
  },
};
