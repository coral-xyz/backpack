interface RequestArguments {
  readonly method: string;
  readonly params?: readonly unknown[] | object;
}

export interface EIP1193Provider {
  on: (
    eventName: string | symbol,
    listener: (...args: unknown[]) => void
  ) => unknown;
  removeListener: (
    eventName: string | symbol,
    listener: (...args: unknown[]) => void
  ) => unknown;
  request(args: RequestArguments): Promise<unknown>;
  [optionalProps: string]: unknown;
}

export interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

export interface EIP6963AnnounceProviderEvent extends CustomEvent {
  type: "eip6963:announceProvider";
  detail: EIP6963ProviderDetail;
}

export interface EIP6963RequestProviderEvent extends Event {
  type: "eip6963:requestProvider";
}

export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: EIP1193Provider;
}

export type WindowEthereum = EIP1193Provider & {
  isMetaMask?: boolean;
  isBackpack?: boolean;
  autoRefreshOnNetworkChange?: boolean;
};

declare global {
  interface Window {
    walletRouter?: {
      currentProvider: EIP1193Provider;
      providers: EIP1193Provider[];
      getProviderInfo: (
        provider: EIP1193Provider
      ) => EIP1193Provider["providerInfo"];
      addProvider: (newProvider: EIP1193Provider) => void;
    };
    ethereum?: WindowEthereum;
  }
}
