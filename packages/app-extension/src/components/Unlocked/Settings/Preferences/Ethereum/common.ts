import type { ChannelAppUiClient } from "@coral-xyz/common";
import {
  Blockchain,
  UI_RPC_METHOD_BLOCKCHAIN_SETTINGS_UPDATE,
} from "@coral-xyz/common";
import { ethers } from "ethers";
const { hexlify } = ethers.utils;

export const changeNetwork = async (
  background: ChannelAppUiClient,
  connectionUrl: string,
  chainId?: string
) => {
  if (!chainId) {
    const provider = ethers.getDefaultProvider(connectionUrl);
    const network = await provider.getNetwork();
    chainId = hexlify(network.chainId);
  }

  await background.request({
    method: UI_RPC_METHOD_BLOCKCHAIN_SETTINGS_UPDATE,
    params: [Blockchain.ETHEREUM, { connectionUrl, chainId }],
  });
};
