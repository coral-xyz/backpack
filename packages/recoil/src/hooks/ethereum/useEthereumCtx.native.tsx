import type { EthereumContext } from "@coral-xyz/secure-clients/legacyCommon";
import type { FeeData } from "@ethersproject/abstract-provider";
import { BigNumber, ethers } from "ethers";
import { useRecoilValue } from "recoil";

import * as atoms from "../../atoms";
import { useBackgroundClient } from "../client";
import { useActiveEthereumWallet } from "../wallet";

const { AddressZero } = ethers.constants;

export function useEthersContext(): any {
  return useRecoilValue(atoms.ethersContext);
}

export function useEthereumFeeData(): any {
  const feeData = useRecoilValue(atoms.ethereumFeeData);
  return {
    gasPrice: BigNumber.from(feeData.gasPrice),
    maxFeePerGas: BigNumber.from(feeData.maxFeePerGas),
    maxPriorityFeePerGas: BigNumber.from(feeData.maxPriorityFeePerGas),
  } as FeeData;
}

export function useEthereumCtx(): EthereumContext {
  const wallet = useActiveEthereumWallet();
  const { provider, chainId } = useEthersContext();
  const backgroundClient = useBackgroundClient();
  const feeData = useEthereumFeeData();

  return {
    walletPublicKey: wallet ? wallet.publicKey : AddressZero,
    provider,
    chainId,
    feeData,
    backgroundClient,
    ethereumClient: null,
  };
}
