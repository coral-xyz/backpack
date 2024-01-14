import { Blockchain } from "@coral-xyz/common";
import type { FeeData } from "@ethersproject/abstract-provider";
import { BigNumber } from "ethers5";
import type { Provider } from "ethers6";
import { atom, selector } from "recoil";

import { blockchainChainId, blockchainConnectionUrl } from "../preferences";
import { ethereumClientAtom } from "../secure-client";

export const ethersContext = selector<{
  chainId?: string;
  connectionUrl?: string;
  provider?: Provider;
}>({
  key: "ethersContext",
  get: ({ get }) => {
    const ethereumClient = get(ethereumClientAtom);
    const connectionUrl = get(blockchainConnectionUrl(Blockchain.ETHEREUM));
    const chainId = get(blockchainChainId(Blockchain.ETHEREUM));
    const provider = ethereumClient?.provider;
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
      const feeData = await provider?.getFeeData();
      return {
        lastBaseFeePerGas: null,
        maxFeePerGas: BigNumber.from(feeData?.maxFeePerGas) ?? null,
        maxPriorityFeePerGas:
          BigNumber.from(feeData?.maxPriorityFeePerGas) ?? null,
        gasPrice: BigNumber.from(feeData?.gasPrice) ?? null,
      };
    },
  }),
});
