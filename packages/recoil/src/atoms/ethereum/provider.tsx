import { atom, selector } from "recoil";
import type { FeeData } from "@ethersproject/abstract-provider";
import { Blockchain, BackgroundEthereumProvider } from "@coral-xyz/common";
import { blockchainSettings } from "../blockchain";
import { providerBackgroundClient } from "../client";

export const ethersContext = selector({
  key: "ethersContext",
  get: ({ get }) => {
    const _providerBackgroundClient = get(providerBackgroundClient);
    const ethereumSettings = get(blockchainSettings(Blockchain.ETHEREUM));
    const provider = new BackgroundEthereumProvider(
      _providerBackgroundClient,
      ethereumSettings.connectionUrl
      // TODO
      // ethereumSettings.chainId
    );
    return {
      ...ethereumSettings,
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
