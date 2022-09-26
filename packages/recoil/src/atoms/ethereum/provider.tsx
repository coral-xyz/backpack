import { atom, selector } from "recoil";
import { BigNumber } from "ethers";
import type { FeeData } from "@ethersproject/abstract-provider";
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

export const ethereumFeeData = atom<FeeData>({
  key: "ethereumFeeData",
  default: selector({
    key: "ethereumFeeDataDefault",
    get: async ({ get }) => {
      const { provider } = get(ethersContext);
      const feeData = await provider.getFeeData();
      // BigNumberify everything
      return {
        gasPrice: BigNumber.from(feeData.gasPrice),
        maxFeePerGas: BigNumber.from(feeData.maxFeePerGas),
        maxPriorityFeePerGas: BigNumber.from(feeData.maxPriorityFeePerGas),
      } as FeeData;
    },
  }),
});
