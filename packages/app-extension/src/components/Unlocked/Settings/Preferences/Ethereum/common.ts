import type { ChannelAppUiClient } from "@coral-xyz/common";
import {
  Blockchain,
  UI_RPC_METHOD_CONNECTION_URL_UPDATE,
  UI_RPC_METHOD_ETHEREUM_CHAIN_ID_UPDATE,
} from "@coral-xyz/common";
import { ethers } from "ethers";
const { hexlify } = ethers.utils;

export const changeNetwork = async (
  background: ChannelAppUiClient,
  url: string,
  chainId?: string
) => {
  await background.request({
    method: UI_RPC_METHOD_CONNECTION_URL_UPDATE,
    params: [url, Blockchain.ETHEREUM],
  });

  if (!chainId) {
    const provider = ethers.getDefaultProvider(url);
    const network = await provider.getNetwork();
    chainId = hexlify(network.chainId);
  }

  await background.request({
    method: UI_RPC_METHOD_ETHEREUM_CHAIN_ID_UPDATE,
    params: [chainId],
  });
};
