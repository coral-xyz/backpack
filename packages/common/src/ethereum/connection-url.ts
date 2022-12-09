import { ALCHEMY_ETHEREUM_MAINNET_API_KEY } from "../constants";

export const EthereumConnectionUrl = {
  MAINNET: `https://swr-data.xnfts.dev/ethereum-rpc-proxy/`,
  GOERLI:
    "https://eth-goerli.g.alchemy.com/v2/6QnM1O0pB17Qo47Cw9qMipDGWX7xAVWc",
  LOCALNET: "http://localhost:8545",

  DEFAULT:
    process.env.DEFAULT_ETHEREUM_CONNECTION_URL ||
    "https://swr-data.xnfts.dev/ethereum-rpc-proxy/",
};
