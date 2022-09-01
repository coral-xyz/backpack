import { ALCHEMY_ETHEREUM_MAINNET_API_KEY } from "../constants";

export const EthereumConnectionUrl = {
  MAINNET: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_ETHEREUM_MAINNET_API_KEY}`,
  TESTNET:
    "https://eth-goerli.g.alchemy.com/v2/6QnM1O0pB17Qo47Cw9qMipDGWX7xAVWc",
  LOCALNET: "http://localhost:8545",

  DEFAULT:
    process.env.DEFAULT_ETHEREUM_CONNECTION_URL ||
    "https://eth-mainnet.g.alchemy.com/v2/DlJr6QuBC2EaE-L60-iqQQGq9hi9-XSZ",
};
