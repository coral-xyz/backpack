import { useRecoilValue } from "recoil";
import type { EthereumContext } from "@coral-xyz/common";
import * as atoms from "../../atoms";
import { useActiveEthereumWallet } from "../wallet";
import { useBackgroundClient } from "../client";

export function useEthersContext(): any {
  return useRecoilValue(atoms.ethersContext);
}

export function useEthereumFeeData(): any {
  return useRecoilValue(atoms.ethereumFeeData);
}

export function useEthereumCtx(): EthereumContext {
  const { publicKey } = useActiveEthereumWallet();
  const { provider } = useEthersContext();
  const backgroundClient = useBackgroundClient();
  const feeData = useEthereumFeeData();

  return {
    walletPublicKey: publicKey,
    provider,
    feeData,
    backgroundClient,
  };
}
