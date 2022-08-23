import { selector } from "recoil";
import { ethers } from "ethers";
import { ethereumConnectionUrl } from "./preferences";

export const ethersContext = selector({
  key: "ethersContext",
  get: ({ get }) => {
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
