import { Blockchain } from "@coral-xyz/common";
import { PublicKey } from "@solana/web3.js";

import type { BlockchainConfig } from "../../types/blockchain";
import { SolanaCluster } from "../solana/cluster";
import { SolanaExplorer } from "../solana/explorer";

const bip44CoinType = 501;
export const eclipseBlockchainConfig: BlockchainConfig<Blockchain.ECLIPSE> = {
  caip2Id: "solana:TBD_ECLISPE_GENESIS_HASH", // caip-2 "namespace:reference"
  caip2Namespace: "solana",
  caip2Reference: "TBD_ECLISPE_GENESIS_HASH",

  defaultRpcUrl: SolanaCluster.MAINNET,
  blowfishUrl:
    "https://blowfish.xnftdata.com/solana/v0/mainnet/scan/transactions",
  isTestnet: false,

  Enabled: false,
  Name: "Eclipse",
  Blockchain: Blockchain.ECLIPSE,
  GasTokenName: "ECL",
  GasTokenDecimals: 9,
  AppTokenName: "SPL",
  RampSupportedTokens: [],
  DerivationPathPrefix: "m/44'/501'",
  DerivationPathRequireHardening: true,
  DerivationPathOptions: [
    {
      label: "Backpack",
      pattern: "m/44'/501'/x'/0'",
    },
    {
      label: "Backpack Legacy",
      pattern: "m/44'/501'/0'/0'/x'",
    },
    {
      label: "Solana Legacy",
      pattern: "m/44'/501'/x'",
    },
    {
      label: "Ledger Live",
      pattern: "m/44'/501'/x'/0'/0'",
    },
  ],
  PreferencesDefault: {
    explorer: SolanaExplorer.DEFAULT,
    connectionUrl: "https://api.injective.eclipsenetwork.xyz:8899/",
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
  // todo
  logoUri:
    "https://s3.us-east-1.amazonaws.com/app-assets.xnfts.dev/images/useBlockchainLogo/solana.png",
  localLogoUri: "./eclipse.png",
  bip44CoinType,
  requiresChainId: false,
  RpcConnectionUrls: {
    MAINNET: {
      name: "Mainnet (Beta)",
      url: SolanaCluster.MAINNET,
    },
  },
  ConfirmationCommitments: {
    Processed: {
      commitment: "processed",
    },
    Confirmed: {
      commitment: "confirmed",
    },
    Finalized: {
      commitment: "finalized",
    },
  },
  Explorers: {
    "Solana Beach": {
      url: SolanaExplorer.SOLANA_BEACH,
    },
    "Solana Explorer": {
      url: SolanaExplorer.SOLANA_EXPLORER,
    },
    "Solana FM": {
      url: SolanaExplorer.SOLANA_FM,
    },
    Solscan: {
      url: SolanaExplorer.SOLSCAN,
    },
    XRAY: {
      url: SolanaExplorer.XRAY,
    },
  },
};
