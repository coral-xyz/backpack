import { PublicKey } from "@solana/web3.js";
import { ethers } from "ethers";

import { EthereumConnectionUrl } from "../ethereum/connection-url";
import { EthereumExplorer } from "../ethereum/explorer";
import { SolanaCluster } from "../solana/cluster";
import { SolanaExplorer } from "../solana/explorer";
import type { EclipseData, EthereumData, SolanaData } from "../types";
import { Blockchain } from "../types";

export const BLOCKCHAIN_COMMON: Record<
  Blockchain,
  {
    PreferencesDefault: SolanaData | EclipseData | EthereumData;
    validatePublicKey: (address: string) => boolean;
  }
> = {
  [Blockchain.ETHEREUM]: {
    PreferencesDefault: {
      explorer: EthereumExplorer.DEFAULT,
      connectionUrl: EthereumConnectionUrl.DEFAULT,
      chainId: "", // TODO(peter) default chainId?
    },
    validatePublicKey: (address: string) => {
      try {
        ethers.utils.getAddress(address);
      } catch (e) {
        return false;
      }
      return true;
    },
  },
  [Blockchain.SOLANA]: {
    PreferencesDefault: {
      explorer: SolanaExplorer.DEFAULT,
      cluster: SolanaCluster.DEFAULT,
      commitment: "confirmed",
    },
    validatePublicKey: (address: string) => {
      try {
        new PublicKey(address);
      } catch (err) {
        return false;
      }
      return true;
    },
  },
  [Blockchain.ECLIPSE]: {
    PreferencesDefault: {
      explorer: "https://api.injective.eclipsenetwork.xyz:8899/",
      cluster: SolanaCluster.DEFAULT,
      commitment: "confirmed",
    },
    validatePublicKey: (address: string) => {
      try {
        new PublicKey(address);
      } catch (err) {
        return false;
      }
      return true;
    },
  },
};
