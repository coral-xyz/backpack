import { selector } from "recoil";
import { ethers, BigNumber } from "ethers";
import { ethereumConnectionUrl } from "./preferences";

export const ethersContext = selector({
  key: "ethersContext",
  get: async ({ get }) => {
    const connectionUrl = get(ethereumConnectionUrl);
    const provider = new ethers.providers.JsonRpcProvider(connectionUrl);
    return {
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
