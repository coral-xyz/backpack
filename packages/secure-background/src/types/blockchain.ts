import type { Blockchain, BlockchainPreferences } from "@coral-xyz/common";

export enum BlockchainWalletInitType {
  MNEMONIC = "mnemonic",
  PRIVATEKEY = "privateKey",
  PRIVATEKEY_DERIVED = "privatekey-derived",
  HARDWARE = "hardware",
}

export enum BlockchainWalletPreviewType {
  MNEMONIC = "mnemonic",
  MNEMONIC_NEXT = "mnemonic-next",
  PRIVATEKEY = "privateKey",
  HARDWARE = "hardware",
}
export enum BlockchainWalletDescriptorType {
  MNEMONIC = "mnemonic",
  PRIVATEKEY = "privateKey",
  HARDWARE = "hardware",
}

export type BlockchainWalletPublicKeyRequest<
  T extends BlockchainWalletPreviewType = BlockchainWalletPreviewType
> = T extends BlockchainWalletPreviewType.HARDWARE
  ? {
      type: T;
      device: "ledger";
      blockchain: Blockchain;
      derivationPaths: string[];
    }
  : T extends BlockchainWalletPreviewType.PRIVATEKEY
  ? {
      type: T;
      blockchain: Blockchain;
      privateKey: string;
    }
  : T extends BlockchainWalletPreviewType.MNEMONIC
  ? {
      type: T;
      blockchain: Blockchain;
      mnemonic?: string;
      derivationPaths: string[];
    }
  : T extends BlockchainWalletPreviewType.MNEMONIC_NEXT
  ? {
      type: T;
      blockchain: Blockchain;
      mnemonic?: string;
    }
  : never;

export type BlockchainWalletDescriptor<
  T extends BlockchainWalletDescriptorType = BlockchainWalletDescriptorType
> = T extends BlockchainWalletDescriptorType.HARDWARE
  ? {
      type: T;
      device: "ledger";
      blockchain: Blockchain;
      publicKey: string;
      imported: boolean;
      derivationPath: string;
    }
  : T extends BlockchainWalletDescriptorType.PRIVATEKEY
  ? {
      type: T;
      blockchain: Blockchain;
      publicKey: string;
      imported: boolean;
    }
  : T extends BlockchainWalletDescriptorType.MNEMONIC
  ? {
      type: T;
      blockchain: Blockchain;
      publicKey: string;
      imported: boolean;
      derivationPath: string;
    }
  : never;
export type BlockchainWalletInit<
  T extends BlockchainWalletInitType = BlockchainWalletInitType
> = T extends BlockchainWalletInitType.MNEMONIC
  ? {
      type: T;
      blockchain: Blockchain;
      mnemonic?: string;
      publicKey: string;
      derivationPath: string;
    }
  : T extends BlockchainWalletInitType.PRIVATEKEY_DERIVED
  ? {
      type: T;
      blockchain: Blockchain;
      mnemonic: string;
      publicKey: string;
      derivationPath: string;
      name?: string;
    }
  : T extends BlockchainWalletInitType.PRIVATEKEY
  ? {
      type: T;
      blockchain: Blockchain;
      publicKey: string;
      privateKey: string;
      name?: string;
    }
  : T extends BlockchainWalletInitType.HARDWARE
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
