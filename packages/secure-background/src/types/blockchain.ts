import type { Blockchain, BlockchainPreferences } from "@coral-xyz/common";

type BIPPath = any; // string?

export enum BlockchainWalletType {
  MNEMONIC = "mnemonic",
  PRIVATEKEY = "privateKey",
  HARDWARE = "hardware",
  MNEMONIC_IMPORT = "mnemonic-import",
  MNEMONIC_NEXT = "mnemonic-next",
}

export type BlockchainWalletInit<
  T extends BlockchainWalletType = BlockchainWalletType
> = T extends BlockchainWalletType.MNEMONIC
  ? {
      type: T;
      blockchain: Blockchain;
      mnemonic?: string;
      publicKey: string;
      derivationPath: string;
    }
  : T extends BlockchainWalletType.MNEMONIC_NEXT
  ? {
      type: T;
      blockchain: Blockchain;
    }
  : T extends BlockchainWalletType.MNEMONIC_IMPORT
  ? {
      type: T;
      blockchain: Blockchain;
      mnemonic: string;
      publicKey: string;
      derivationPath: string;
      name?: string;
    }
  : T extends BlockchainWalletType.PRIVATEKEY
  ? {
      type: T;
      blockchain: Blockchain;
      publicKey: string;
      privateKey: string;
      name?: string;
    }
  : T extends BlockchainWalletType.HARDWARE
  ? {
      type: T;
      device: "ledger";
      blockchain: Blockchain;
      publicKey: string;
      derivationPath: string;
    }
  : never;

export type BlockchainConfig<B extends Blockchain = Blockchain> = {
  caip2Id: string; // caip-2 "namespace:reference"
  caip2Namespace: string;
  caip2Reference: string;

  defaultRpcUrl: string;
  blowfishUrl: string;
  isTestnet: boolean;

  ConfirmationCommitments?: {
    [name: string]: {
      commitment: "processed" | "confirmed" | "finalized";
    };
  };
  Explorers?: {
    [name: string]: {
      url: string;
    };
  };

  Enabled: boolean;
  Blockchain: B;
  PreferencesDefault: BlockchainPreferences;

  Name: string;
  AppTokenName: string;
  GasTokenName: string;
  GasTokenDecimals: number;

  RampSupportedTokens: Array<{
    title: string;
    icon: string;
    subtitle: string;
  }>;

  DerivationPathPrefix: string;
  DerivationPathRequireHardening: boolean;
  DerivationPathOptions: Array<{
    path: (i: number) => BIPPath;
    label: string;
    pattern: string;
  }>;

  validatePublicKey: (address: string) => boolean;
  logoUri: string;

  localLogoUri: string;
  bip44CoinType: number;
  requiresChainId: boolean;
  RpcConnectionUrls: {
    [network: string]: {
      name: string;
      url: string;
      chainId?: string;
    };
  };
};
