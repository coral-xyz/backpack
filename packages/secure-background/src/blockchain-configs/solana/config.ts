import { Blockchain } from "@coral-xyz/common";
import { backpackIndexed } from "@coral-xyz/secure-background/legacyCommon";
import { PublicKey } from "@solana/web3.js";

import {
  legacyBip44ChangeIndexed,
  legacyBip44Indexed,
  legacySolletIndexed,
} from "../../keyring/derivationPaths";
import type { BlockchainConfig } from "../../types/blockchain";

import { SolanaCluster } from "./cluster";
import { SolanaExplorer } from "./explorer";
const remoteLogoUri =
  "https://s3.us-east-1.amazonaws.com/app-assets.xnfts.dev/images/useBlockchainLogo/solana.png";
const bip44CoinType = 501;

export const solanaBlockchainConfig: BlockchainConfig<Blockchain.SOLANA> = {
  caip2Id: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp", // caip-2 "namespace:reference"
  caip2Namespace: "solana",
  caip2Reference: "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",

  defaultRpcUrl: SolanaCluster.MAINNET,
  blowfishUrl:
    "https://blowfish.xnftdata.com/solana/v0/mainnet/scan/transactions",
  isTestnet: false,

  Enabled: true,
  Blockchain: Blockchain.SOLANA,
  Name: "Solana",
  GasTokenName: "SOL",
  GasTokenDecimals: 9,
  AppTokenName: "SPL",

  RampSupportedTokens: [
    {
      title: "SOL",
      icon: remoteLogoUri,
      subtitle: "Solana",
    },
  ],
  DerivationPathPrefix: "m/44'/501'",
  DerivationPathRequireHardening: true,
  DerivationPathOptions: [
    {
      path: (i: number) => backpackIndexed(501, i, 0),
      label: "Backpack",
      pattern: "m/44'/501'/x'/0'",
    },
    {
      path: (i: number) => backpackIndexed(501, 0, i),
      label: "Backpack Legacy",
      pattern: "m/44'/501'/0'/0'/x'",
    },
    {
      path: (i: number) => legacyBip44Indexed(501, i),
      label: "Solana Legacy",
      pattern: "m/44'/501'/x'",
    },
    {
      path: (i: number) => legacyBip44ChangeIndexed(501, i) + "/0'",
      label: "Ledger Live",
      pattern: "m/44'/501'/x'/0'/0'",
    },
  ],
  // Note: We only allow importing the deprecated sollet derivation path for
  //       hot wallets. This UI is hidden behind a local storage flag we
  //       expect people to manually set, since this derivation path was only
  //       used by mostly technical early Solana users.
  // .concat(
  //   window.localStorage.getItem("sollet")
  //     ? [
  //       {
  //         path: (i: number) => legacySolletIndexed(i),
  //         label: "501'/0'/0/0 (Deprecated)",
  //       },
  //     ]
  //     : []
  // ),
  PreferencesDefault: {
    explorer: SolanaExplorer.DEFAULT,
    connectionUrl: SolanaCluster.DEFAULT,
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
  logoUri: remoteLogoUri,
  bip44CoinType: bip44CoinType,
  localLogoUri: "./solana.png",
  requiresChainId: false,
  RpcConnectionUrls: {
    MAINNET: {
      name: "Mainnet (Beta)",
      url: SolanaCluster.MAINNET,
    },
    // DEVNET: {
    //   name: "Devnet",
    //   url: SolanaCluster.DEVNET,
    // },
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
