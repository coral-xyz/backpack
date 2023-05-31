import type { Blockchain } from "@coral-xyz/common";
export type Background = {
  _serverUi: Handle;
  _solanaConnection: Handle;
  _serverInjected?: Handle;
  _ethereumConnection: Handle;
};

export type Config = {
  isMobile: boolean;
};

// Opaque handle.
export type Handle = any;

export type CachedValue<T> = {
  ts: number;
  value: T;
};

type NamedPublicKeys = Array<{
  name: string;
  publicKey: string;
  isCold?: boolean;
}>;

export type PublicKeyType = {
  [blockchain: string]: {
    hdPublicKeys: NamedPublicKeys;
    importedPublicKeys: NamedPublicKeys;
    ledgerPublicKeys: NamedPublicKeys;
  };
};

export type PublicKeyData = {
  activeBlockchain: Blockchain;
  activePublicKeys: string[];
  publicKeys: PublicKeyType;
};
