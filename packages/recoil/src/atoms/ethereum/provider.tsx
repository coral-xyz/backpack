import { BackgroundEthereumProvider } from "@coral-xyz/common";
import type { FeeData } from "@ethersproject/abstract-provider";
import { atom, selector } from "recoil";

import { providerBackgroundClient } from "../client";

import { ethereumChainId, ethereumConnectionUrl } from "./preferences";

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

export const ethereumFeeData = atom<FeeData>({
  key: "ethereumFeeData",
  default: selector({
    key: "ethereumFeeDataDefault",
    get: ({ get }) => {
      const { provider } = get(ethersContext);
      return provider.getFeeData();
    },
  }),
});
