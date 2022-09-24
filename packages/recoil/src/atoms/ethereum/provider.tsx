import { selector } from "recoil";
import { BackgroundEthereumProvider } from "@coral-xyz/common";
import { providerBackgroundClient } from "../client";
import { ethereumConnectionUrl } from "./preferences";
import { ethereumChainId } from "./preferences";

export const ethersContext = selector({
  key: "ethersContext",
  get: ({ get }) => {
    const connectionUrl = get(ethereumConnectionUrl);
    const chainId = get(ethereumChainId);
    const _providerBackgroundClient = get(providerBackgroundClient);
    const provider = new BackgroundEthereumProvider(
      _providerBackgroundClient,
      connectionUrl,
      chainId
    );
    return {
      chainId,
      connectionUrl,
      provider,
    };
  },
  // Ethers provider extends itself, there will be errors if this is disabled
  dangerouslyAllowMutability: true,
});

export const ethereumFeeData = selector({
  key: "ethereumFeeData",
  get: async ({ get }) => {
    const { provider } = get(ethersContext);
    return await provider.getFeeData();
  },
});
