import { useRecoilValue } from "recoil";
import { ethers } from "ethers";
import type { EthereumContext } from "@coral-xyz/common";
import * as atoms from "../../atoms";
import { useActiveEthereumWallet } from "../wallet";
import { useBackgroundClient } from "../client";

const { AddressZero } = ethers.constants;

export function useEthersContext(): any {
  return useRecoilValue(atoms.ethersContext);
}

export function useEthereumFeeData(): any {
  return useRecoilValue(atoms.ethereumFeeData);
}

export function useEthereumCtx(): EthereumContext {
  const wallet = useActiveEthereumWallet();
  const { provider } = useEthersContext();
  const backgroundClient = useBackgroundClient();
  const feeData = useEthereumFeeData();

  return {
    walletPublicKey: wallet ? wallet.publicKey : AddressZero,
    provider,
    feeData,
    backgroundClient,
  };
}
