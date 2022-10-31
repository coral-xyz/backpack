type WalletProvider = {
  providerInfo?: {
    label: string;
    injectedNamespace: string;
    iconURL: string;
    identityFlag?: string;
    checkIdentity?: () => boolean;
  };
  on: (
    eventName: string | symbol,
    listener: (...args: unknown[]) => void
  ) => unknown;
  removeListener: (
    eventName: string | symbol,
    listener: (...args: unknown[]) => void
  ) => unknown;
  [optionalProps: string]: unknown;
};

type BackpackProvider = WalletProvider & {
  isBackpack: true;
};

type WindowEthereum = WalletProvider & {
  isMetaMask?: boolean;
  autoRefreshOnNetworkChange?: boolean;
};

interface Window {
  walletRouter?: {
    currentProvider: WalletProvider;
    providers: WalletProvider[];
    getProviderInfo: (
      provider: WalletProvider
    ) => WalletProvider["providerInfo"];
    addProvider: (newProvider: WalletProvider) => void;
  };
  backpack?: BackpackProvider;
  ethereum?: WindowEthereum;
}
